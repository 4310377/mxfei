<template>
    <div>
        <template v-for="item in menuData">
            <el-menu-item v-if="!item.children" :key="item.id" :index="item.link">
                <i :class="item.icon"></i>
                {{ item.title }}
                <el-badge :value="item.chip" :max="99" class="badge-item"></el-badge>
            </el-menu-item>
            <el-submenu v-else-if="item.children.length > 0" :key="'s' + item.id">
                <template slot="title">
                    <i :class="item.icon"></i>
                    <span slot="title">{{ item.title }}</span>
                </template>
                <!-- 递归生成下一级子菜单 -->
                <menu-tree menuData="item.children"></menu-tree>
            </el-submenu>
        </template>
    </div>
</template>

<script>
export default {
    name: "MenuTree",
    props: ["menuData"], 
}
</script>
