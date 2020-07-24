import ResumeParser from 'resume-parser';
import logger from './../config/log4js';
import appRoot from 'app-root-path';

let cv_parser = {

    parseCV : function(cv_path){
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