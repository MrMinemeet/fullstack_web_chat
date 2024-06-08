import express, { Request, Response } from 'express';
import { dbConn, isAuthenticated } from '../utils';

let router = express.Router();

/**
 * Retrieves a list of all users.
 * @returns 200 if the list of users is successfully retrieved
 * @returns 500 if there is an error retrieving the list of users
 */
router.get('/listUsers', isAuthenticated, async function(req: Request, res: Response) {
	dbConn.all('SELECT username, visibleName FROM users', (err: Error, rows: any) => {
		if (err) {
			console.error(err);
			res.status(500).json({ message: 'Error retrieving users' });
			return;
		}
		res.status(200).json(rows);
	});
});

/**
 * Retrieves a list of all users.
 * @returns 200 if the list of users is successfully retrieved
 * @returns 500 if there is an error retrieving the list of users
 */
router.get('/getMsgs', function(req: Request, res: Response) {
    console.log('Received request to get chat:', req.query);
    const username1 = req.query.username1;
    const username2 = req.query.username2;
    let messageLimit = parseInt(req.query.limit as string);

    if (!messageLimit) {
        console.log("No message limit provided, defaulting to 100");
        messageLimit = 100;
    }

    dbConn.all(`SELECT message_id 
        FROM (
            SELECT message_id 
            FROM chats_messages 
            WHERE (username_a = ? AND username_b = ?) OR (username_b = ? AND username_a = ?)
            ORDER BY message_id DESC
            LIMIT ?
        )
        ORDER BY message_id ASC`, [username1, username2, username1, username2, messageLimit], (err, rows) => {
        if(err) {
            console.log('Error:', err);
            return res.status(500).json({ message: 'Error retrieving chat' });
        }
        console.log(`Retrieving chat between ${username1} and ${username2}`);
        const idsArray = rows.map((row : any) => row.message_id);
       
        let idsString = idsArray.toString();
        let query : string = 'SELECT message, sender FROM messages WHERE message_id IN (' + idsString + ')'
        dbConn.all(query, (err, rows) => {
            if(err) {
                console.log('Error:', err);
                return res.status(500).json({ message: 'Error retrieving chat' });
            }
            console.log('Retrieved chat:', rows);
            res.status(200).json(rows);
        });
    });
});


export default router;