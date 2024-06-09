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

export default router;