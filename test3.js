require('dotenv').config({path: '.env.local'});
const { sql } = require('./lib/db/index.js');
const userId = 1;
sql('SELECT * FROM users WHERE id = $1', [userId]).then(res => { console.log("User 1:", res); process.exit(0); });
