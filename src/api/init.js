import LC from 'leancloud-storage';   // 导入 leancloud 数据存储模块
import config from './config/lc.config';  // 导入 leancloud 的应用keys

let initOptions;

if (config.url.trim() === '') {
    // url 为空的时候，访问国际版：leancloud.app
    initOptions = {
        appId: config.id,
        appKey: config.key,
    };
} else {
    // url 不为空的时候，访问国内版:leancloud.cn
    initOptions = {
        appId: config.id,
        appKey: config.key,
        serverURLs: config.url,
    };
}

// 执行 leanCloud 初始化
LC.init(initOptions);

// 导出模块
export default {}