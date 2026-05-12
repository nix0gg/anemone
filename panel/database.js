const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const db = new Database('panel.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT null,
    password TEXT NOT null,
    role TEXT DEFAULT 'user')
    `);

const existingAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');

if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('admin', 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)')
      .run('admin', hashedPassword, 'admin');
    console.log('Default admin account created.');
}

db.exec(`
    CREATE TABLE IF NOT EXISTS active_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    session_id TEXT NOT NULL)
    `);

module.exports = db;