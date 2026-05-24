require('dotenv').config({path: '.env.local'});
const { sql } = require('./lib/db/index.js');
sql('SELECT * FROM users WHERE id = $1', [9]).then(res => { console.log(res); process.exit(0); });
