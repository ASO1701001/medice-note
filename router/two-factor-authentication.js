const Router = require('koa-router');
const router = new Router();
const connection = require('../app/db');
const app = require('../app/app');
const {v4: uuid} = require('uuid');

router.get('/two-factor-authentication/:auth_key', async (ctx) => {
    let session = ctx.session;
    app.initializeSession(session);

    let authKey = ctx.params['auth_key'];
    let pcUuid = ctx.request.query['uuid'];

    let sql = 'DELETE FROM user_two_factor_authentication WHERE expires_at <= NOW()';
    await connection.query(sql, [authKey]);

    sql = 'SELECT user_id FROM user_two_factor_authentication WHERE authentication_key = ? AND expires_at >= NOW()';
    let [auth] = await connection.query(sql, [authKey]);
    if (auth.length === 0) {
        session.error.message = '認証キーが見つかりませんでした';
        session.ga.flow = 'tow_factor_authentication';
        session.ga.result = false;

        return ctx.redirect('/login');
    }

    sql = 'DELETE FROM user_two_factor_authentication WHERE authentication_key = ?';
    await connection.query(sql, [authKey]);

    let userId = auth[0]['user_id'];
    let sessionId = uuid().split('-').join('');

    sql = 'INSERT INTO session VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY))';
    await connection.query(sql, [userId, sessionId]);

    if (pcUuid !== undefined) {
        sql = 'UPDATE user_login_pc SET validity_flag = true WHERE user_id = ? AND pc_uuid = ?';
        await connection.query(sql, [userId, pcUuid]);
    }

    session.auth_id = sessionId;
    session.success.message = 'ログインしました';
    session.ga.flow = 'tow_factor_authentication';
    session.ga.result = true;

    sql = "SELECT COUNT(login_log_id) count FROM user_login_log WHERE mail = (SELECT mail FROM user WHERE user_id = ?)";
    let [loginCount] = await connection.query(sql, [userId])
    if (parseInt(loginCount[0]['count']) === 1) {
        return ctx.redirect('/?from=new-registration');
    } else {
        return ctx.redirect('/');
    }
});

module.exports = router;
