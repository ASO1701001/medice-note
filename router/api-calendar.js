const Router = require('koa-router');
const router = new Router();
const app = require('../app/app');
const connection = require('../app/db')

router.get('/api/calendar/', async (ctx) => {
    let session = ctx.session;

    let authKey = session.auth_id;
    let userId = await app.getUserId(authKey);

        let start = ctx.request.query['start'];
        let end = ctx.request.query['end'];

    let group = await app.getDefaultGroup(userId);
    let sql = 'SELECT medicine_id as id, medicine_name as title, date_format(starts_date, \'%Y-%m-%d\') as start, ' +
        'date_format(DATE_ADD(starts_date,INTERVAL period DAY),\'%Y-%m-%d\') as end ' +
        'FROM medicine WHERE group_id = ? AND (date_format(starts_date, \'%Y-%m-%d\') ' +
        'BETWEEN ? AND ? OR date_format(DATE_ADD(starts_date,INTERVAL period DAY),\'%Y-%m-%d\') BETWEEN ? AND ?)';

    let [data] = await connection.query(sql, [group,start,end,start,end]);

    return ctx.body = data;

})

module.exports = router;