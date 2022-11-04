import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';   // 导入ElementUI
import 'element-ui/lib/theme-chalk/index.css';  // 导入element ui 主题
import 'element-ui/lib/theme-chalk/display.css';  // 导入用于隐藏断点的样式
import './assets/fontawesome-free-6.1.1-web/css/fontawesome.min.css';  // 导入 font awesome 图标
import moment from 'moment';        // 导入时期时间库
import './assets/css/style.css';    // 引入全局样式文件


moment.locale('zh-cn');    // 设置时期时间的地区
Vue.use(ElementUI);  //通过全局方法 Vue.use() 使用插件
require('./api/init.js');  // 导入并执行 LeanCloud SDK 初始化
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
