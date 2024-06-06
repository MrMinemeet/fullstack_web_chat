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
  socket.on('init', (msg) => {
    console.log('Started chat:' + msg.receiver + ' ' + msg.sender);
    io.to([msg.receiver, msg.sender]).emit('message', 'initialized chat');
  });
  socket.on('message', (msg) => {
    socket.join([msg.receiver, msg.sender]);
    console.log('Message:' + msg.sender + ' to ' + msg.receiver + ' ' + msg.content);

    io.to([msg.receiver, msg.sender]).emit('message', msg);
  });
});

httpServer.listen(3001);
console.log('App running at "http://localhost:3000/"')

module.exports = app;
