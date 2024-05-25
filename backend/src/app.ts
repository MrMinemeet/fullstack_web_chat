import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import bodyParser from 'body-parser';

import { verifyJwt } from './utils';
import authRouter from './routes/auth';
import profileRouter from './routes/profile';
let app = express();

app.use(logger('dev'));
app.use((req, res, next) => { console.log(req.method, req.url); next(); });
app.use(bodyParser.json({ limit: '10mb' })); // Increase the limit to 10mb (required for profile picture upload)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);

// Perform checks for JWT token on all routes after this middleware
app.use(verifyJwt);
app.use('/profile', profileRouter);

console.log('App running at "http://localhost:3000/"')

module.exports = app;
