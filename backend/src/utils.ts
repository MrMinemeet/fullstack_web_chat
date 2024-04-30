import { Database } from 'sqlite3';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import sharp from 'sharp';

let dbConn = new Database('local.db', );
dbConn.serialize(() => {
	createTable(dbConn);
});

function createTable(db: Database) {
	db.run(`CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, visibleName TEXT, email TEXT, passwordHash TEXT, profilePic TEXT DEFAULT NULL)`);
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
 * Returns the image type of a blob
 * @param blob the blob to check
 * @returns the image type of the blob
 */
export function getImageType(blob: any): string {
	const firstByte = blob[0];
	const secondByte = blob[1];

	if (firstByte === 0x89 && secondByte === 0x50) {
		return 'image/png';
	} else if (firstByte === 0xFF && secondByte === 0xD8) {
		return 'image/jpeg';
	} else {
		return 'application/octet-stream';
	}
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

export { dbConn }