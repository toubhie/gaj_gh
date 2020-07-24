import appRoot from 'app-root-path';
import winston from 'winston';

let options = {
    file: {
        level: 'info',
        filename: `${appRoot}/logs/app_logs.log`,
        handleExceptions: true,
        json: true,
        maxsize: 10485760, //10MB
        maxFiles: 5,
        colorize: false
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true
    }
};

let logger = new winston.Logger({
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false
});

logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};

module.exports = logger;