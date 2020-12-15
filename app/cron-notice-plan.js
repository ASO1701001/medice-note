const cron = require('node-cron');
const dateformat = require('dateformat');
const connection = require('./db');
const config = require('../config.json');
const line = require('@line/bot-sdk');
const client = new line.Client(config.line_bot);

module.exports = cron.schedule('0 0 7 * * *', async () => {
    let sql = `
        SELECT cp.user_id, lnui.line_user_id, GROUP_CONCAT('・', cp.plan_title SEPARATOR '\\n') as plan_title
        FROM calendar_plan cp
                 LEFT JOIN line_notice_user_id lnui on cp.user_id = lnui.user_id
        WHERE lnui.user_id IS NOT NULL
          AND plan_date = CURRENT_DATE
          AND plan_notice = true
        GROUP BY cp.user_id`;
    let [plans] = await connection.query(sql);

    let date = dateformat(new Date(), 'yyyy年mm月dd日');

    for (const plan of plans) {
        let to = plan['line_user_id'];
        let message = {
            type: 'text',
            text: `${date}の予定をお知らせします\n\n${plan['plan_title']}\n\n詳細な情報はカレンダーから\nhttps://www.medice-note.vxx0.com/medicine-calendar`
        };

        await client.pushMessage(to, message)
            .then(() => {

            })
            .catch(async error => {
                console.log(error)
            });
    }
});
