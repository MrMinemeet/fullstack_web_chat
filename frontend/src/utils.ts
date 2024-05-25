export const UNKNOWN_USERNAME: string = '!unknown!';

export function getUsername(): string {
	const token = document.cookie.split(";").find((c) => c.startsWith("token="))?.split("=")[1];
	if(!token)
		return UNKNOWN_USERNAME;
	try {
		return JSON.parse(atob(token.split('.')[1])).username;
	} catch (e) {
		return UNKNOWN_USERNAME;
	}
}