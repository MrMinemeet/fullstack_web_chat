import { Database } from 'sqlite3';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import sharp from 'sharp';
import bcrypt from 'bcrypt';
import axios from 'axios';

let dbConn = new Database('local.db', );
dbConn.serialize(() => {
	try {
		createTable(dbConn);
		createFileTable(dbConn);
		createFileMessageTable(dbConn);
		createTableChats(dbConn);
		createTableMessages(dbConn);
		createTableChatsMessages(dbConn);
	} catch (err: any) {
		console.error(err);
		process.exit(1);
	}
});

function createTable(db: Database) {
	db.run(`
	CREATE TABLE IF NOT EXISTS users (
		username TEXT PRIMARY KEY, 
		visibleName TEXT, 
		email TEXT, 
		passwordHash TEXT, 
		profilePic TEXT DEFAULT NULL,
		defaultPic TEXT DEFAULT ''
	)`);
}

function createFileTable(db: Database) {
	db.run(`
	CREATE TABLE IF NOT EXISTS files (
		id INTEGER PRIMARY KEY AUTOINCREMENT, 
		filename TEXT,
		length INT,
		fileContent BLOB
	)`);
}

function createFileMessageTable(db: Database) {
	db.run(`
	CREATE TABLE IF NOT EXISTS FileMessageMap (
		fileId INT,
		msgId INT,
		PRIMARY KEY (fileId, msgId),
		FOREIGN KEY (fileId) REFERENCES Files(fileId),
		FOREIGN KEY (msgId) REFERENCES Messages(msgId)
	)`);
}

function createTableChats(db: Database) {
	db.run(`CREATE TABLE IF NOT EXISTS chats (username_a TEXT, username_b TEXT, PRIMARY KEY (username_a, username_b))`);
}

function createTableMessages(db: Database) {
	db.run(`CREATE TABLE IF NOT EXISTS messages (message_id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT, sender TEXT, FOREIGN KEY(sender) REFERENCES users(username))`);
}

function createTableChatsMessages(db: Database) {
	db.run(`CREATE TABLE IF NOT EXISTS chats_messages (username_a TEXT, username_b TEXT, message_id INTEGER, PRIMARY KEY (username_a, username_b, message_id))`);
}

export async function doesUserExist(username: string): Promise<boolean> {
	let sql = `SELECT passwordHash FROM users WHERE username = ?`;
	return new Promise((resolve, reject) => {
		dbConn.get(sql, [username], (err: Error, row: any) => {
			if (err) {
				console.error(err);
				reject(err);
			}
			resolve(row !== undefined);
		});
	});
}

export enum FileStatus {
	NonExisting,
	Existing,
	Deleted
}

/**
 * Check if a file exists in the database
 * @param {number} fileId the id of the file to check
 * @returns {Promise<FileStatus>} a promise that resolves with the status of the file
 */
export async function doesFileExist(fileId: number): Promise<FileStatus> {
	const sql = `SELECT * FROM files WHERE id = ?`;
	return new Promise((resolve, reject) => {
		dbConn.get(sql, [fileId], (err: Error, row: any) => {
			if (err) {
				console.error(err);
				reject(err);
			}
			if(!row) {
				// Never existed
				resolve(FileStatus.NonExisting);
			} else if (row.fileContent === null) {
				// Deleted
				resolve(FileStatus.Deleted);
			} else {
				// Exists
				resolve(FileStatus.Existing);
			}
		});
	});
}

/**
 * Delete the file from the database by clearing the blob
 * @param {number} fileId the id of the file to delete
 * @returns {Promise<void>} a promise that resolves when the file is deleted
 */
export async function deleteFile(fileId: number): Promise<void> {
	const sql = `UPDATE files SET fileContent = NULL WHERE id = ?`;
	return new Promise((resolve, reject) => {
		dbConn.run(sql, [fileId], (err: Error) => {
			if (err) {
				console.error(err);
				reject(err);
			}
			resolve();
		});
	});
}

/**
 * Get the file from the database
 * @param {number} fileId the id of the file to get
 * @returns {Promise<Blob>} a promise that resolves with the file
 */
export async function getFile(fileId: number): Promise<[string, number, Blob]> {
	const sql = `SELECT filename, length, fileContent FROM files WHERE id = ?`;
	return new Promise((resolve, reject) => {
		dbConn.get(sql, [fileId], (err: Error, row: any) => {
			if (err) {
				console.error(err);
				reject(err);
			}
			resolve([row.filename, row.length, row.fileContent]);
		});
	});
}

