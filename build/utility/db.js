"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root1234",
    database: "ExtPOCDB"
});
pool.getConnection(function (err, con) {
    if (!!err) {
        con.release();
        console.log(err);
    }
});
exports.default = pool;
