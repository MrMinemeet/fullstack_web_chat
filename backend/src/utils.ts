import { Database } from 'sqlite3';
let dbConn = new Database('local.db', );
dbConn.serialize(() => {
	createTable(dbConn);
});

function createTable(db: Database) {
	db.run(`CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, email TEXT,passwordHash TEXT, salt TEXT)`);
}

export async function doesUserExist(username: string): Promise<boolean> {
	let sql = `SELECT * FROM users WHERE username = ?`;
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


export function ValidateEmail(mail:string): boolean {
}

export { dbConn }