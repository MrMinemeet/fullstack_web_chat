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