<template>
    <el-card shadow="always" class="login-module">
        <el-form>
            <div class="horiz-container form-title">
                <span>用户登录</span>
                <div class="spacer"></div>
                <span>
                    <router-link to="/">
                        <i class="fa fa-home fa-lg" aria-hidden="true"></i>
                    </router-link>
                </span>
            </div>
            <el-form-item>
                <el-input
                    type="text"
                    prefix-icon="fa fa-user-o fa-lg"
                    v-model="username"
                    placeholder="用户名"
                ></el-input>
            </el-form-item>
            <el-form-item>
                <el-input
                    type="password"
                    prefix-icon="fa fa-lock fa-lg"
                    v-model="password"
                    placeholder="密码"
                ></el-input>
            </el-form-item>
            <el-form-item>
                <!-- 登录按钮单击事件调用 login 函数 -->
                <el-button class="full-width" type="primary" @click="login">登录</el-button>
            </el-form-item>
            <div class="horiz-container">
                <div class="spacer"></div>
                <router-link to="/password_reset" class="mx-2">
                    <el-link :underline="false" type="warning">忘记密码</el-link>
                </router-link>
                <router-link to="/signup" class="mx-2">
                    <el-link :underline="false" type="danger">没有账号</el-link>
                </router-link>
            </div>
        </el-form>
    </el-card>
</template>

<script>
// 导入账号服务类
import AccountService from "../../../api/service/account_service";
import { Loading } from "element-ui";   // 导入 Loading加载
export default {
    name: "Login",
    data: () => ({
        username: "",   // 用于输入用户名
        password: "",   // 用于输入密码    
        loading: '',    // 用于显示 Loading 加载 的变量        
    }),
    methods: {
        async login() {
            this.showLoading('#login', '正在登录中...');   // 在选择器名为  # login 的元素上显示  loading

            // 登录函数返回 包含 状态码 和 用户 两个信息的对象， 状态码为 字符类型 的 数字字符
            let response = await AccountService.logIn(this.username, this.password);
            // 为了进行登录失败的提示，只能通过 typeof currentUser 来 判断登录是否成功
            if (response.status_code == "ok") {
                // 读取进入登录页的前一页地址
                const curr = localStorage.getItem("preRoute");
                let token = await AccountService.getToken();
                localStorage.setItem("token", token);   // 保存当前用户的 session token
                localStorage.setItem("currentUser", this.username);   // 保存当前的用户名
              
                console.log('response.user:', response.user);
               

                if (curr === null || curr === '/' || curr === '/account' || curr === "/login") {
                    this.$router.push({ path: "/dashboard" });
                } else {
                    // 跳转到进入登录页之前的页面
                    this.$router.push({ path: curr });
                }
            } else {               
                let errorMsg = {
                    "210": "用户名和密码不匹配",
                    "211": "找不到用户",
                    "219":'登录失败次数超过限制，请稍候再试，或者重设密码',
                    "-1": "请求被终止，请检查网络连接状况",
                };               
                // 使用 Notification 通知 显示登录失败的的提示信息
                this.$notify.error({
                    title: '登录失败',      // 标题
                    message: errorMsg[response.status_code],     // 消息内容
                    // offset: 100,        // 偏移量，消息距屏幕边缘偏移一段距离
                    showClose: false,      // 不显示关闭按钮，只能等自动关闭
                });
            }
            // 结束显示 loading 
            this.endLoading();
        },

        /**
       * 自定义用于局部区域显示 loading 的函数
       * 局部区域显示 loading 的步骤：
       * 1、import { Loading } from "element-ui";   // 导入 Loading加载
       * 2、在  data 定义控制变量： loading:false,
       * 3、定义函数：showLoading(targetNode, message) 和 endLoading()
       * 4、调用第 3 步定义的两个函数
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
        },

        // 获取用户数据中的用户名和邮箱两个信息
        getUser(user) {
            return {
                id: user.id,
                username: user.get("username"),
                email: user.get("email"),
            };
        },
    }
};
</script>

<style>
.login-module {
    width: 380px;
}
</style>