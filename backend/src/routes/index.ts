import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { dbConn, doesUserExist } from '../utils';

let router = express.Router();

/* GET home page. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
  res.status(200).json({ message: 'Welcome to the API' });
});

router.post('/register', async function(req: Request, res: Response, next: NextFunction) {
  let { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: 'Invalid body' });
    return;
  }

  if (doesUserExist(username)) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  // Hash password
  let salt = await bcrypt.genSalt(10);  
  let passwordHash = await bcrypt.hash(password, salt);


  let sql = `INSERT INTO users (username, passwordHash, salt) VALUES (?, ?, ?)`;
  dbConn.run(sql, [username, passwordHash, salt], (err: Error) => {
    if (err) {
      res.status(400).json({ message: 'Error registering user' });
    } else {
      res.status(201).json({ message: 'User registered successfully' });
    }
  });
});

export default router;
