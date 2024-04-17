import express, { Request, Response, NextFunction } from 'express';
import { dbConn, getImageType, resizeImage } from '../utils';

let router = express.Router();

router.post('/uploadPicture', async function(req: Request, res: Response, next: NextFunction) {
  // Get the username and picture(blob) from the request
  const { username, pictureB64} = req.body;

  if (!username || !pictureB64) {
    res.status(400).json({ message: "Invalid body" });
    return;
  }

  // TODO: Use JWT to verify the user (users should only be able to upload their own picture)


  // Decode the base64 picture
  const originalPicture = Buffer.from(pictureB64, 'base64');

  // Resize the picture
  const resizedPicture = await resizeImage(originalPicture, 100, 100);

  // Save the picture to the database
  const sql = `UPDATE users SET profilePic = ? WHERE username = ?`;

  dbConn.run(sql, [resizedPicture, username], (err: Error) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error uploading picture' });
      return;
    }

    res.status(200).json({ message: 'Picture uploaded successfully' });
  });
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

    res.setHeader('Content-Type', getImageType(row.profilePic));

    res.send(row.profilePic);
  });
});

router.delete('/deletePicture', async function(req: Request, res: Response, next: NextFunction) {
  // Get the username from the request
  const username = req.query.username;

  if (!username) {
    res.status(400).json({ message: "No 'username' provided" });
    return;
  }

  // TODO: Check JWT for user verification

  // Delete the picture from the database
  const sql = `UPDATE users SET profilePic = NULL WHERE username = ?`;
  dbConn.run(sql, [username], (err: Error) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting picture' });
      return;
    }

    res.status(200).json({ message: 'Picture deleted successfully' });
  });
});

export default router;
