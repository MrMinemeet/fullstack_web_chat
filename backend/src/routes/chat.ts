import express, { Request, Response } from 'express';
import { dbConn, isAuthenticated } from '../utils';

let router = express.Router();

/**
 * Retrieves a list of all users.
 * @returns 200 if the list of users is successfully retrieved
 * @returns 500 if there is an error retrieving the list of users
 */
router.get('/listUsers', isAuthenticated, async function(req: Request, res: Response) {
    const user = req.additionalInfo.jwtPayload.username;
   
	dbConn.all('SELECT username, visibleName FROM users WHERE username != ?', 
        [user], (err: Error, rows: any) => {
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

    //TODO make username order not matter
    dbConn.all('SELECT message_id FROM chats_messages WHERE username_a = ? AND username_b = ?', [username1, username2], (err, rows) => {
        if(err) {
            console.log('Error:', err);
        }
        let ids : [number]
        
        const idsArray = rows.map((row : any) => row.message_id);
        let idsString = idsArray.toString();
        let query : string = 'SELECT message FROM messages WHERE message_id IN (' + idsString + ')'
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