import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';

import { isAuthenticated, doesFileExist, getFile, addFile, deleteFile, FileStatus } from '../utils';

let router = express.Router();

/**
 * Uploads a file to the server.
 * Definitly not best implementation with the raw body parser and partial stacktrace in the response of an error. It's fine for now
 * @returns 201 if the file is successfully uploaded
 * @returns 400 if the body is invalid
 * @returns 413 if the file is too large
 */
router.put('/upload', isAuthenticated, bodyParser.raw({ type: '*/*', limit: '10mb' }), async function(req: Request, res: Response, _: NextFunction) {
	// Get filename from URL param
	const fileName = req.query.name as string;
	// Get file content from body which was sent as binary
	const fileContent = Buffer.from(req.body);
	console.debug(`Received file ${fileName} with ${fileContent.length} bytes`);
	if (!fileContent || !fileName || fileContent.length === 0 || fileName.trim().length === 0) {
		return res.status(400).json({ message: 'Invalid body' });
	}

	// Add the file to the database
	const fileId = await addFile(fileName, fileContent);
	res.status(201).json({ fileId: fileId });
});

/**
 * Retrieves a file from the server.
 * @returns 200 if the file is successfully retrieved
 */
router.get('/download', checkFileExistance, async function(req: Request, res: Response, _: NextFunction) {
	const fileId = parseInt(req.query.fileId as string);

	// Get the file from the database
	const [name, length, contentBlob] = await getFile(fileId);
	console.debug(`Sending file ${name} (${fileId}) with ${length} bytes`);

	// Set the headers and send the file
	res.setHeader('Content-Disposition', `attachment; filename=${decodeURIComponent(name)}`);
	res.setHeader('Content-Type', 'application/octet-stream');
	res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
	res.status(200).send(contentBlob);
});

/**
 * Deletes a file from the server.
 * @returns 200 if the file is successfully deleted
 */
router.delete('/remove', isAuthenticated, checkFileExistance, async function(req: Request, res: Response, _: NextFunction) {
	const fileId = parseInt(req.query.fileId as string);
	// Check if the deleting user has sent the message with the file
	await deleteFile(fileId);
	res.status(200).json({ message: 'File successfully deleted' });
});

/**
 * Middleware to check if a file exists.
 * @param next called if the file exists
 * @returns 400 if the fileId is missing or invalid
 * @returns 404 if the file does not exist
 * @returns 410 if the file has already been deleted
 */
async function checkFileExistance(req: Request, res: Response, next: NextFunction) {
	if (!req.query.fileId) {
		return res.status(400).json({ message: 'Missing fileId' });
	}
	const fileId = parseInt(req.query.fileId as string);
	if (isNaN(fileId)) {
		return res.status(400).json({ message: 'Invalid fileId' });
	}

	// Check if the file exists
	const fileExists = await doesFileExist(fileId);
	if (fileExists === FileStatus.NonExisting) {
		// Return 404 Not Found if the file does not exist
		return res.status(404).json({ message: 'File not found' });
	} else if (fileExists === FileStatus.Deleted) {
		// Return 410 Gone if the file has already been deleted
		return res.status(410).json({ message: 'File was deleted' });
	}

	next();
}

export default router;