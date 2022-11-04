import LC from 'leancloud-storage';  // 导入 leancloud 数据存储模块
import BaseService from './base_service';  // 导入访问 leancloud 数据存储的基类


const TABLE_NAME = 'Topic';    // leancloud 中存储数据的表名(Class)

/**
 * 对leancloud应用中 名为 "Topic" 的 Class 进行数据操作的类
 */
class TopicService extends BaseService {
    constructor(table_name) {
        // 调用父类的构造函数
        super(table_name);
        // 当前子类的属性 this.TABLE_NAME
        this.TABLE_NAME = table_name;
    }
}

/**
 * 查询指定 id 的论坛话题
 * @param {*} id 
 */
TopicService.prototype.getTopicById = async function (id) {
    try {
        let query = new LC.Query(this.TABLE_NAME);
        // include("createdBy", "lastEditor") 或者 include(["createdBy", "lastEditor"]) 都可以
        query.include(["createdBy", "lastEditor"]);
        let response = await query.get(id);
        console.log(response);
        return {
            "status_code": "ok",
            "reslut": response,
        }
    } catch (e) {
        console.log('查询数据错误：', e.code, e);
        return {
            "status_code": e.code,
            "reslut": e,
        };
    }
}

/**
 * 指定 id 的话题 查看次数加1
 * @param {*} id 
 * @returns 
 */
TopicService.prototype.viewsInc = async function (id) {
    try {
        let topic = LC.Object.createWithoutData(this.TABLE_NAME, id);
        // 原子操作 来增加或减少一个属性内保存的数字    
        topic.increment('views', 1);
        let response = await topic.save();
        return response;
    } catch (e) {
        console.log('修改数据错误：', e.code, e);
    }
    return null;
}


// 导出子类时使用 new 直接进行实例化
export default new TopicService(TABLE_NAME);