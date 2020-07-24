import mysql from 'mysql';
import config from '../config/config';
import logger from './../config/log4js';

const pool = mysql.createPool({
            connectionLimit : 100,
            connectTimeout  : 60 * 1000,
            acquireTimeout  : 60 * 1000,
            timeout         : 60 * 1000,
            host     : config.local_db_host,
            user     : config.local_db_username,
            password : config.local_db_password,
            database : config.local_database,
            debug    : false 
            });                    

function executeQuery(sql, callback) {
    pool.getConnection((err, connection) => {
        if(err) {
            return callback(err, null);
        } else {
            if(connection) {
                connection.query(sql, function (error, results, fields) {
                connection.release();
                if (error) {
                    return callback(error, null);
                } 
                return callback(null, results);
                });
            }
        }
    });
}

function query(sql, callback) {    
    executeQuery(sql, function(err, data) {
        logger.log("SQL: " + sql);
        
        if(err) {
            logger.log("ERROR: " + err);
            return callback(err);
        }   
    
        callback(null, data);
    });
}

module.exports = {
    query: query
}