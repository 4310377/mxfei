<template>
    <div>
        <p></p>
        <el-row type="flex" justify="center" align="middle">
            <el-col :lg="18" :md="20" :sm="24">
                <el-card>
                    <div>
                        <span class="title">话题：{{ topic.title }}</span>
                        <br />
                        <!-- 异步数据先显示初始数据，再显示带数据的数据 -->
                        <!-- 会导致三层表达式 a.b.c 渲染时会报错，是因为第一次渲染时还没有值，后来有值渲染成功 -->
                        <!-- 可以不理睬，不想看错误信息也可以加 v-if="topic.createdBy" 来解决 -->
                        <span class="info" v-if="topic.createdBy">
                            {{ topic.createdBy.username }} -
                            {{ topic.createdAt | datetimeFormat }}
                        </span>
                    </div>
                    <el-divider></el-divider>
                    <p v-html="topic.content"></p>

                    <el-divider></el-divider>
                    <div>
                        <p>
                            <span style="font-size:18px;">
                                <i class="fa fa-comments-o fa-lg"></i>
                                评论
                            </span>
                            <span class="mx-2">共 {{ replyCount }} 条评论</span>
                        </p>
                    </div>

                    <el-row type="flex">
                        <el-col style="width: 100px;">
                            <div class="comment-user">
                                <el-avatar style="background-color: red;">
                                    <i class="fa fa-user fa-4x"></i>
                                </el-avatar>
                                <span class="my-2">{{ currentUser }}</span>
                            </div>
                        </el-col>
                        <el-col>
                            <el-form>
                                <el-form-item label="评论（支持 Markdown 语法）" prop="desc">
                                    <el-input
                                        type="textarea"
                                        rows="5"
                                        v-model="content"
                                        placeholder="输入评论内容"
                                        :disabled="!currentUser"
                                    ></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <div class="horiz-container">
                                        <span v-if="!currentUser" style="color:red;">登录后发表评论</span>
                                        <div class="spacer"></div>
                                        <el-button :disabled="!currentUser">预览</el-button>
                                        <el-button
                                            :disabled="!currentUser"
                                            type="primary"
                                            @click="newComment"
                                        >评论</el-button>
                                    </div>
                                </el-form-item>
                            </el-form>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>
                            <div v-for="(item, index) in comments" :key="index">
                                <p class="author">{{ item.createdBy.username }}</p>
                                <p v-if="!item.invisible" v-html="item.content"></p>
                                <p v-else>***该评论内容已被隐藏***</p>
                                <div class="horiz-container">
                                    <span class="info">{{ item.createdAt | datetimeFormat }}</span>
                                    <div class="spacer"></div>
                                    <el-link class="mx-2">
                                        <i class="fa fa-thumbs-o-up"></i>
                                    </el-link>
                                    <el-link class="mx-2">
                                        <i class="fa fa-thumbs-o-down"></i>
                                    </el-link>
                                    <el-link class="mx-2">举报</el-link>
                                    <el-link class="mx-2">隐藏</el-link>
                                </div>

                                <el-divider></el-divider>
                            </div>
                        </el-col>
                    </el-row>
                    <div class="horiz-container pagination">
                        <div class="spacer"></div>
                        <el-pagination
                            background
                            @size-change="getCommentByTopic($route.params.id)"
                            @current-change="getCommentByTopic($route.params.id)"
                            layout="total, sizes, prev, pager, next, jumper"
                            :total="replyCount"
                            :page-sizes="[5, 10, 20, 30]"
                            :page-size.sync="pageSize"
                            :current-page.sync="currentPage"
                        ></el-pagination>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import CommentService from '../../../api/service/comment_service';
import TopicService from '../../../api/service/topic_service';
import moment from 'moment';
import { marked } from 'marked'
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';  // 代码高亮样式

