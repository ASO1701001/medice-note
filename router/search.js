const Router = require('koa-router');
const router = new Router();
const app = require('../app/app');
const connection = require('../app/db');

router.get('/search', async (ctx) => {
    let session = ctx.session;
    app.initializeSession(session);

    let authId = session.auth_id;
    let userId = await app.getUserId(authId);
    if (!userId) {
        session.error.message = 'ログインしていないため続行できませんでした';

        return ctx.redirect('/login');
    }

    let keyword = ctx.request.query['keyword'];
    if (keyword === '') {
        session.error.message = 'キーワードを入力してください';

        return ctx.redirect('/');
    }

    let result = app.initializeRenderResult();
    result['data']['meta']['login_status'] = true;
    result['data']['meta']['site_title'] = '薬情報一覧 - Medice Note';
    result['data']['meta']['group_list'] = await app.getGroupList(userId);
    result['data']['meta']['script'] = [
        '/stisla/modules/sweetalert/sweetalert.min.js',
        '/js/medicine-delete-alert.js',
        '/js/library/notyf.min.js'
    ];
    result['data']['meta']['script_delay'] = [
        '/js/medicine-list.js'
    ];
    result['data']['meta']['css'] = [
        '/css/library/notyf.min.css'
    ];
    result['data']['meta']['section_header'] = `検索結果 - ${keyword}`;

    let sql = `
        SELECT medicine.medicine_id,
               medicine_name,
               hospital_name,
               number,
               date_format(starts_date, '%Y年%m月%d日')           as starts_date,
               period,
               mt.type_name,
               image,
               description,
               medicine.group_id,
               mg.group_name,
               GROUP_CONCAT(tt.take_time_name SEPARATOR ' ・ ') as take_time_name
        FROM medicine
                 LEFT JOIN medicine_type mt ON medicine.type_id = mt.type_id
                 LEFT JOIN medicine_group mg ON medicine.group_id = mg.group_id
                 LEFT JOIN medicine_take_time mtt ON medicine.medicine_id = mtt.medicine_id
                 LEFT JOIN take_time tt ON mtt.take_time_id = tt.take_time_id
        WHERE medicine.group_id in (SELECT group_id FROM medicine_group WHERE user_id = ?)
          AND (medicine_name COLLATE utf8mb4_unicode_ci LIKE ? OR hospital_name COLLATE utf8mb4_unicode_ci LIKE ?)
        GROUP BY mtt.medicine_id
        ORDER BY starts_date DESC`;
    let [data] = await connection.query(sql, [userId, `%${keyword}%`, `%${keyword}%`]);

    let dayArray = [];
    for (let i = 0; i < data.length; i++) {
        if (!Array.isArray(dayArray[data[i]['starts_date']])) {
            dayArray[data[i]['starts_date']] = [];
        }
        dayArray[data[i]['starts_date']].push(data[i]);
    }
    result['data']['medicine_list'] = dayArray;

    if (session.success !== undefined) {
        result['data']['success'] = session.success;
        session.success = undefined;
    }

    if (session.error !== undefined) {
        result['data']['error'] = session.error;
        session.error = undefined;
    }

    await ctx.render('medicine-list', result);
})

module.exports = router;
