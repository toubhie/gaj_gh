var storage = require('./../session_store');
var config = require('./../config');
var logger = require('./../log4js');
var mailTransport = require('./mail_transport');
var sendgridMailTransport = require('./sendgrid_transport');
var helpers = require('./../helpers');
var db = require('./../../db/database');
var User = require('./../../models/user');

var mailFunctions = {

    sendWelcomeMail: function(req, user_id, fullName, recipient_email) {
        try {
            var token = helpers.generateActivationToken();

            var user = new User();
            db.query(user.saveUserActivationToken(user_id, token), (err, data) => {
                if (!err) {
                    logger.log("User Token saved!");
                }
            });

            //var pre_link = 'https://' + req.get('host');
            var link = 'https://www.getajobgh.com/auth/verify/' + user_id + '/' + token;
            //var fullLink = pre_link + link;

            var mailOptions = {
                from: config.from, // sender address
                to: recipient_email, // list of receivers
                subject: 'Welcome to GetaJobGH',
                text: 'Welcome',
                html: '<p>Hi <b>' + fullName + '</b>. Welcome to <b>GetaJobGH</b>.</p> \
                <p>Please click on the link below to activate your account:</p> \
                <p><a href="' + link + '">Activate Account</a></p> \
                <p>Best Regards,</p> \
                <p>Mr. Jobs</p>'
            }

            //sendgridMailTransport.sendMail(mailOptions);
            mailTransport.sendMail(mailOptions);
        } catch (error) {
            logger.log(error);
        }
    },

    sendApplyToJobMail: function() {
        try {
            var mailOptions = {
                from: config.from, // sender address
                to: 'bereiwerisoc@yahoo.com, nathanielasogwa@yahoo.com, ibukunomisope2017@gmail.com, tobiloba.williams@c-ileasing.com', // list of receivers
                subject: 'We have a Job for you',
                text: 'Welcome',
                html: '<p>Hi! Good morning.</p> \
                <p>My name is Mr. Jobs and I have some awesome Slickline jobs for you.</p> \
                <p>Please click on the links below to apply.</p> \
                <ol> \
                <li><b>Slickline Operator:</b> <a href="https://getajobgh.com/job-detail/3453" target="_blank">Click here to Apply</a></li> \
                <li><b>Slickline Chief Operator:</b> <a href="https://getajobgh.com/job-detail/3453" target="_blank">Click here to Apply</a></li> \
                </ol>\
                <p>Please, don\'t forget to register, fill your profile and upload your CV/Resume.</p> \
                <p>You can also refer a friend.</p> \
                <p>Best Regards,</p> \
                <p>Mr. Jobs</p>'
            }

            //sendgridMailTransport.sendMail(mailOptions);
            mailTransport.sendMail(mailOptions);
        } catch (error) {
            logger.log(error);
        }
    },

    sendJobApplicationMail: function(recipient_full_name, recipient_email, job_name) {
        try {
            var mailOptions = {
                from: config.from, // sender address
                to: recipient_email, // list of receivers
                subject: 'Thank you for your recent job application',
                text: 'Welcome',
                html: '<p>Dear ' + recipient_full_name + ',</p>\
                        <p>Thank you for your recent application to the following job vacancy:</p> \
                        <p><b>' + job_name + '</b></p> \
                        <p>Improve your chances of being hired. ' +
                    'Sign up for Job Alerts to receive the vacancies you are looking for straight to your inbox. ' +
                    'Keep your profile and CV updated so recruiters can find you when they have an opportunity for you! ' +
                    'Good luck with the search.</p> \
                        <p>Best Regards,</p> \
                        <p>Mr. Jobs</p>'
            }

            mailTransport.sendMail(mailOptions);
        } catch (error) {
            logger.log(error);
        }
    },

    sendTeamInviteMail: function(req, recipient_email, sender_full_name, company_name, role_name) {
        try {
            //Generate Invite Token
            var token = helpers.generateInviteToken();

            //Save Invite token to user record
            var user = new User();
            db.query(user.saveInviteToken(recipient_email, token), (err, data) => {
                //Nothing done here
                if (!err) {
                    logger.log("User Token saved!");
                }
            });

            //var pre_link = 'https://' + req.get('host');
            var link = 'https://www.getajobgh.com/invites/' + token;
            //var fullLink = pre_link + link;

            var mailOptions = {
                from: config.from, // sender address
                to: recipient_email, // list of receivers
                subject: 'Invitation to join your company team on GetaJobGH',
                text: 'Welcome',
                html: '<p>Hello,</p>\
                        <p>You have been invited by ' + sender_full_name + ' to join the ' + company_name + ' team \
                        as a ' + role_name + '.<br> \
                        Please click on the link below to accept:<br> \
                        <a href="' + link + '">Accept Invitation</a></p> \
                        <p>Best Regards,</p> \
                        <p>Mr. Jobs</p>'

            }

            //sendgridMailTransport.sendMail(mailOptions);
            mailTransport.sendMail(mailOptions);
        } catch (error) {
            logger.log(error);
        }
    },

    sendJobPostedMail: function(req, recipient_email, recipient_full_name, job_id, job_title) {
        try {
            //var pre_link = 'https://' + req.get('host');
            var link = 'https://www.getajobgh.com/recruiters/job-detail/' + job_id;
            //var fullLink = pre_link + link;

            var mailOptions = {
                from: config.from, // sender address
                to: recipient_email, // list of receivers
                subject: 'Job Posted',
                text: 'Job Posted',
                html: '<p>Dear ' + recipient_full_name + ',</p>\
                        <p>Your job post titled <b>"' + job_title + '"</b> has been posted successfully.<br> \
                        Please click on the link below to view<br> \
                        <a href="' + link + '">View Job Post</a></p> \
                        <p>Best Regards,</p> \
                        <p>Mr. Jobs</p>'

            }

            //sendgridMailTransport.sendMail(mailOptions);
            mailTransport.sendMail(mailOptions);
        } catch (error) {
            logger.log(error);
        }
    },

    sendCreateInterviewMail: function(req, recipient_full_name, recipient_email, interview_id,
        interview_name, interview_date, interview_time) {

        try {
            //var pre_link = 'https://' + req.get('host');
            var link = 'https://www.getajobgh.com/interviews/interview-detail/' + interview_id;
            //var fullLink = pre_link + link;

            var mailOptions = {
                from: config.from, // sender address
                to: recipient_email, // list of receivers
                subject: 'Interview Created',
                text: 'Interview Created',
                html: '<p>Dear ' + recipient_full_name + ',</p>\
                        <p>You recently created an interview. Here are the details:</p> \
                        <br> \
                        <b>Name of Interview:</b> ' + interview_name + '<br> \
                        <b>Date:</b> ' + interview_date + '<br> \
                        <b>Time:</b> ' + interview_time + '<br> \
                        Please click on the link below to view more details <br> \
                        <a href="' + link + '">View Interview</a></p> \
                        <p>Best Regards,</p> \
                        <p>Mr. Jobs</p>'

            }

            //sendgridMailTransport.sendMail(mailOptions);
            mailTransport.sendMail(mailOptions);
        } catch (error) {
            logger.log(error);
        }
    },

    sendForgotPasswordEmail: function(req, user_id, fullName, recipient_email) {
        try {
            var password_reset_token = helpers.generatePasswordResetToken();

            //Save Password reset token to user record
            var user = new User();
            db.query(user.savePasswordResetToken(user_id, password_reset_token), (err, data) => {
                //Nothing done here
                if (!err) {
                    logger.log("User Password Reset Token saved!");
                }
            });

            //var pre_link = 'https://' + req.get('host');
            var link = 'https://www.getajobgh.com/auth/verify-password-token/' + password_reset_token;
            // var fullLink = pre_link + link;

            var mailOptions = {
                from: config.from, // sender address
                to: recipient_email, // list of receivers
                subject: 'Instructions for changing your GetaJobGH password',
                text: 'Welcome',
                html: '<p>Hello <b>' + fullName + ',</b></p> \
                    <p>You recently requested to reset your password.</p> \
                    <p>To reset your password, please follow the link below:</p></br> \
                    <p><a href="' + link + '">Reset Password</a></p></br> \
                    <p>If you are not sure why you are receiving this message, you can report it to us by emailing info@getajobgh.com.</p>\
                    <p>If you suspect someone may have unauthorised access to your account, we suggest you change your password as a precaution by visiting your Dashboard -> Settings -> Change Password.</p>\
                    <p>Best Regards,</p> \
                    <p>Mr. Jobs</p>'

            }

            //sendgridMailTransport.sendMail(mailOptions);
            mailTransport.sendMail(mailOptions);
        } catch (error) {
            logger.log(error);
        }
    },

    sendWeeklyJobUpdatesMail: function(jobs, candidate) {
        try {
            var jobs_list_content = '';

            for (var i = 0; i < jobs.length; i++) {
                //var pre_link = req.protocol + '://' + req.get('host');
                var fullLink = 'https://www.getajobgh.com/job-detail/' + jobs[i].job_id;
                //var fullLink = pre_link + link;

                jobs_list_content += '<tr> \
                                        <td> \
                                            <div class="site_row"> \
                                                <p style=""> \
                                                    <a style="text-decoration:none;color:#06942A;font-weight:bold;font-size:14px" href="' + fullLink + '">' +
                    jobs[i].job_name +
                    '</a>\
                                                </p>\
                                                <p><i>' + jobs[i].company_name + ', ' + jobs[i].state_name + '</i></p>\
                                            </div>\
                                            <div class="candidates_for_open_job">\
                                                <a style="text-decoration:none;color:#06942A;font-weight:bold;font-size:12px" href="' + fullLink + '"> \
                                                    View more \
                                                </a> \
                                            </div> \
                                            <hr>\
                                        </td>\
                                    </tr>';
            }

            var mailOptions = {
                from: config.from, // sender address
                to: candidate.email,
                subject: 'We have jobs for you',
                text: 'Recommended Jobs',
                html: '<p>Dear ' + candidate.full_name + ',</p>\
                        <br> \
                        <p>We\'ve found some awesome jobs for you. Check them out!</p> \
                        <p><b>Job Listings:</b></p> \
                        <table id="jobs_table"> \
                            <thead> \
                                <tr> \
                                    <th width="100%"></th> \
                                </tr> \
                            </thead> \
                            <tbody id="jobs_data">' +
                    jobs_list_content +
                    '</tbody>\
                        </table><br> \
                        <p><a style="text-decoration:none;color:#06942A;font-weight:bold;font-size:14px" \
                            href="www.getajobgh.com/find-a-job" target="_blank">Click to view more Jobs</a></p> \
                        <p>Best Regards,</p> \
                        <p>Mr. Jobs</p>'

            }

            logger.log('@@@@@ Sending WeeklyJob Updates Mail for candidate - ' + candidate.user_id + ' @@@@@');
            mailTransport.sendMail(mailOptions);
        } catch (error) {
            logger.log(error);
        }
    }
}

module.exports = mailFunctions;