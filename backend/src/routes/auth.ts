import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';

import { MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH, MIN_PASSWORD_LENGTH } from '../constants';
import { dbConn, doesUserExist, generateJWT, ValidateEmail, verifyJwt, isAuthenticated, hashPassword, createDefaultAvatar } from '../utils';

const jwtSecret = process.env.JWT_SECRET;
let router = express.Router();

router.options("/*", function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.send(next());
});
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
    res.status(400).json({ message: 'Missing username, email or password' });
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
  } else if (username.length > MAX_USERNAME_LENGTH) {
    res.status(400).json({ message: `Username too long. ${MAX_USERNAME_LENGTH} characters max.` });
    return;
  } else if (username.length < MIN_USERNAME_LENGTH) {
    res.status(400).json({ message: `Username too short. ${MIN_USERNAME_LENGTH} characters min.` });
    return;
  }

  if (MIN_PASSWORD_LENGTH > password.length) {
    res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    return;
  }

  // Hash password
  let passwordHash = await hashPassword(password);

  // Get default avatar and convert it to base64
  const avatarSvg = await createDefaultAvatar(username);
  const base64Avatar = `data:image/svg+xml;base64,${Buffer.from(avatarSvg).toString('base64')}`;

  // Set username as visibleName on registration
  dbConn.run(`ÌNSERT INTO user (
      username,
      visibleName,
      email,
      passwordHash,
      profilePic,
      defaultPic
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [ username, username, email, passwordHash, null, base64Avatar ], (err: Error) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error registering user' });
    }
    // Send JWT as response
    res.status(201).json({ message: 'User registered successfully' });
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
  if (!jwtSecret) {
    console.error('JWT_SECRET not set');
    return res.status(500).json({ message: 'Error logging in' });
  }

  let { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }

  dbConn.get(`SELECT passwordHash 
    FROM user 
    WHERE username = ?`, [username], async (err: Error, row: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error logging in' });
    }
    if (!row) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    let passwordHash = row.passwordHash;
    if (!(await bcrypt.compare(password, passwordHash))) { // Salt is includeed in passwordHash
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    // Return JSWT
    res
      .status(200)
      .send({status: 'success', token: generateJWT(jwtSecret, username), expiresAt: new Date(Date.now() + 3_600_000)});

  });
});

/**
 * Changes the password of an authenticated user.
 * The new password is sent as a JSON object in the request body with the key 'password'.
 * @returns 400 if the body is invalid
 * @returns 401 if the user is not authenticated
 * @returns 500 if there is an error changing the password
 * @returns 200 if the password is changed successfully
 * 
 * 
 */
router.post('/changePassword', verifyJwt, isAuthenticated, async function(req: Request, res: Response, next: NextFunction) {
  const password = req.body.password;
  if (!password) {
    res.status(400).json({ message: 'Missing password' });
    return;
  }
  if (MIN_PASSWORD_LENGTH > password.length) {
    res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    return;
  }

  const username = req.additionalInfo.jwtPayload.username;
  const passwordHash = await hashPassword(password);

  let sql = `UPDATE users SET passwordHash = ? WHERE username = ?`;
  dbConn.run(sql, [passwordHash, username], (err: Error) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error changing password' });
    } else {
      res.status(200).json({ message: 'Password changed successfully' });
    }
  });
});

export default router;
