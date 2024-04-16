import express, { Request, Response, NextFunction } from 'express';
import { dbConn } from '../utils';

let router = express.Router();

router.post('/uploadPicture', async function(req: Request, res: Response, next: NextFunction) {

});
router.get('/retrievePicture', async function(req: Request, res: Response, next: NextFunction) {
  // Get the username from the request
  const username = req.query.username;
  if (!username) {
    res.status(400).json({ message: "No 'username' provided" });
    return;
  }

  const sql = `SELECT profilePic FROM users WHERE username = ?`;
  dbConn.get(sql, [username], (err: Error, row: any) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error retrieving picture' });
      return;
    }
    if (!row) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if(!row.profilePic){
      res.status(404).json({ message: `${username} has no profile picture set` });
      return;
    }

    res.status(200).json(row.profilePic);
  });

});

export default router;
