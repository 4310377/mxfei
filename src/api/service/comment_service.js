import LC from 'leancloud-storage';  // 导入 leancloud 数据存储模块
import BaseService from './base_service';  // 导入访问 leancloud 数据存储的基类


const TABLE_NAME = 'Comment';    // leancloud 中存储数据的表名(Class)

/**
 * 对leancloud应用中 名为 "Comment" 的 Class 进行数据操作的类
 */
class CommentService extends BaseService {
    constructor(table_name) {
        // 调用父类的构造函数
        super(table_name);
        // 当前子类的属性 this.TABLE_NAME
        this.TABLE_NAME = table_name;
    }
}

/**
 * 发表评论
 * @param {*} topicId 被评论的话题 id
 * @param {*} content 评论的内容
 * @returns 
 */
CommentService.prototype.newComment = async function (topicId, content) {
    try {
        // 根据 topicId 找出被评论的话题
        let topic = LC.Object.createWithoutData('Topic', topicId);
        // 创建保存评论内容的 Class
        let Collection = LC.Object.extend(this.TABLE_NAME);
        // 创建评论的内容对象
        let query = new Collection({
            "topic": topic,      // 评论的话题
            "content": content,  // 评论的内容
            "invisible": false,  // 不可见，如果为 true 就隐藏该评论
            "createdBy": await this.currentUser(),   // 评论者
        });
        let response = await query.save();  // 保存评论数据 
        if (response) {
            topic.increment('reply', 1);    // 评论数加一
            topic.set('lastRepliedAt', new Date()); // 更新最后评论时间
            let resp = await topic.save();  // 保存
            console.log('发了评论的 topic ：', resp);
            return response;
        }
    } catch (e) {
        console.log('添加评论失败：', e.code, e);
    }
    return null;
}

/**
 * 查询指定 id 的话题的评论内容
 * @param {*} topicId 话题 id
 * @param {*} limit 每页大小
 * @param {*} skip 跳过记录数
 * @param {*} sort_field 单个排序字段名(降序加负号) 默认按创建时间升序
 */
CommentService.prototype.getCommentByTopic = async function (topicId, limit = 5, skip = 0, sort_field = 'createdAt') {
    try {
        let query = new LC.Query(this.TABLE_NAME);
        const topic = LC.Object.createWithoutData('Topic', topicId);  // 根据 id 获取话题
        query.include('createdBy');
        query.equalTo('topic', topic);       // 关系查询
        // 排序属性： this.isMinus()  是父类中定义的方法，判断排序的字段是否 负号 开头
        if (this.isMinus(sort_field)) {
            console.log(sort_field, sort_field.substr(1));
            // 去掉负号后的字段名降序
            query.descending(sort_field.substr(1));
        }
        else {
            query.ascending(sort_field);  // 升序
        }

        let total = await query.count();   // 返回记录总数       
        // 分页查询参数
        let response = await query.limit(limit).skip(skip).find();
        // let response = await query.find();
        console.log('getCommentByTopic:', total, response);
        return {
            "status_code": "ok",
            "totalCount": total,
            "reslut": response,
        }
    } catch (e) {
        console.log('查询数据错误：', e.code, e);
        return {
            "status_code": e.code,
            "totalCount": 0,
            "reslut": e,
        };
    }
}

// 导出子类时使用 new 直接进行实例化
export default new CommentService(TABLE_NAME);