import Vue from 'vue';
import VueRouter from 'vue-router';


Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    // name: 'Home',
    component: () => import('../views/home/index.vue'),
    children: [
        {
          path: '',
          name: 'ToplicList',   // 论坛话题列表
          component: () => import('../views/home/pages/TopicList.vue'),
        },
        {
          path: '/detail/:id',  // 动态路由, id 用于接收参数
          name: 'Detail',       // 话题详情
          component: () => import('../views/home/pages/Detail.vue'),
        },
  
      ]
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('../views/account/index.vue'),
    meta:{
        title:'陌小飞'
    },
    children: [
        {
          // 子路由的 path 以 / 开头，表示绝对路径，父path 在子路由中不起作用
          path: '/login',  // 实际路径：/login
          name: 'Login',   // 命名路由
          component: () => import('../views/account/pages/Login.vue'),
        },
        {
          path: '/signup',  // 实际路径：/signup
          name: 'SignUp',
          component: () => import('../views/account/pages/SignUp.vue'),
        },
        {
          path: '/password_reset',  // 实际路径：/password_reset
          name: 'PasswordReset',
          component: () => import('../views/account/pages/PasswordReset.vue'),
        },
      ]
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/dashboard/index.vue'),
    meta:{
        title:'陌小飞'
    },
    // 添加路由元信息 meta: { requiresAuth: true, } 用于标识进入该路由必须登录 
    meta: { requiresAuth: true },
    children: [
        {
          // 子路由的 path 不是以 / 开头时，实际路径为 父path 与 子path 的组合
          path: '',       // 实际路径为: /dashboard
          alias: 'index', // 别名，相当于第二个 path, 实际路径为: /dashboard/index
          name: 'Dashboard',  // 父路由没有 name 项，此处使用父路由原来的 name
          component: () => import('@/views/dashboard/pages/MainIndex.vue'),
        },
        {
          path: 'topic_manager',   // 实际路径为: /dashboard/topic_manager
          name: 'TopicManager',
          component: () => import('@/views/dashboard/forum/TopicManager.vue'),
        },
        {
          path: 'comment_manager',   // 实际路径为: /dashboard/comment_manager
          name: 'CommentManager',
          component: () => import('@/views/dashboard/forum/CommentManager.vue'),
        },
      ]
  }
];

const router = new VueRouter({
  routes
});
// 使用路由守卫,具体内容见官方文档：https://router.vuejs.org/zh/guide/advanced/meta.html
// 特别注意事项：确保 router.beforeEach 中只有一个 next() 会被执行
// 如果有多个 next() 被执行，将会出现重复路由的异常
router.beforeEach((to, from, next) => {
    let login_router = ['/account', '/login'];
    // 如果 跳转的目标 path 是登录页（看上面的路由设置 ）
    if (to.path in login_router) {
        // 保存跳转到登录页之前的地址， 登录成功后跳转回该页
        // 回跳功能在 登录页 "src/views/account/pages/Login.vue" 实现
        localStorage.setItem("preRoute", router.currentRoute.fullPath);
    }
  
    // 检查跳转的目标路由是否需要登录(包含 meta: {requiresAuth: true, },)
    if (to.matched.some(record => record.meta.requiresAuth)) {
        // 检查用户是否登录 
        if (!localStorage.getItem('token')) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
        } else {
            next();
        }
    } else {
        next();
    }
  });
export default router;


