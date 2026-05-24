require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
pool.query('SELECT * FROM users WHERE id = $1', [1]).then(res => { console.log(res.rows); pool.end(); }).catch(err => { console.error(err); pool.end(); });
