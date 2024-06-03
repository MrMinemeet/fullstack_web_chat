import axios from 'axios'; 

export const UNKNOWN_USERNAME: string = '!unknown!';

export function getToken(): string | undefined {
	return document.cookie.split(";").find((c) => c.startsWith("token="))?.split("=")[1];
}

export function getUsername(): string {
	const token = getToken();
	if(!token)
		return UNKNOWN_USERNAME;
	try {
		return JSON.parse(atob(token.split('.')[1])).username;
	} catch (e) {
		return UNKNOWN_USERNAME;
	}
}

/**
 * Uploads a file to the server
 * @param file The file to upload
 * @returns The ID of the uploaded file
 * @throws If the file could not be uploaded
 */
export async function uploadFile(file: File): Promise<number> {
	return new Promise(async (resolve, reject) => {
		const fileBuffer = await file.arrayBuffer();
		const response = await axios.put(`http://localhost:3000/file/upload`, fileBuffer, {
			params: {
				name: encodeURIComponent(file.name)
			},
			headers: {
				'Authorization': `Bearer ${getToken()}`,
				'Content-Type': 'application/octet-stream'
			}
		})

		if (response.status !== 201)
			reject(`Failed to upload file: ${response.status} ${response.statusText}`);
		else {
			console.log(`File uploaded with: ${response.data.fileId}`);
			// TODO: For testing. Downlaod file when clicked on the message it was attached to
			await downloadFile(response.data.fileId);
			resolve(response.data.fileId);
		}
	});
}

/**
 * Downloads a file from the server. The file is stored by the browser.
 * @param fileId The ID of the file to download
 * @returns Nothing
 */
export async function downloadFile(fileId: number): Promise<void> {
	return new Promise(async (resolve, reject) => {
		const response = await axios.get(`http://localhost:3000/file/download/`, {
			params: {
				fileId: fileId
			},
			responseType: 'blob',
			headers: {
				'Authorization': `Bearer ${getToken()}`,
			}
		});

		if (response.status !== 200)
			return reject(`Failed to download file: ${response.status} ${response.statusText}`);
		
		// Store blob to file
		const url = window.URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement('a');
		link.href = url;

		// Set the filename
		const filename = response.headers['content-disposition'].split('filename=')[1];
		link.setAttribute('download', filename);
		document.body.appendChild(link);

		// Trigger download
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
		resolve();
	});
}