import sendgridMail from '@sendgrid/mail';
import config from './../config';
import logger from './../log4js';

exports.sendMail = function(mailOptions){
    sendgridMail.setApiKey(config.sendgrid_password);

    sendgridMail.send(mailOptions, (error, info) => {
        if (error) {
          logger.log("Mail not sent: -" + error);
        } else {
          logger.log("Mail sent");
        }
    });
}
