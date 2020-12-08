const Router = require('koa-router');
const router = new Router();
const validator = require('validatorjs');
const app = require('../app/app');
const connection = require('../app/db')

router.get('/api/calendar', async (ctx) => {
    let session = ctx.session;

    let authKey = session.auth_id;
    let userId = await app.getUserId(authKey);
    if (!userId) {
        return ctx.body = {};
    }

    let start = ctx.request.query['start'];
    let end = ctx.request.query['end'];

    let validation = new validator({
        start: start,
        end: end
    }, {
        start: 'required|date',
        end: 'required|date',
    });

    if (validation.fails()) {
        if (validation.errors.first('start')) {
            let date = new Date();
            start = `${date.getFullYear()}-${date.getMonth() + 1}-1`;
        }
        if (validation.errors.first('end')) {
            let date = new Date();
            date.setMonth(date.getMonth() + 1);
            end = `${date.getFullYear()}-${date.getMonth() + 1}-1`;
        }
    }

    let sql, calendar;

    let order = ctx.request.query['order'];
    switch (order) {
        case 'hospital-name':
            sql = `
                SELECT hospital_name                                                    as title,
                       DATE_FORMAT(starts_date, '%Y-%m-%d')                             as start,
                       DATE_FORMAT(starts_date, '%Y-%m-%d')                             as end,
                       GROUP_CONCAT(medicine_name, ' (', number, '個)' SEPARATOR '<br>') as description
                FROM medicine
                WHERE group_id IN (SELECT group_id FROM medicine_group WHERE user_id = ?)
                  AND (DATE_FORMAT(starts_date, '%Y-%m-%d') BETWEEN ? AND ?
                    OR DATE_FORMAT(starts_date, '%Y-%m-01') BETWEEN ? AND ?)
                GROUP BY hospital_name, start
                ORDER BY start`;
            [calendar] = await connection.query(sql, [userId, start, end, start, end]);

            break;
        default:
            sql = `
                SELECT medicine_name                                                       as title,
                       DATE_FORMAT(starts_date, '%Y-%m-%d')                                as start,
                       DATE_FORMAT(DATE_ADD(starts_date, INTERVAL period DAY), '%Y-%m-%d') as end,
                       CONCAT('/medicine/', medicine_id)                                   as url,
                       hospital_name                                                       as description
                FROM medicine
                WHERE group_id IN (SELECT group_id FROM medicine_group WHERE user_id = ?)
                  AND (DATE_FORMAT(starts_date, '%Y-%m-%d') BETWEEN ? AND ?
                    OR DATE_FORMAT(DATE_ADD(starts_date, INTERVAL period DAY), '%Y-%m-01') BETWEEN ? AND ?)`;

            [calendar] = await connection.query(sql, [userId, start, end, start, end]);
            break;
    }

    return ctx.body = calendar;
});

module.exports = router;