/**
 * Add a file to the database
 * @param {string} filename the name of the file
 * @param {Buffer} fileContent the content of the file
 * @returns 
 */
export async function addFile(filename: string, fileContent: Buffer): Promise<number> {
	const sql = `INSERT INTO files (filename, length, fileContent) VALUES (?, ?, ?)`;
	return new Promise((resolve, reject) => {
		dbConn.run(sql, [filename, fileContent.length, fileContent], function(err: Error) {
			if (err) {
				console.error(err);
				reject(err);
			}
			// Return the id of the file
			resolve((this as any).lastID);
		});
	});
}

/**
 * Validates an email address
 * @param mail the email to validate
 * @returns true if the email is valid, false otherwise
 */
export function ValidateEmail(mail:string): boolean {
	const re = /\S+@\S+\.\S+/;
	return re.test(mail);
}

/**
 * Middleware to check if a user is authenticated.
 * Sets flags in additionalInfo.
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
	if(!req.additionalInfo.jwtProvided) {
		console.info('Denied: No JWT provided')
		res.status(401).json({ message: 'No JWT provided' });
		return;
	}
	if(req.additionalInfo.jwtVerifyError || req.additionalInfo.jwtExpired) {
		console.info('Denied: JWT had an error or was expired')
		res.status(401).json({ message: 'Invalid authentication token provided' });
		return;
	}
	next();
}

/**
 * Middleware to verify a JWT token and set flags in additionalInfo
 */
export function verifyJwt(req: Request, res: Response, next: NextFunction): void {
	const jwtSecret = process.env.JWT_SECRET;
	if (!jwtSecret) {
		console.error('JWT_SECRET not set');
		res.status(500).json({ message: 'Server error' });
		return;
	}

	// Add information to req
	req.additionalInfo = {
		jwtProvided: false,
		jwtVerifyError: false,
		jwtExpired: false,
		jwtPayload: null
	};

	let token = req.headers.authorization;
	if (!token) {
		next();
		return;
	}
	token = token.replace('Bearer ', '');
	req.additionalInfo.jwtProvided = true;
	jwt.verify(token, jwtSecret, (err, decoded) => {
		if (err) {
			req.additionalInfo.jwtVerifyError = true;
			if (err.name === 'TokenExpiredError') {
				req.additionalInfo.jwtExpired = true;
			}
		} else {
			req.additionalInfo.jwtPayload = decoded;
		}
		console.debug(req.additionalInfo);
		next();
	});
}

/**
 * Generates a JWT token with the given secret and username that expires in 1 hour
 * @param jwtSecret The secret to use for the JWT
 * @param username The username to include in the JWT
 * @returns The generated JWT
 */
export function generateJWT(jwtSecret: string, username: string): string {
   return jwt.sign({ username }, jwtSecret, { expiresIn: '1h' });
}

/**
 * Resizes an image.
 * Does not enlarge the image.
 * @param image The image to resize
 * @param width The width of the resized image
 * @param height The height of the resized image
 * @returns The resized image
 */
export async function resizeImage(image: Buffer, width: number = 200, height: number = 200): Promise<Buffer> {
	return await sharp(image)
		.resize(width, height, {
			fit:sharp.fit.inside,
			withoutEnlargement: true
		})
		.toBuffer();
}

/**
 * Hashes a password with bcrypt
 * @param password The password to hash
 * @param salt The salt to use for the hash, if not provided a new salt will be generated
 * @returns The hashed password
 */
export async function hashPassword(password: string, salt: string | undefined = undefined): Promise<string> {
	return await bcrypt.hash(password, salt || await bcrypt.genSalt(10));
}

/**
 * Creates a identicon avatar for a username
 * @param username The username to create the avatar for/with
 * @returns The SVG string of the avatar
 */
export async function createDefaultAvatar(username: string): Promise<string> {
	const avatar = await axios.get("https://api.dicebear.com/8.x/identicon/svg",
		{
			params: {
				seed: username,
				backgroundType: "solid",
				backgroundColor: "4682b4",
			}
		}

	);
	if (avatar.status !== 200) {
		console.error(`Failed to get avatar for ${username} from dicebear`);
		return "";
	}
	const avatarSvg = avatar.data as string;
	return avatarSvg;
}

export { dbConn }