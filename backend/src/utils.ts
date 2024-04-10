import { Database } from 'sqlite3';
let dbConn = new Database('local.db', );
dbConn.serialize(() => {
	createTable(dbConn);
});

function createTable(db: Database) {
	db.run(`CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, email TEXT,passwordHash TEXT, salt TEXT)`);
}

export function doesUserExist(username: string): boolean {
	let sql = `SELECT * FROM users WHERE username = ?`;
	let exists = false;
	dbConn.get(sql, [username], (err: Error, row: any) => {
		if (err) {
			console.error(err);
			return;
		}
		if (row) {
			exists = true;
		}
	});
	return exists;
}


export function ValidateEmail(mail:string): boolean {
	return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail));
}

export { dbConn }