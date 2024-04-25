import express, { Request, Response, NextFunction } from 'express';
import { dbConn, getImageType, resizeImage, isAuthenticated } from '../utils';
import { Statement } from 'sqlite3';

let router = express.Router();

/**
 * Uploads a picture for the authenticated user.
 * Data is sent as a JSON object in the request body.
 * The picture will be resized to 100x100.
 * @param pictureB64 the base64 encoded picture
 * @returns 400 if the body is invalid
 * @returns 401 if the user is not authenticated
 * @returns 500 if there is an error uploading the picture
 * @returns 200 if the picture is uploaded successfully
 */
router.put('/picture', isAuthenticated, async function(req: Request, res: Response, next: NextFunction) {
  // Get the username and picture(blob) from the request
  const pictureB64 = req.body;

  if (!pictureB64) {
    res.status(400).json({ message: "Invalid body" });
    return;
  }

  // Decode the base64 picture
  const originalPicture = Buffer.from(pictureB64, 'base64');

  // Resize the picture
  const resizedPicture = await resizeImage(originalPicture, 100, 100);

  // Save the picture to the database
  const sql = `UPDATE users SET profilePic = ? WHERE username = ?`;
  dbConn.run(sql, [resizedPicture, req.additionalInfo.jwtPayload.username], (err: Error) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error uploading picture' });
      return;
    }

    res.status(200).json({ message: 'Picture uploaded successfully' });
  });
});

/**
 * Retrieves a picture for a user.
 * @param username the username of the user
 * @returns 400 if no username is provided
 * @returns 404 if the user is not found, if the user has no profile picture
 * @returns 500 if there is an error retrieving the picture
 * @returns the picture with the correct content type if successful
 */
router.get('/picture', async function(req: Request, res: Response, next: NextFunction) {
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

/**
 * Deletes a picture for the authenticated user.
 * Data is sent as a JSON object in the request body.
 * @returns 400 if no username is provided
 * @returns 401 if the user is not authenticated
 * @returns 500 if there is an error deleting the picture
 * @returns 200 if the picture is deleted successfully
 */
router.delete('/picture', isAuthenticated, async function(req: Request, res: Response, next: NextFunction) {
  // Delete the picture from the database
  const sql = `UPDATE users SET profilePic = NULL WHERE username = ?`;
  dbConn.run(sql, [req.additionalInfo.jwtPayload.username], (err: Error) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting picture' });
      return;
    }

    res.status(200).json({ message: 'Picture deleted successfully' });
  });
});

export default router;
