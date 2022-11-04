<template>
    <div>
        <div class="dashboard-logo">
            <p>Admin</p>
        </div>
        <el-menu :router="true">
            <template v-for="(item, index) in menu.menuItems">
                <el-menu-item v-if="!item.children" :key="index" :index="item.link">
                    <i :class="item.icon"></i>
                    {{ item.title }}
                    <el-badge :value="item.chip" :max="99" class="badge-item"></el-badge>
                </el-menu-item>

                <el-submenu
                    v-else-if="item.children.length > 0"
                    :key="'k' + item.id"
                    :index="item.link"
                >
                    <template slot="title">
                        <i :class="item.icon"></i>
                        <span slot="title">{{ item.title }}</span>
                    </template>
                    <!-- 子菜单组件 -->
                    <menu-tree :menuData="item.children"></menu-tree>
                </el-submenu>
            </template>
        </el-menu>
    </div>
</template>

<script>
// 导入生成左侧菜单列表的 json 文件
import menu from '@/assets/json/menuItems.json';
export default {
    name: 'LayoutAside',
    components: {
        MenuTree: () => import('./MenuTree.vue'),
    },
    data: () => ({
        menu,   // 导入的json 数据 作为变量
    }),
}
</script>

<style>
.dashboard-logo {
    text-align: center;
    font-size: 28px;
    font-weight: 600;   
}
</style>