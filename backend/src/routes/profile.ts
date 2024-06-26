import express, { Request, Response, NextFunction } from 'express';

import { MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH } from '../constants';
import { dbConn, resizeImage, isAuthenticated } from '../utils';

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
  // Get picture(base64 blob) from the request
  const pictureB64: string = req.body.image;

  if (!pictureB64) {
    return res.status(400).json({ message: "Invalid body" });
  }
  try {
    // Decode the base64 picture
    const [mimeType, base64Img] = pictureB64.split(',');
    const originalPicture = Buffer.from( base64Img, 'base64');

    // Resize the picture if not GIF
    let picture: string = pictureB64;
    if (!mimeType.includes('image/gif')) {
      const resizedPicture = await resizeImage(originalPicture, 256, 256);
      picture = `${mimeType},${resizedPicture.toString('base64')}`;
    };

    // Save the picture to the database
    dbConn.run(`UPDATE user
      SET profilePic = ?
      WHERE username = ?`, [picture, req.additionalInfo.jwtPayload.username], (err: Error) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error uploading picture' });
      }

      res.status(200).json({ message: 'Picture uploaded successfully' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading picture' });
  }
});

/**
 * Retrieves a picture for a user.
 * @param username the username of the user
 * @returns 500 if there is an error retrieving the picture
 * @returns the picture with the correct content type if successful
 */
router.get('/picture', async function(req: Request, res: Response, next: NextFunction) {
  // Get the username from the request
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ message: "No 'username' provided" });
  }

  dbConn.get(`SELECT profilePic, defaultPic
    FROM user
    WHERE username = ?`, [username], (err: Error, row: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error retrieving picture' });
    }
    if (!row) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200);
    if(row.profilePic){
      // Utilize custom profile picture
      res.send(row.profilePic);
    } else {
      // Utilize default profile picture
      res.send(row.defaultPic);
    }
  });
});

/**
 * Deletes a picture for the authenticated user.
 * Data is sent as a JSON object in the request body.
 * @returns 500 if there is an error deleting the picture
 * @returns 200 if the picture is deleted successfully
 */
router.delete('/picture', isAuthenticated, async function(req: Request, res: Response, next: NextFunction) {
  // Delete the picture from the database
  const sql = `UPDATE users SET profilePic = NULL WHERE username = ?`;
  dbConn.run(sql, [req.additionalInfo.jwtPayload.username], (err: Error) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting custom picture' });
      return;
    }

    res.status(200).json({ message: 'Custom picture deleted successfully' });
  });
});

/**
 * Updates the visible name for the authenticated user.
 * @param visibleName the new visible name in the request body
 * @returns 200 if the visible name is updated successfully 
 * @returns 400 if the body is invalid or the visible name is too long
 * @returns 500 if there is an error updating the visible name
 */
router.put('/visibleName', isAuthenticated, async function(req: Request, res: Response, next: NextFunction) {
  // Get the visibleName from the request
  const visibleName = req.body.visibleName;
  if (!visibleName) {
    res.status(400).json({ message: "No name provided" });
    return;
  } else if (visibleName.length > MAX_USERNAME_LENGTH) {
    res.status(400).json({ message: `Visible name too long. ${MAX_USERNAME_LENGTH} characters max.` });
    return;
  } else if (visibleName.length < MIN_USERNAME_LENGTH) {
    res.status(400).json({ message: `Visible name too short. ${MIN_USERNAME_LENGTH} characters min.` });
    return;
  }

  // Update the visibleName in the database
  const sql = `UPDATE users SET visibleName = ? WHERE username = ?`;
  dbConn.run(sql, [visibleName, req.additionalInfo.jwtPayload.username], (err: Error) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating visible name' });
      return;
    }

    res.status(200).json({ message: 'Visible name updated successfully' });
  });
});

/**
 * Retrieves the visible name for a user.
 * @param username the username of the user
 * @returns 200 if the visible name is retrieved successfully
 * @returns 400 if no username is provided
 * @returns 404 if the user is not found
 * @returns 500 if there is an error retrieving the visible name
 */
router.get('/visibleName', async function(req: Request, res: Response, next: NextFunction) {
  const username = req.query.username;
  if (!username) {
    res.status(400).json({ message: "No 'username' provided" });
    return;
  }

  const sql = `SELECT visibleName FROM users WHERE username = ?`;
  dbConn.get(sql, [username], (err: Error, row: any) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error retrieving visible name' });
      return;
    }
    if (!row) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ visibleName: row.visibleName });
  });
});

export default router;
