const cli = require('cac')();
const connection = require('./db');

cli
    .command('delete', '退会中のユーザーを削除')
    .action(async () => {
        console.log('削除開始...')

        let sql = `
            SELECT user_id, user_name, mail
            FROM user
            WHERE deleted_at IS NOT NULL
              AND CURRENT_DATE() > DATE_ADD(deleted_at, INTERVAL 30 DAY)`;
        let [users] = await connection.query(sql);

        if (users.length === 0) {
            console.log('退会中のユーザーが見つかりませんでした');
        }

        for (let i = 0; i < users.length; i++) {
            let user = users[i];
            let userId = user['user_id'];
            let userName = user['user_name'];
            let mail = user['mail'];

            console.log(`削除しています... -> ${mail} - ${userName} (${userId})`);

            sql = 'DELETE FROM line_login WHERE user_id = ?';
            await connection.query(sql, [userId]);

            sql = 'DELETE FROM line_notice_user_id WHERE user_id = ?';
            await connection.query(sql, [userId]);

            sql = 'DELETE FROM user_authentication_key WHERE user_id = ?';
            await connection.query(sql, [userId]);

            sql = 'DELETE FROM user_reset_password_key WHERE user_id = ?';
            await connection.query(sql, [userId]);

            sql = 'DELETE FROM user_two_factor_authentication WHERE user_id = ?';
            await connection.query(sql, [userId]);

            sql = 'DELETE FROM user_message WHERE user_id = ?';
            await connection.query(sql, [userId]);

            sql = 'DELETE FROM user_login_pc WHERE user_id = ?';
            await connection.query(sql, [userId]);

            sql = 'DELETE FROM session WHERE user_id = ?';
            await connection.query(sql, [userId]);

            sql = 'DELETE FROM notice_day WHERE notice_id IN (SELECT notice_id FROM notice WHERE user_id = ?)';
            await connection.query(sql, [userId]);

            sql = 'DELETE FROM notice_medicine WHERE notice_id IN (SELECT notice_id FROM notice WHERE user_id = ?)';
            await connection.query(sql, [userId]);

            sql = 'DELETE FROM notice_time WHERE notice_id IN (SELECT notice_id FROM notice WHERE user_id = ?)';
            await connection.query(sql, [userId]);

            sql = 'DELETE FROM notice WHERE user_id = ?';
            await connection.query(sql, [userId]);

            sql = `
                DELETE
                FROM medicine_take_time
                WHERE medicine_id IN (SELECT medicine_id
                                      FROM medicine
                                      WHERE group_id IN (SELECT group_id FROM medicine_group WHERE user_id = ?))`;
            await connection.query(sql, [userId]);

            sql = `
                SELECT image
                FROM medicine
                WHERE group_id IN (SELECT group_id FROM medicine_group WHERE user_id = ?)`;

            sql = 'DELETE FROM medicine WHERE group_id IN (SELECT group_id FROM medicine_group WHERE user_id = ?)';
            await connection.query(sql, [userId]);

            sql = 'DELETE FROM medicine_group WHERE user_id = ?';
            await connection.query(sql, [userId]);

            sql = 'DELETE FROM user WHERE user_id = ?';
            await connection.query(sql, [userId]);
        }

        console.log('削除終了...');
        process.exit(0);
    });

cli
    .command('delete-all', 'すべてのユーザーを削除')
    .action(async () => {
        console.log('削除開始...')

        let sql;

        sql = 'SET FOREIGN_KEY_CHECKS = 0';
        await connection.query(sql);

        sql = 'TRUNCATE line_login';
        await connection.query(sql);

        sql = 'TRUNCATE line_notice_user_id';
        await connection.query(sql);

        sql = 'TRUNCATE notice_day';
        await connection.query(sql);

        sql = 'TRUNCATE notice_medicine';
        await connection.query(sql);

        sql = 'TRUNCATE notice_time';
        await connection.query(sql);

        sql = 'TRUNCATE notice';
        await connection.query(sql);

        sql = 'TRUNCATE medicine_take_time';
        await connection.query(sql);

        sql = 'TRUNCATE medicine';
        await connection.query(sql);

        sql = 'TRUNCATE medicine_group';
        await connection.query(sql);

        sql = 'TRUNCATE user_authentication_key';
        await connection.query(sql);

        sql = 'TRUNCATE user_login_log';
        await connection.query(sql);

        sql = 'TRUNCATE user_login_pc';
        await connection.query(sql);

        sql = 'TRUNCATE user_message';
        await connection.query(sql);

        sql = 'TRUNCATE user_reset_password_key';
        await connection.query(sql);

        sql = 'TRUNCATE user_two_factor_authentication';
        await connection.query(sql);

        sql = 'TRUNCATE session';
        await connection.query(sql);

        sql = 'TRUNCATE user';
        await connection.query(sql);

        sql = 'SET FOREIGN_KEY_CHECKS = 1';
        await connection.query(sql);

        console.log('削除終了...');
        process.exit(0);
    });

cli
    .command('delete-sql', 'データを削除するSQLを表示')
    .action(() => {
        console.log('TRUNCATE: ');
        console.log();
        console.log('SET FOREIGN_KEY_CHECKS = 0;');
        console.log('TRUNCATE line_login;');
        console.log('TRUNCATE line_notice_user_id;');
        console.log('TRUNCATE medicine;');
        console.log('TRUNCATE medicine_group;');
        console.log('TRUNCATE medicine_take_time;');
        console.log('TRUNCATE notice;');
        console.log('TRUNCATE notice_day;');
        console.log('TRUNCATE notice_medicine;');
        console.log('TRUNCATE notice_time;');
        console.log('TRUNCATE session;');
        console.log('TRUNCATE user;');
        console.log('TRUNCATE user_authentication_key;');
        console.log('TRUNCATE user_login_log;');
        console.log('TRUNCATE user_login_pc;');
        console.log('TRUNCATE user_message;');
        console.log('TRUNCATE user_reset_password_key;');
        console.log('TRUNCATE user_two_factor_authentication;');
        console.log('SET FOREIGN_KEY_CHECKS = 1;');
        console.log();

        process.exit(0);
    });

cli.help();
cli.parse();