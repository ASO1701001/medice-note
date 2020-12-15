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
        case 'plan':
            sql = `
                SELECT plan_title                         as title,
                       DATE_FORMAT(plan_date, '%Y-%m-%d') as start,
                       DATE_FORMAT(plan_date, '%Y-%m-%d') as end,
                       plan_description                   as description
                FROM calendar_plan
                WHERE user_id = 1
                  AND (DATE_FORMAT(plan_date, '%Y-%m-%d') BETWEEN '2020-11-29' AND '2021-01-10'
                    OR DATE_FORMAT(plan_date, '%Y-%m-01') BETWEEN '2020-11-29' AND '2021-01-01')
                ORDER BY start`;
            [calendar] = await connection.query(sql, []);

            break;
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

router.post('/api/calendar-plan/add', async (ctx) => {
    let session = ctx.session;

    let authKey = session.auth_id;
    let userId = await app.getUserId(authKey);
    if (!userId) {
        return ctx.body = {
            status: false,
            message: 'SESSION_ERROR'
        };
    }

    let planTitle = ctx.request.body['plan_title'];
    let planDate = ctx.request.body['plan_date'];
    let planDescription = ctx.request.body['plan_description'];
    let planNotice = ctx.request.body['plan_notice'] === 'true';

    let validation = new validator({
        plan_title: planTitle,
        plan_date: planDate,
        plan_description: planDescription,
        plan_notice: planNotice
    }, {
        plan_title: 'required|min:1|max:50',
        plan_date: 'required|date',
        plan_description: 'max:300',
        plan_notice: 'required|boolean'
    });

    validation.checkAsync(() => {
        let sql = 'INSERT INTO calendar_plan (user_id, plan_title, plan_date, plan_description, plan_notice) VALUES (?, ?, ?, ?, ?)';
        connection.query(sql, [userId, planTitle, planDate, planDescription, planNotice]);

        return ctx.body = {
            status: true
        };
    }, () => {
        let error = {};

        if (validation.errors.first('plan_title')) {
            error['plan_title'] = '1文字以上30文字以下で入力してください';
        }
        if (validation.errors.first('plan_date')) {
            error['plan_date'] = '日付を入力してください';
        }
        if (validation.errors.first('plan_description')) {
            error['plan_description'] = '300文字以下で入力してください';
        }
        if (validation.errors.first('plan_notice')) {
            error['plan_notice'] = '不明なエラー'
        }

        return ctx.body = {
            status: false,
            message: 'VALIDATION_ERROR',
            error: error
        };
    });
});

router.post('/api/calendar-plan/edit', async (ctx) => {

});

router.post('/api/calendar-plan/delete', async (ctx) => {

});

module.exports = router;
