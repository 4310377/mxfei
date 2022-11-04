<template>
    <div>
        <el-row>
        <el-col :md="12" class="hidden-sm-and-down">
            <div class="grid-content bg-dark">
                <span class="login-title">Element Forum Admin</span>
            </div>
        </el-col>
        <el-col :md="12" :sm="24">
            <div class="grid-content bg-light">
                <router-view />
            </div>
        </el-col>
    </el-row>
    </div>
</template>

<script>
export default {
    name: 'BlogIndex',

    data() {
        return {
            
        };
    },

    mounted() {
        
    },

    methods: {
        
    },
};
</script>

<style  scoped>
.grid-content {
    height: 100vh;
    /* 使用弹性布局 */
    display: flex;
    /* 主轴居中 */
    justify-content: center;
    /* 交叉轴居中 */
    align-items: center;
}
/* 深色背景，有不重复的背景图片 */
.bg-dark {
    background: #091d3b;
    /* 请自行修改为自己的图片url */
    background-image: url("../../assets/login-pattern-left.png");
    background-repeat: no-repeat;
    background-position: -30% 60%;
}
/* 浅色背景 */
.bg-light {
    background: #e5e9f2;
}
/* 左侧窗格的标题文字 */
.login-title {
    color: white;
    font-size: 36px;
    font-weight: 600;
}

/* 以下为子组件共用的样式 */
.form-title {
    font-size: 18px;
    font-weight: 400;
    height: 60px;
}

.full-width {
    width: 100%;
}   
</style>