require('dotenv').config();
var host = process.env.HOST;
var port = process.env.PORT;
var dbuser = process.env.DBUSER;
var password = process.env.PASSWORD;
var database = process.env.DATABASE;
const mariadb = require('mysql'); //import mariadb
const conn = mariadb.createConnection({
    //allow us to import this file with database connection
    host: host,
    port: port,
    user: dbuser,
    password: password,
    database: database,
  });

  module.exports = { conn };