import express, { Request, Response, NextFunction } from 'express';
import { isAuthenticated, doesFileExist, getFile, addFile, deleteFile, FileStatus } from '../utils';


let router = express.Router();

/**
 * Uploads a file to the server.
 * @returns 201 if the file is successfully uploaded
 */
router.put('/upload', isAuthenticated, async function(req: Request, res: Response, _: NextFunction) {
	const fileName = req.body.fileName;
	const fileContent = req.body.fileContent;
	if (!fileContent || !fileName || fileContent.length === 0 || fileName.trim().length === 0) {
		res.status(400).json({ message: 'Invalid body' });
		return;
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
	const file = await getFile(fileId);
	res.status(200).send(file);
});

/**
 * Deletes a file from the server.
 * @returns 200 if the file is successfully deleted
 */
router.delete('/remove', isAuthenticated, checkFileExistance, async function(req: Request, res: Response, _: NextFunction) {
	const fileId = parseInt(req.query.fileId as string);

	// Check if the deleting user has sent the message with the file
	// TODO: Implement this

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
		res.status(404).json({ message: 'File not found' });
		return;
	} else if (fileExists === FileStatus.Deleted) {
		// Return 410 Gone if the file has already been deleted
		res.status(410).json({ message: 'File was deleted' });
		return;
	}

	next();
}

export default router;