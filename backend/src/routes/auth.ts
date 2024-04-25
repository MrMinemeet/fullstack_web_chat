import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { dbConn, doesUserExist, ValidateEmail } from '../utils';

let router = express.Router();

/**
 * Registers a user.
 * Data is sent as a JSON object in the request body.
 * @param username the username of the user
 * @param email the email of the user
 * @param password the password of the user
 * @returns 400 if the body is invalid, if the email is invalid, or if the user already exists
 * @returns 500 if there is an error registering the user
 * @returns 201 if the user is registered successfully with the JWT in the response
 */
router.post('/register', async function(req: Request, res: Response, next: NextFunction) {
  let { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ message: 'Invalid body' });
    return;
  }

  // Verify that email is actually in an email format
  if (!ValidateEmail(email)) {
    res.status(400).json({ message: 'Invalid email' });
    return;
  }

  if (await doesUserExist(username)) {
    res.status(409).json({ message: 'User already exists' });
    return;
  }

  // Hash password
  let salt = await bcrypt.genSalt(10);  
  let passwordHash = await bcrypt.hash(password, salt);

  let sql = `INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?)`;
  dbConn.run(sql, [username, email, passwordHash], (err: Error) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error registering user' });
    } else {
      // TODO: Send JSWT as response
      res.status(201).json({ message: 'User registered successfully' });
    }
  });
});

/**
 * Logs in a user.
 * Data is sent as a JSON object in the request body.
 * @param username the username of the user
 * @param password the password of the user
 * @returns 400 if the body is invalid
 * @returns 401 if the username or password is invalid
 * @returns 500 if there is an error logging in
 * @returns 200 if the user is logged in successfully with the JWT in the response
 */
router.post('/login', async function(req: Request, res: Response, next: NextFunction) {
  let { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: 'Invalid body' });
    return;
  }

  let sql = `SELECT passwordHash FROM users WHERE username = ?`;
  dbConn.get(sql, [username], async (err: Error, row: any) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error logging in' });
      return;
    }
    if (!row) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    let passwordHash = row.passwordHash;
    if (!(await bcrypt.compare(password, passwordHash))) { // Salt is includeed in passwordHash
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }
    // TODO: Return JSWT
    res.status(200).json({ message: 'Login successful' });

  });
});

export default router;
