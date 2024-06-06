import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import bodyParser from 'body-parser';

import { verifyJwt } from './utils';
import authRouter from './routes/auth';
import profileRouter from './routes/profile';
import fileRouter from './routes/file';
import chatRouter from './routes/chat';
import { createServer } from 'http';
import { dbConn, isAuthenticated } from './utils';


var cors = require('cors');
let app = express();

app.use(logger('dev'));
app.use((req, res, next) => { console.log(req.method, req.url); next(); });
app.use(bodyParser.json({ limit: '10mb' })); // Increase the limit to 10mb (required for profile picture upload)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "..", 'public')));
app.use(cors())

app.use('/auth', authRouter);

// Perform checks for JWT token on all routes after this middleware
app.use(verifyJwt);
app.use('/profile', profileRouter);
app.use('/chat', chatRouter);
app.use('/file', fileRouter);

import { Server } from "socket.io";

const httpServer = createServer(app);
const io = new Server(httpServer, {});

io.on("connection", (socket) => {
  console.log('a user connected');
  socket.on('message', (msg) => {
    socket.join([msg.receiver, msg.sender]);
    console.log('Message:' + msg.sender + ' to ' + msg.receiver + ' ' + msg.content);

    let chat_id : number = 0;
    let message_id : number = 0;
    dbConn.run('INSERT INTO messages (message) VALUES (?) RETURNING message_id', [msg.content], function(err : any)  {
      //message_id = this.lastID;

      if(err) {
          console.log('Error:', err);
      }
      dbConn.run('INSERT INTO chats_messages (username_a, username_b, message_id) VALUES (?, ?, ?)', [msg.sender, msg.receiver, message_id], (err : any) => {});   

      });
      dbConn.run('INSERT INTO chats (username_a, username_b) VALUES (?, ?)', [msg.sender, msg.receiver], (err : any) => {
      console.log('Stored chat message:', msg.content);
  });
    io.to([msg.receiver, msg.sender]).emit('message', msg);
  });
});

httpServer.listen(3001);
console.log('App running at "http://localhost:3000/"')

module.exports = app;
