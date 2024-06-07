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
router.get('/getMsgs', async function(req: Request, res: Response) {
    console.log('Received request to get chat:', req.query);
    const { username1, username2 } = req.query;

    dbConn.all('SELECT message_id FROM chats_messages WHERE (username_a = ? AND username_b = ?) OR (username_b = ? AND username_a = ?)', [username1, username2, username1, username2], (err, rows) => {
        if(err) {
            console.log('Error:', err);
        }
        let ids : [number]
        console.log('Retrieving chat between' + username1 + ' and ' + username2 + ':', rows);
        const idsArray = rows.map((row : any) => row.message_id);
        console.log(rows)
       
        let idsString = idsArray.toString();
        let query : string = 'SELECT message, sender FROM messages WHERE message_id IN (' + idsString + ')'
        dbConn.all(query, (err, rows) => {
            if(err) {
                console.log('Error:', err);
            }
            console.log('Retrieved chat:', rows);
            res.status(200).json(rows);
        });
    });
});


export default router;