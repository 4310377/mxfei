<template>
    <el-card shadow="always" class="login-module">
        <el-form>          
            <div class="horiz-container form-title">                
                <span>注册新用户</span>
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
                    prefix-icon="fa fa-envelope-o fa-lg"
                    v-model="email"
                    placeholder="电子邮箱"
                ></el-input>
            </el-form-item>

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
                <!-- 按钮添加单击事件调用函数创建用户 -->
                <el-button class="full-width" type="primary" @click="createUser">注册新用户</el-button>
            </el-form-item>
            <div class="horiz-container">
                <div class="spacer"></div>              
                <router-link to="/login" class="link">
                    <el-link :underline="false" type="success">使用已有账号登录</el-link>
                </router-link>
            </div>
        </el-form>
    </el-card>
</template>

<script>
// 导入账号服务类
import AccountService from "../../../api/service/account_service";
export default {
    name: "SignUp",     // 组件名称
    data: () => ({
        username: "",   // 用于输入用户名
        password: "",   // 用于输入密码
        email: "",      // 用于输入邮箱 
    }),    
    methods: {
        // 调用 AccountService 中的异步方法时，函数前要加上 async 
        async createUser() {
            // 注册函数返回值为 包含 状态码 和 用户 两个部分内容的对象
            let response = await AccountService.signUp(this.username, this.password, this.email);
            if (response.status_code == "ok") {
                // 调用异步方法不能缺少 await，不然等不到正确结果
                let token = await AccountService.getToken();
                localStorage.setItem("token", token);   // 保存当前用户的 session token    
                localStorage.setItem("currentUser", this.username);   // 保存当前的用户名          
                this.$router.push("/dashboard");  // 跳转到后台管理）
            }
            else {
                let errorMsg = {
                    "125": "无效的电子邮件地址",
                    "202": "此用户名已被注册",
                    "203": "此电子邮箱已经被占用",
                    "-1": "请求被终止，请检查网络连接状况",
                };
                // 使用 Notification 通知 显示注册失败的提示信息
                this.$notify.error({
                    title: '注册失败',                           // 标题
                    message: errorMsg[response.status_code],    // 取出对应的消息内容
                    // offset: 100,                             // 偏移量，消息距屏幕边缘偏移一段距离
                    showClose: false,                           // 不显示关闭按钮，只能等自动关闭
                });
            }
        }
    },
};
</script>

<style>
.login-module {
    width: 380px;
}
</style>