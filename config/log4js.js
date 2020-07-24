import log4js from 'log4js';
import appRoot from 'app-root-path';

    //Logger Config
    log4js.configure({
        appenders: {
            fileAppender : {
                type: 'file',
                filename: `${appRoot}/logs/app_logs.log`,
                maxLogSize: 10485760,
                backups: 3,
                compress: true
            },
            console: {
                type: 'console'
            } 
        },
        categories: {
            default: {
                appenders : ['fileAppender', 'console'],
                level: ['all']
            }
        }
    }); 
    
    let logger = {
        log : function(message){
            let logger = log4js.getLogger();
            logger.level = 'trace';

            return logger.info(message);
        },

        error : function(message){
            let logger = log4js.getLogger();
            logger.level = 'error';

            return logger.error(message);
        }
    }

module.exports = logger;