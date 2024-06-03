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
			resolve(response.data.fileId);
		}
	});
}