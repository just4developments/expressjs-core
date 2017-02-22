const db = require('../src/db');

console.log('This is development mode');
app.all('/*', (req, res, next) => {
    console.log('-', `Mongo: ${db.size()}`);
    next();
});