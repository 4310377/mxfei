import LC from 'leancloud-storage';  // 导入 leancloud 数据存储模块

/**
 * 账号管理的类
 */
class AccountService {

    /**
     * 注册新用户账号
     * @param {*} username 
     * @param {*} password 
     * @param {*} email 
     * @returns 注册返回的状态码： 202: "用户名已被注册", 203: "邮箱已被注册", "-1": "无法连接到服务器"
     * 
     */
    async signUp(username, password, email = '') {
        try {
            let user = new LC.User();
            user.setUsername(username);
            user.setPassword(password);
            // 添加一个 昵称 字段，默认为用户名
            user.set('nickname', username);
            if (email) {
                user.setEmail(email);
            }
            let response = await user.signUp();
            console.log('注册账号成功：', response);
            return {
                "status_code": "ok",   // 注册状态码
                "user": response,    // 用户
            };
        } catch (e) {
            console.log('注册账号失败：', e.code, e);
            return {
                // 注册返回的状态码： 202: "用户名已被注册", 203: "邮箱已被注册", "-1": "无法连接到服务器"
                "status_code": e.code,   // 注册状态码
                "user": null,    // 注册失败，返回用户为 null
            };
        }
    }


    /**
     * 用户登录 
     * @param {*} username 
     * @param {*} password 
     * @returns  登录状态代码 和用户
     *  200: 登录成功
     *  210: 密码错误； 
     *  211：用户不存在, 
     *  219: 重试次数太多
     *  -1 : 请求被终止，一般是网络有问题
     */
    async logIn(username, password) {
        try {
            let user = await LC.User.logIn(username, password);
            if (user) {
                console.log('登录成功:', user);
                return {
                    "status_code": "ok",   // 登录状态码
                    "user": user,    // 用户
                };
            }
        } catch (e) {
            // e.code
            // 210: 密码错误； 
            //  211：用户不存在, 
            //  -1 Error: Request has been terminated
            console.log('登录失败：', e.code, e);
            return {
                "status_code": e.code,
                "user": null,
            };
        }
        return null;
    }

    /**
     * 退出登录 
     * @returns 无返回值
     */
    async logOut() {
        return LC.User.logOut();
    }

    /**
     * 通过电子邮件重置密码
     * @param {*} email 
     * @returns 状态码：
     * "200": 发送邮件成功；
     * "1": "请不要往同一个邮件地址发送太多邮件",
     * "205": "此电子邮箱没有被注册使用",
     * "-1": "请求被终止，请检查网络连接状况"
     */
    async passwordResetByEmail(email) {
        try {
            let response = await LC.User.requestPasswordReset(email);
            console.log(response.code, typeof response);
            return { "status_code": "ok" };
        } catch (e) {
            console.log("发送邮件：", e.code, e);
            return {
                "status_code": e.code,  // 发送邮件不成功，返回错误代码
            }
        }
    }

    /**
     * 获取当前用户的 session token
     * @returns session token
     */
    async getToken() {
        return LC.User.current().getSessionToken();
    }

}

export default new AccountService();