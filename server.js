import http from 'http';
import app from './app';
import config from './config/config';
import logger from './config/log4js';

const port = process.env.PORT || config.port;

//Create server with exported express app
const server = http.createServer(app);
server.listen(port);

logger.log("Listening on Port: " + port);
