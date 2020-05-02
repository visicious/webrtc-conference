// const db = require('../config/db');
// console.log(db);
const mysql = require('mysql');

const db = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME
});

const getAll = () => {
	return new Promise((resolve, reject) => {
		db.query('SELECT * FROM usuarios', (err, rows) => {
			if (err) {
				reject(err);
			}
			resolve(rows);
		});
	});
};

const insert = (newRow) => {
	return new Promise((resolve, reject) => {
		db.query('INSERT INTO usuarios (nombre, pass, usuario, email)',[newRow.nombre, newRow.pass, newRow.usuario, newRow.email], (err, result) => {
			if (err) {
				reject(err);
			}
			if (result) {
				resolve(result);
			}
		});
	});
};

const getByEmail = (userEmail) => {
	return new Promise((resolve, reject) => {
		db.query('SELECT * FROM usuarios WHERE email = ?', [userEmail], (err, rows) => {
			if (err) {
				reject(err);
			}
			resolve(rows[0]);
		});
	});
};

module.exports = {
	getAll: getAll,
	insert: insert,
	getByEmail: getByEmail
};