import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import authRouter from './routes/auth';
import { verifyJwt } from './utils';

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);

// Perform checks for JWT token on all routes after this middleware
app.use(verifyJwt);

console.log('App running at "http://localhost:3000/"')

module.exports = app;
