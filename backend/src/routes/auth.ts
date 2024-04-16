import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { dbConn, doesUserExist, ValidateEmail } from '../utils';

let router = express.Router();

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

  if (!(await doesUserExist(username))) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  // Hash password
  let salt = await bcrypt.genSalt(10);  
  let passwordHash = await bcrypt.hash(password, salt);


  let sql = `INSERT INTO users (username, email, passwordHash, salt) VALUES (?, ?, ?, ?)`;
  dbConn.run(sql, [username, email, passwordHash, salt], (err: Error) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error registering user' });
    } else {
      res.status(201).json({ message: 'User registered successfully' });
    }
  });
});

export default router;
