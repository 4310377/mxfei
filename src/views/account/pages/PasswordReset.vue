<template>
    <el-card shadow="always" class="login-module">
        <el-form>
            <div class="horiz-container form-title">
                <span>通过邮箱找回密码</span>
                <div class="spacer"></div>
                <span>
                    <router-link to="/">
                        <i class="fa fa-home fa-lg" aria-hidden="true"></i>
                    </router-link>
                </span>
            </div>
            <!-- 添加发送重置邮件成功后显示的内容 -->
            <div v-if="sendEmailSuccess">
                <el-alert
                    :title="`请登录 ${this.email} 邮箱进行密码重置`"
                    type="success"
                    effect="dark"
                    center
                    show-icon
                    :closable="false"
                ></el-alert>
            </div>
            <!-- 原来的表单项添加一个 <div v-else> </div> 包裹起来  -->
            <div v-else>
                <el-form-item>
                    <el-input
                        type="text"
                        prefix-icon="fa fa-envelope-o fa-lg"
                        v-model="email"
                        placeholder="电子邮箱"
                    ></el-input>
                </el-form-item>

                <el-form-item>
                    <!-- 按钮单击事件添加调用 passwordReset 函数 -->
                    <el-button class="full-width" type="primary" @click="passwordReset">发送找回密码的邮件</el-button>
                </el-form-item>
                <div class="horiz-container">
                    <div class="spacer"></div>
                    <router-link to="/login" class="link">
                        <el-link :underline="false" type="success">使用已有账号登录</el-link>
                    </router-link>
                    <router-link to="/signup" class="mx-2">
                        <el-link :underline="false" type="danger">没有账号</el-link>
                    </router-link>
                </div>
            </div>
        </el-form>
    </el-card>
</template>

<script>
import AccountService from "../../../api/service/account_service";
export default {
    name: "PasswordReset",     // 组件名称
    data: () => ({
        email: "",      // 用于输入邮箱 
        sendEmailSuccess: false,
    }),
    methods: {
        async passwordReset() {
            let email = this.email.trim();
            // 发送重置密码邮件后，返回值为 字符类型的状态码
            let response = await AccountService.passwordResetByEmail(email);
            if (response.status_code == "ok") {
                this.sendEmailSuccess = true;
                // 显示发送成功的提示信息
                this.$notify.success({
                    title: '发送重置密码邮件成功',             // 标题
                    message: "请查看邮件，以便完成密码重置",    // 消息内容
                    // offset: 100,                          // 偏移量，消息距屏幕边缘偏移一段距离
                    showClose: false,                        // 不显示关闭按钮，只能等自动关闭
                });

            } else {
                let errorMsg = {
                    "1": "请不要往同一个邮件地址发送太多邮件",
                    "205": "此电子邮箱没有被注册使用",
                    "-1": "请求被终止，请检查网络连接状况"
                };
                // 使用 Notification 通知 显示操作失败的的提示信息
                this.$notify.error({
                    title: '密码重置失败',           // 标题
                    message: errorMsg[response.status_code],    // 消息内容
                    // offset: 100,                 // 偏移量，消息距屏幕边缘偏移一段距离
                    showClose: false,               // 不显示关闭按钮，只能等自动关闭
                });
            }
        }
    }
};
</script>

<style>
.login-module {
    width: 380px;
}
</style>