export default {
    name: 'Detail',
    data: () => ({
        topic: {},
        comments: [],
        replyCount: 0,
        content: '',
        pageSize: 5,
        currentPage: 1,
        currentUser: null,
        dialog: false,
        username: '',
        password: '',
    }),
    async mounted() {
        this.currentUser = localStorage.getItem('currentUser');
        // marked.js 初始化
        marked.setOptions({
            renderer: new marked.Renderer(),
            highlight: function (code) {
                return hljs.highlightAuto(code).value;
                // return hljs.highlightBlock(code);
            },
            "gfm": true,// 启动Github样式的Markdown
            "breaks": true,//支持Github换行符，必须打开gfm选项
            "tables": true,  //支持Github表格，必须打开gfm选项
            "extensions": null,
            "headerIds": true,
            "headerPrefix": "",
            "highlight": null,
            "langPrefix": "language-",
            "mangle": true,
            "pedantic": false,// 只解析符合markdown.pl定义的，不修正markdown的错误
            "sanitize": false, // 原始输出，忽略HTML标签
            "sanitizer": null,
            "silent": false,
            "smartLists": false, //优化列表输出
            "smartypants": false,//使用更为时髦的标点，比如在引用语法中加入破折号。
            "tokenizer": null,
            "walkTokens": null,
            "xhtml": false
        });
        let topicId = this.$route.params.id;
        this.viewInc(topicId);
        this.getTopicById(topicId);
        this.getCommentByTopic(topicId);
    },
    methods: {
        async getTopicById(topicId) {
            let response = await TopicService.getTopicById(topicId);
            if (response.status_code === 'ok') {
                this.topic = this.toJson(response.reslut);
            } else {
                this.$message({
                    message: '出现异常，无法获取数据',
                    type: 'error'
                });
            }
        },

        async getCommentByTopic(topicId) {
            this.comments = [];
            let skip = (this.currentPage - 1) * this.pageSize;
            let response = await CommentService.getCommentByTopic(topicId, this.pageSize, skip);
            if (response.status_code === 'ok') {
                this.comments = response.reslut.map(item => {
                    return {
                        id: item.id,
                        topicId: item.get('topic').id,
                        content: this.markdown(item.get('content')),
                        invisible: item.get('visible'),
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        createdBy: item.get("createdBy")
                            ? this.getUser(item.get("createdBy"))
                            : "",
                    }
                });
                this.replyCount = response.totalCount;
            } else {
                this.$message({
                    message: '出现异常，无法获取评论数据',
                    type: 'error'
                });
            }

        },


        async newComment() {
            let content = this.content.trim();
            if (content) {
                let item = await CommentService.newComment(this.topic.id, content);
                if (item) {
                    console.log(item);
                    this.content = '';
                    // 把新评论添加到当前评论的前面。
                    this.comments.push({
                        id: item.id,
                        topicId: item.get('topic').id,
                        content: this.markdown(item.get('content')),
                        invisible: item.get('visible'),
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        createdBy: item.get("createdBy")
                            ? this.getUser(item.get("createdBy"))
                            : "",
                    });
                    this.replyCount++;
                    this.$message({
                        type: 'success',
                        message: `评论发表成功`,
                    });
                } else {
                    this.$message({
                        message: '出现错误, 无法完成评论',
                        type: 'error'
                    });
                }
            }

        },


        // 查看次数加1
        async viewInc(id) {
            await TopicService.viewsInc(id);
        },

        toLogin() {
            console.log('aaa');
            if (!this.currentUser) {
                this.dialog = true;
            }
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
                // 因为pre标签缺失hljs这个class，加上就好了将拿到的markdown内容，
                // 用marked转成html字符串后，replace替换<pre>标签为<pre class="hljs">
                // content: marked(item.get('content')).replace(/<pre>/g, "<pre class='hljs'>"),
                content: this.markdown(item.get('content')),
                views: item.get('views'),
                reply: item.get('reply'),
                level: item.get('level'),
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

        //  将 markdown 语法写的内容转为 html 显示
        markdown(val) {
            return marked(val).replace(/<pre>/g, "<pre class='hljs'>");
        },

    },

    filters: {
        // 使用 moment.js 定义日期时间过滤器函数   
        datetimeFormat(val) {
            let now = new Date();
            //  计算两个时间相差多少天
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
.title {
    font-size: 14px;
    font-weight: bold;
}

.info {
    font-size: 12px;
    color: #c2c2c2;
}

.author {
    font-size: 14px;
    font-weight: bold;
    color: darkcyan;
}

.comment-user {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    height: 200px;
}
.comment-content {
    font-size: 14px;
}
</style>