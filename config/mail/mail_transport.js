var nodeMailer = require('nodemailer');
var logger = require('../log4js');

exports.sendMail = function(mailOptions) {
    try {
        logger.log('in mailer ' + mailOptions)
        let transporter = nodeMailer.createTransport({
            host: 'smtp.office365.com',
            //port: 465,
            port: 587,
            secure: false, //true for 465 port, false for other ports
            auth: {
                user: 'info@getajobgh.com',
                pass: 'Password@2019'
            }
        });

        /*let mailOptions = {
          from: '"Jobs from GetaJobGH" <info@getajobgh.com>', // sender address
          to: 'tobiwily@yahoo.com, tobiloba.williams@c-ileasing.com', // list of receivers
          subject: 'Welcome to GetaJobGH ', // Subject line
          text: 'Hello world?', // plain text body
          html: '<b>Hello world?</b>' // html body
        }; */

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                logger.log('mail not sent - ' + error);
            } else {
                logger.log('mail sent');
            }
        });
    } catch (error) {
        logger.log(error);
    }
}