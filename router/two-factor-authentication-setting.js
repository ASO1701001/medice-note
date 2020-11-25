const Router = require('koa-router');
const router = new Router();
const connection = require('../app/db');
const app = require('../app/app');
const parser = require('ua-parser-js');
const dateformat = require('dateformat');

router.get('/two-factor-authentication-setting', async (ctx) => {
    let session = ctx.session;
    app.initializeSession(session);

    let authId = session.auth_id;
    let userId = await app.getUserId(authId);
    if (!userId) {
        session.error.message = 'ログインしていないため続行できませんでした';

        return ctx.redirect('/login');
    }

    let result = app.initializeRenderResult();
    result['data']['meta']['login_status'] = true;
    result['data']['meta']['site_title'] = '二段階認証設定 - Medice Note';
    result['data']['meta']['group_list'] = await app.getGroupList(userId);

    let sql = 'SELECT pc_uuid, env_ua, env_ip, validity_flag, timestamp FROM user_login_pc WHERE user_id = ? AND validity_flag = true ORDER BY timestamp DESC';
    let [data] = await connection.query(sql, [userId]);

    result['data']['login_pc'] = data.map(value => {
        let ua = parser(value['env_ua']);

        let uaBrowser = ua.browser.name === undefined ? '不明なブラウザ' : `${ua.browser.name} ${ua.browser.major}`;
        let uaOs = ua.os.name === undefined ? '不明なOS' : `${ua.os.name} ${ua.os.version}`;

        return {
            uuid: value['pc_uuid'],
            env_name: `${uaBrowser}（${uaOs}）`,
            env_ua: value['env_ua'],
            env_ip: value['env_ip'],
            validity_flag: value['validity_flag'],
            timestamp: dateformat(value['timestamp'], 'yyyy年mm月dd日 HH時MM分ss秒')
        }
    });

    if (session.success !== undefined) {
        result['data']['success'] = session.success;
        session.success = undefined;
    }

    if (session.error !== undefined) {
        result['data']['error'] = session.error;
        session.error = undefined;
    }

    await ctx.render('two-factor-authentication-setting', result);
});

router.post('/two-factor-authentication-setting', async (ctx) => {
    let session = ctx.session;
    app.initializeSession(session);

    let authId = session.auth_id;
    let userId = await app.getUserId(authId);
    if (!userId) {
        session.error.message = 'ログインしていないため続行できませんでした';

        return ctx.redirect('/login');
    }

    let uuid = ctx.request.body['uuid'];
    if (uuid === undefined || uuid === '') {
        session.error.message = 'データが見つかりませんでした';

        return ctx.redirect('/two-factor-authentication-setting');
    }

    let sql = 'SELECT * FROM user_login_pc WHERE pc_uuid = ? AND user_id = ?';
    let [data] = await connection.query(sql, [uuid, userId]);
    if (data.length === 0) {
        session.error.message = 'データが見つかりませんでした';

        return ctx.redirect('/two-factor-authentication-setting');
    }

    sql = 'DELETE FROM user_login_pc WHERE pc_uuid = ?';
    await connection.query(sql, [uuid]);

    session.success.message = 'パソコン情報を削除しました<br>次回から二段階認証を行います';

    ctx.redirect('/two-factor-authentication-setting');
});

module.exports = router;
