import express, { Request, Response } from 'express';
import { dbConn, isAuthenticated } from '../utils';
import e from 'express';

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
router.get('/getMsgs', isAuthenticated, async function(req: Request, res: Response) {
    console.log('Received request to get chat:', req.query);
    const { username1, username2 } = req.query;

    if (!username1 || !username2) {
        res.status(400).json({ message: 'Missing username' });
        return;
    } else if (username1 === username2) {
        res.status(400).json({ message: 'Cannot chat with yourself' });
        return;
    } else if (username1 !== req.additionalInfo.jwtPayload.username && username2 !== req.additionalInfo.jwtPayload.username) {
        res.status(403).json({ message: 'You must be one of the users in the chat' });
        return;
    }

    dbConn.all('SELECT message_id FROM chats_messages WHERE (username_a = ? AND username_b = ?) OR (username_b = ? AND username_a = ?)',
        [username1, username2, username1, username2], (err, rows) => {
        if(err) {
            console.log('Error:', err);
        }
        console.log('Retrieving chat between ' + username1 + ' and ' + username2 + ':', rows);
        const idsArray = rows.map((row : any) => row.message_id);
        console.log(rows)
        dbConn.all(`SELECT message, sender, files.filename, files.id as fileId 
            FROM messages
            LEFT JOIN FileMessageMap ON messages.message_id = FileMessageMap.msgId
            LEFT JOIN files ON FileMessageMap.fileId = files.id
            WHERE message_id IN (${idsArray.toString()})`, (err, rows) => {
            if(err) {
                console.log('Error:', err);
                return res.status(500).json({ message: 'Error retrieving chat' });
            }
            console.log('Retrieved chat:', rows);
            res.status(200).json(rows.map((row : any) => {
                return {
                    message: row.message,
                    sender: row.sender,
                    fileName: row.filename || '',
                    fileId: row.fileId || -1
                }
            }));
        });
    });
});


export default router;