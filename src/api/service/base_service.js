import LC from 'leancloud-storage';  // 导入 leancloud 数据存储模块


/**
 * Leancloud 数据存储的基类
 * 所有函数使用 async/await 实现异步操作
 * 虽然有个别函数不需要使用异步，但调用时难以区分，所以就全部都加上异步了
 * 调用时，函数名前面一定要加上 await， 否则得不到正确的结果
 */
class BaseService {
    /**
     * 构造函数
     * @param {*} table_name 
     */
    constructor(table_name) {
        this.TABLE_NAME = table_name;
    }

    /**
     获取所有数据
     * @param {*} limit 每页记录数量
     * @param {*} skip 跳过记录数    
     * @param {*} include 关联到其他 Class 的字段名，例如: 'createdBy', 'lastEditor'
     * @param {*} sort_fields 降序排列的排序字段名列表，例如：['-level', '-updatedAt']， 降序的字段名前面加负号
     * sort_fields 和 include 的默认值都是： []， 只包含一个字段时也要加： []
     * @returns 
     */
    async fetchAll(limit = 10, skip = 0, include = [], sort_fields = []) {
        try {
            let query = new LC.Query(this.TABLE_NAME);
            if (include[0]) {
                // 关联查询其他表
                query.include(include);
            }

            // 判断是否包含排序的字段名
            if (sort_fields.length > 0) {
                for (let i = 0; i < sort_fields.length; i++) { 
                    // 多字段排序时， 第一个排序字段 和之后用的方法名不同
                    if (i === 0) {
                        if (this.isMinus(sort_fields[0])) {                            
                            // 去掉负号后的字段名降序
                            query.descending(sort_fields[0].substr(1));
                        }
                        else {
                            query.ascending(sort_fields[0]);  // 升序
                        }
                    } else {
                        // 第二个及以后的排序字段和第一个字段调用的方法不一样
                        if (this.isMinus(sort_fields[i])) {                            
                            // 去掉负号后的字段名降序
                            query.addDescending(sort_fields[i].substr(1));
                        }
                        else {
                            query.addAscending(sort_fields[i]);  // 升序
                        }
                    }
                }
            }
            let total = await query.count();   // 记录总数           
            // 分页查询的结果 
            let response = await query.limit(limit).skip(skip).find();
            // 返回的查询结果由三个部分组成;
            return {
                "status_code": "ok",  // 返回结果中的状态码
                "totalCount": total,  // 记录总数
                "reslut": response,   // 返回的记录
            };
        } catch (e) {
            console.log('查询数据错误：', e.code, e);
            return {
                "status_code": e.code,
                "totalCount": 0,
                "reslut": e,
            };
        }

    }


    /**
     * 添加数据
     * @param {*} data 以对象形式提供的数据 
     * @returns 创建成功的对象
     */
    async create(data) {
        try {
            let Collection = LC.Object.extend(this.TABLE_NAME);
            let query = new Collection(data);
            let response = await query.save();
            return response;
        } catch (e) {
            console.log('添加数据错误：', e.code, e);
        }
        return null;
    }

    /**
     * 修改记录
     * @param {*} id 记录的id
     * @param {*} data 除 id 以外的其他字段组成的对象类型数据
     */
    async update(id, data) {
        try {
            let query = LC.Object.createWithoutData(this.TABLE_NAME, id);
            query.set(data);  // 修改数据
            let response = await query.save();
            return response;
        } catch (e) {
            console.log('修改数据错误：', e.code, e);
        }
        return null;
    }

    /**
     * 批量修改数据
     * @param {*} items 包含待更新值的记录数组
     * @returns 
     */
    async updateBatch(items) {
        console.log('items:', items);
        try {
            // map遍历数组，由返回值组成一个新数组, 原数组不变
            let id_list = items.map(item => { return item.id });
            let query = new LC.Query(this.TABLE_NAME);
            let response = await query
                .containedIn('objectId', id_list)
                .find();
            // map() 遍历数组，不改变原数组
            let result = response.map(item => {
                let data = items.find(it => {
                    console.log('update batch:', it);
                    return it.id === item.id
                });
                // console.log('update batch:', data);             
                item.set(data);
                return item;
            });
            return await LC.Object.saveAll(result);
        } catch (e) {
            console.log('批量修改数据错误：', e.code, e);
        }
        return null;
    }

    /**
     * 删除数据
     * @param {*} id 
     * @returns 
     */
    async delete(id) {
        try {
            let query = LC.Object.createWithoutData(this.TABLE_NAME, id);
            let response = await query.destroy();
            return response;
        } catch (e) {
            console.log('删除数据错误：', e.code, e);
        }
        return null;
    }


    /**
     * 批量删除，先按 id 查询出所删除的数据，再调用destroyAll() 进行删除
     * 其他批量操作类似
     * @param {*} items 待删除记录的数组
     * @returns 
     */
    async deleteBatch(items) {
        try {
            // 从要删除的记录中取出 id 值，组成一个新数组
            let id_list = items.map(item => { return item.id });
            let query = new LC.Query(this.TABLE_NAME);
            // 根据多个 id 组成的数组查询符合条件的记录
            let response = await query
                .containedIn('objectId', id_list)
                .destroyAll();
            console.log('deleteBatch:', response)
            return true;
        } catch (e) {
            console.log('批量删除数据错误：', e.code, e);
        }
        return null;
    }

    /**
     * 检查指定的字段值是否已经存在, 字母区分大小写
     * @param {*} field 字段名
     * @param {*} val 字段值
     * @returns 字段值已存在，返回 true， 否则返回 false
     */
    async existsFieldValue(field = 'title', val) {
        try {
            let query = new LC.Query(this.TABLE_NAME);
            let count = await query.equalTo(field, val).count();
            console.log(count);
            return count > 0;
        } catch (e) {
            console.log('查询错误：', e.code, e);
        }
        return false;
    }

    /**
     * 当前已登录用户
     * @returns 返回当前已登录用户
     */
    async currentUser() {
        return LC.User.current();
    }


    /**
     * 判断字符串是不是负号开头, 以便确定是升序还是降序
     * @param {*} val 
     * @returns 负号：true; 非负号： false
     */
    isMinus(val) {
        if (val[0] === '-') {
            return true;
        }
        return false;
    }
}

export default BaseService;
