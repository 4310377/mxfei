<template>
    <el-container>       
        <el-header class="horiz-container">
            <div class="logo">
                <!-- 添加返回首页的链接 -->
                <router-link to="/">Acme World APP</router-link>
            </div>
            <div class="spacer"></div>
            <router-link to="/dashboard" class="m-2">
                <el-button type="text">后台管理</el-button>
            </router-link>
            <router-link to="/login" class="m-2">
                <el-button type="text">登录</el-button>
            </router-link>
        </el-header>
        <el-main>
            <!-- 响应并显示匹配子路由的组件 -->
            <router-view />
        </el-main>
    </el-container>
</template>

<script>
export default {
    name: 'Home',
}
</script>

<style>
.el-container {
    /* 让最外层组件占满整个可见的高度 */
    height: 100vh;
}
.el-header {
    background-color: #b3c0d1;
    color: #333;
    line-height: 60px;
    /* 交叉轴对齐方式：居中 */
    align-items: center;
}
.el-main {
    background-color: #e6e6e6;    
}

.logo a{
    text-decoration: none;   
    font-size: 24px;
    font-weight: bold;
    padding-left: 20px;
}
</style>