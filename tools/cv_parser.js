var ResumeParser = require('resume-parser');
var logger = require('./../config/log4js');
var appRoot = require('app-root-path');

var cv_parser = {

    parseCV: function(cv_path) {
        ResumeParser
            .parseResumeUrl('127.0.0.1:8080/' + cv_path)
            .then(data => {
                logger.log(data)
            })
            .catch(error => {
                logger.error(error);
            })
    }
}

module.exports = cv_parser;