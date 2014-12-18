const path = require('path');
const sqlite3 = require('sqlite3').verbose();

module.exports = new sqlite3.Database(path.join(__dirname,'..', 'oauth.db'));
