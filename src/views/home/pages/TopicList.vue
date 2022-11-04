<template>
    <div>
        <el-row type="flex" justify="center" align="middle">
            <el-col :lg="18" :md="20" :sm="24">
                <div class="shadow">
                    <el-row type="flex" align="middle" class="topic-title">
                        <el-col style="text-align:center">标题</el-col>
                        <el-col style="width:100px;" class="hidden-md-and-down">查看</el-col>
                        <el-col style="width:100px;" class="hidden-md-and-down">评论</el-col>
                        <el-col
                            style="width:290px; text-align:center;"
                            class="hidden-sm-and-down"
                        >最后评论</el-col>
                    </el-row>
                    <div v-for="(item,index) in topics" :key="index" id="topic" class="topic-item">
                        <el-row type="flex" justify="center" align="middle" class="spacer">
                            <el-col :class="{ top: item.level > 0 }">
                                <span v-if="item.level > 0">[置顶]</span>
                                <span v-else>[话题]</span>
                                <router-link
                                    :to="{ name: 'Detail', params: { id: item.id } }"
                                >{{ item.title }}</router-link>
                            </el-col>
                            <el-col style="width:100px;" class="hidden-md-and-down">{{ item.views }}</el-col>
                            <el-col style="width:100px;" class="hidden-md-and-down">{{ item.reply }}</el-col>
                            <el-col style="width:290px;" class="hidden-sm-and-down">
                                <span>{{ item.lastEditor.username }}</span>
                                <br />
                                <span
                                    style="color:#a0a0a0;font-size:14px;"
                                >{{ item.lastRepliedAt | datetimeFormat }}</span>
                            </el-col>
                        </el-row>
                    </div>
                    <div class="horiz-container pagination">
                        <div class="spacer"></div>
                        <el-pagination
                            background
                            @size-change="getTopics"
                            @current-change="getTopics"
                            layout="total, sizes, prev, pager, next, jumper"
                            :total="totalCount"
                            :page-sizes="[5, 10, 20, 30]"
                            :page-size.sync="pageSize"
                            :current-page.sync="currentPage"
                        ></el-pagination>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import TopicService from '../../../api/service/topic_service';
import moment from 'moment';
export default {
    name: 'TopicList',
    data: () => ({
        topics: [],          // 从服务器取回的一页数据 
        pageSize: 10,        // 每页大小
        currentPage: 1,      // 当前页
        totalCount: 0,       // 总记录数量
    }),
    mounted() {
        this.getTopics();    // 获取论坛话题
    },
    methods: {
        async getTopics() {
            this.loading = true;
            this.topics = [];  // 清空数据
            let skip = (this.currentPage - 1) * this.pageSize;
            // 查询当前页的数据，
            let response = await TopicService.fetchAll(this.pageSize, skip, ["createdBy", "lastEditor"], ['-level', '-lastRepliedAt']);
            if (response.status_code === 'ok') {
                console.log(response);
                this.totalCount = response.totalCount;   // 总记录数
                // 返回当前页所有数据的结果 
                this.topics = response.reslut.map(item => { return this.toJson(item) });
            }
            this.loading = false;
        },

        // 获取用户中各个字段的值， 可以根据需要添加
        getUser(user) {
            // console.log(user);
            return {
                id: user.id,
                username: user.get("username"),
                email: user.get("email"),
            }
        },

        // 将从服务器端取到的数据不能直接使用，转为对象格式的数据
        toJson(item) {
            return {
                id: item.id,   // leancloud Class 自带属性，对应 leanclud Class 中的 "ObjectId", 可以用".id"直接引用
                title: item.get('title'),
                content: item.get('content'),
                views: item.get('views'),
                reply: item.get('reply'),
                level: item.get('level'),
                lastRepliedAt: item.get('lastRepliedAt'),
                createdAt: item.createdAt,  // leancloud Class 自带属性,创建时间,不能修改值
                updatedAt: item.updatedAt,   // leancloud Class 自带属性,最后修改时间,只能leancloud 自动修改

                /**
                 * createdBy、lastEditor 指向另一个表的字段, 默认只能得到该字段在关联表中的id 值
                 * 要得到完整值， 查询时字段名要包含在 include 中，
                 * 取值时，要先判断是否为空，如果为空，取值会抛出异常，
                 */
                createdBy: item.get("createdBy")
                    ? this.getUser(item.get("createdBy"))
                    : "",
                lastEditor: item.get("lastEditor")
                    ? this.getUser(item.get("lastEditor"))
                    : "",
            }
        },

        /**
       * 自定义用于局部区域显示 loading 的函数
       * @param {*} targetNode  目标区域的选择器，建设使用 id 选择器
       * @returns 
       */
        showLoading(targetNode, message) {
            this.loading = Loading.service({
                // 锁定屏幕的滚动
                lock: true,
                // 显示的文本
                text: message,
                // document.querySelector 用于以获取到对应 DOM 节点
                target: document.querySelector(targetNode),
            });
        },

        // 停止显示 loading
        endLoading() {
            this.loading.close();
        }

    },

    // 过滤器
    filters: {
        // 使用 moment.js 定义日期时间过滤器函数   
        datetimeFormat(val) {
            let now = new Date();
            //  计算两个时间相差的天数
            let days = moment(now).diff(moment(val), 'days');
            if (days <= 3) {
                // 小于三天的返回格式：1小时前
                return moment(val).fromNow();
            }
            // 三天以上的返回日期时间
            return moment(val).format("lll");
        },
    },

}
</script>

<style>
/* 标题行的样式 */
.topic-title {
    background-color: #f1f4f8;
    padding-top: 20px;
    padding-bottom: 20px;
    font-size: 14px;
    font-weight: bold;
    border-top: 2px solid #1985db;
    border-bottom: 1px solid #a0a0a0;
}

/* 置顶话题的样式 */
.top {
    font-weight: bold;
}

/* 置顶话题超链接的样式 */
.top a {
    color: #2897c5 !important ;
}

.topic-item {
    display: flex;
    align-items: center;
    height: 50px;
    padding: 5px;
    background: #ffffff;
    border-bottom: 1px solid #a0a0a0;
}

/* 隔行显示不同的背景颜色 */
.topic-item:nth-child(odd) {
    background: #f1f4f8;
}

.topic-item a {
    text-decoration: none;
    color: #333333;
    padding-left: 8px;
}

/* 鼠标指向的行背景色 */
.topic-item:hover {
    background: #b0d0fd;
}

.pagination {
    padding-top: 16px;
    padding-bottom: 16px;
}

/* 阴影 */
.shadow {
    box-shadow: 0 2px 12px 2px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: 0.3s;
}
</style>