<template>
    <div class="lay-header horiz-container">
        <router-link to="/">
            <el-button type="text">首页</el-button>
        </router-link>
        <div class="spacer"></div>
        <el-link :underline="false" type="success" class="mx-2">
            <i class="fa fa-bell fa-lg"></i> 消息
        </el-link>
        <el-link :underline="false" type="danger" class="mx-2">
            <i class="fa fa-envelope fa-lg"></i> 邮件
        </el-link>
        <!-- 从状态栏读取当前已登录用户的信息，并显示用户名 -->
        <el-link
            :underline="false"
            type="primary"
            class="mx-2"
            v-if="currentUser"
        >当前用户： {{ currentUser }}</el-link>
        <!-- 添加注销功能 -->
        <el-link :underline="false" type="danger" class="mx-2" @click="logout">注销</el-link>
    </div>
</template>

<script>
import AccountService from "../../../api/service/account_service.js"
export default {
    name: 'LayoutHeader',
    methods: {
        
        // 用户注销
        async logout() {
            console.log("logout");
            await AccountService.logOut();
            if (this.$route.path != "/") {              
                localStorage.removeItem("preRoute");  // 删除已保存的前一页地址
                localStorage.removeItem("token");   // 删除已保存的用户 token
                this.$router.push("/");
            }
        },
    },

    computed: {
        // 获取当前登录的用户名
        currentUser() {
            if (localStorage.getItem('token')) {
                return localStorage.getItem('currentUser')
            }
        },
    }
}
</script>

<style>
.lay-header {
    height: 60px;
    align-items: center;
}
</style>