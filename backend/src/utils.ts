import { Database } from 'sqlite3';
let dbConn = new Database('local.db', );
dbConn.serialize(() => {
	createTable(dbConn);
});

function createTable(db: Database) {
	db.run(`CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, email TEXT,passwordHash TEXT)`);
}


export async function doesUserExist(username: string): Promise<boolean> {
	let sql = `SELECT passwordHash FROM users WHERE username = ?`;
	dbConn.get(sql, [username], (err: Error, row: any) => {
		if (err) {
			return false;
		}
		if (row) {
			return true;
		}
	});
	return false;
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

export { dbConn }