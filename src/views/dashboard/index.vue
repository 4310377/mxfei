<template>
    <el-container>
        <el-aside width="240px">           
            <layout-aside></layout-aside>
        </el-aside>
        <el-container>
            <el-header>               
                <layout-header></layout-header>
            </el-header>
            <el-main>
                <!-- 用于响应匹配的子路由视图 -->
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    name: 'Dashboard',
    components: {
        LayoutHeader: () => import('./layout/Header.vue'),
        LayoutAside: () => import('./layout/Aside.vue'),
    }
}
</script>

<style>
.el-container {
    height: 100vh;
}
.el-header {
    background-color: #b3c0d1;
    color: #333;
}
.el-main {
    background-color: #e9eef3;
    color: #333;
}
</style>