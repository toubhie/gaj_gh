var crypto = require('crypto');
var db = require('./../db/database');
var dateTime = require('node-datetime');
var config = require('./config');
var logger = require('./log4js');
var moment = require('moment');
var fs = require('fs');
var User = require('../models/user');
var https = require('https');
var http = require('http');
var path = require('path');
var querystring = require('querystring');
var appRoot = require('app-root-path');

var AzureHelper = require('./azure_helpers');

var helpers = {
    generateActivationToken: function() {
        try {
            return crypto.randomBytes(64).toString('hex');
        } catch (error) {
            logger.log(error);
        }
    },

    generateInviteToken: function() {
        try {
            return crypto.randomBytes(10).toString('hex');
        } catch (error) {
            logger.log(error);
        }
    },

    generatePasswordResetToken: function() {
        try {
            return crypto.randomBytes(10).toString('hex');
        } catch (error) {
            logger.log(error);
        }
    },

    generateToken10: function() {
        try {
            return crypto.randomBytes(10).toString('hex');
        } catch (error) {
            logger.log(error);
        }
    },

    stringifyArray: function(array) {
        try {
            return JSON.stringify(array);
        } catch (error) {
            logger.log(error);
        }
    },

    parseJSONToArray: function(json) {
        try {
            return JSON.parse(json);
        } catch (error) {
            logger.log(error);
        }
    },

    getUsersActivityTrail: function(user_id) {
        try {
            var sql = `SELECT * FROM activity_trail WHERE user_id = ${user_id}`;

            db.query(sql, (err, data) => {
                if (err) {
                    logger.log(err);
                } else {
                    logger.log(data)
                }
            });
        } catch (error) {
            logger.log(error);
        }
    },

    saveActivityTrail: function(user_id, title, description) {
        try {
            var date_created = this.getCurrentTimeStamp();

            var sql = `INSERT INTO activity_trail(title, description, user_id, date_created) VALUES \
                        ('${title}', '${description}', ${user_id}, '${date_created}')`;

            db.query(sql, (err, data) => {
                if (err) {
                    logger.log(err);
                } else {
                    logger.log("Activity_trail saved.")
                }
            })
        } catch (error) {
            logger.log(error);
        }
    },

    checkifUndefined: function(value) {
        try {
            if (typeof value === 'undefined') {
                return null;
            } else {
                return value;
            }
        } catch (error) {
            logger.log(error);
        }
    },

    getCurrentTimeStamp: function() {
        try {
            var dt = dateTime.create();
            var date_created = dt.format('Y-m-d H:M:S');

            return date_created;
        } catch (error) {
            logger.log(error);
        }
    },

    convertDateTimeToMilliseconds: function(dateTime) {
        try {
            var date = new Date(dateTime);

            return date.getTime();
        } catch (error) {
            logger.log(error);
        }
    },

    showNotifyAlert: function() {

    },

    getCurrentTimeAgo: function(dateTime) {
        try {
            return moment(dateTime).fromNow();
        } catch (error) {
            logger.log(error);
        }
    },

    formatDateTime: function(dateTime) {
        try {
            return moment(dateTime).format('ll');
        } catch (error) {
            logger.log(error);
        }
    },

    formatDateToDatetime: function(date) {
        try {
            return moment(date).format('YYYY-MM-DD HH:mm:ss');
        } catch (error) {
            logger.log(error);
        }
    },

    checkIfDirectoryExist: function(dir) {
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
        } catch (error) {
            logger.log(error);
        }
    },

    calculateProfilePercentage: function(user_id, userData, resumeInfo, resumeEducation, resumeWorkExperience,
        resumeCertification, resumeSkill) {

        try {
            var profile_score = 0;
            var user = new User();

            db.query(user.getAllSettingForProfilePercentage(), (err, data) => {
                if (err) { logger.log(err) } else {
                    var allParams = {};
                    var total_param_score = 0;

                    //Organize data
                    for (var i = 0; i < data.length; i++) {
                        allParams[data[i].setting_name] = parseInt(data[i].value);
                        total_param_score += parseInt(data[i].value);
                    }

                    //Checks
                    if (typeof userData && resumeInfo && resumeEducation && resumeWorkExperience &&
                        resumeCertification == 'undefined') {

                        profile_score = 0;
                    } else {
                        if (typeof userData.first_name != 'undefined' && userData.first_name && userData.first_name != '') {
                            profile_score += allParams.pp_first_name;
                        }

                        if (typeof userData.last_name != 'undefined' && userData.last_name && userData.last_name != '') {
                            profile_score += allParams.pp_last_name;
                        }

                        if (typeof userData.email != 'undefined' && userData.email && userData.email != '') {
                            profile_score += allParams.pp_email;
                        }

                        if (typeof userData.phone_number != 'undefined' && userData.phone_number && userData.phone_number != '') {
                            profile_score += allParams.pp_phone_number;
                        }

                        if (typeof userData.profile_picture != 'undefined' && userData.profile_picture && userData.profile_picture != '') {
                            profile_score += allParams.pp_profile_picture;
                        }

                        if (typeof resumeInfo.resume_file_url != 'undefined' && resumeInfo.resume_file_url && resumeInfo.resume_file_url != '') {
                            profile_score += allParams.pp_cv_upload;
                        }

                        if (typeof resumeInfo.profile_summary != 'undefined' && resumeInfo.profile_summary && resumeInfo.profile_summary != '') {
                            profile_score += allParams.pp_summary;
                        }

                        if (typeof resumeEducation != 'undefined' && resumeEducation && resumeEducation.length > 0) {
                            profile_score += allParams.pp_education;
                        }

                        if (typeof resumeWorkExperience != 'undefined' && resumeWorkExperience && resumeWorkExperience.length > 0) {
                            profile_score += allParams.pp_work_experience;
                        }

                        if (typeof resumeCertification != 'undefined' && resumeCertification && resumeCertification.length > 0) {
                            profile_score += allParams.pp_certificates;
                        }

                        if (typeof resumeSkill != 'undefined' && resumeSkill && resumeSkill.length > 0) {
                            profile_score += allParams.pp_skills;
                        }

                        if (typeof userData.address != 'undefined' && userData.address && userData.address != '') {
                            profile_score += allParams.pp_address;
                        }

                        if (typeof userData.state != 'undefined' && userData.state && userData.state != '') {
                            profile_score += allParams.pp_state;
                        }

                        if (typeof userData.country != 'undefined' && userData.country && userData.country != '') {
                            profile_score += allParams.pp_country;
                        }

                        if (typeof userData.gender != 'undefined' && userData.gender && userData.gender != '') {
                            profile_score += allParams.pp_gender;
                        }

                        if (typeof userData.tagline != 'undefined' && userData.tagline && userData.tagline != '') {
                            profile_score += allParams.pp_tagline;
                        }
                    }

                    logger.log('profile_score - ' + profile_score)
                    logger.log('total_param_score - ' + total_param_score)

                    var profile_percentage = Math.round((profile_score / total_param_score) * 100);
                    logger.log('profile_percentage - ' + profile_percentage);

                    db.query(user.saveProfilePercentage(user_id, profile_percentage), (err, data) => {
                        if (err) { logger.log(err) } else {
                            logger.log('profile_percentage saved')
                        }
                    });
                }
            });
        } catch (error) {
            logger.log(error);
        }
    },

    sortRecommendedJobsArray: function(unsortedArray) {
        try {
            var sortedArray = unsortedArray.concat();

            for (var i = 0; i < sortedArray.length; ++i) {
                for (var j = i + 1; j < sortedArray.length; ++j) {
                    if (sortedArray[i].job_id === sortedArray[j].job_id) {
                        sortedArray.splice(j--, 1);
                    }
                }
            }

            return sortedArray;
        } catch (error) {
            logger.log(error);
        }
    },

    sortUsersArray: function(unsortedArray) {
        try {
            var sortedArray = unsortedArray.concat();

            for (var i = 0; i < sortedArray.length; ++i) {
                for (var j = i + 1; j < sortedArray.length; ++j) {
                    if (sortedArray[i].user_id === sortedArray[j].user_id) {
                        sortedArray.splice(j--, 1);
                    }
                }
            }

            return sortedArray;
        } catch (error) {
            logger.log(error);
        }
    },

    runPostRequestToLogin: function(hostlink, path, email, password) {
        try {
            logger.log('hostlink - ' + hostlink);

            var params = {
                username: email,
                password: password
            }

            var post_data = querystring.stringify(params);

            var options = {
                url: hostlink,
                path: path,
                port: config.port,
                method: 'POST'
            }

            var request = http.request(options, (response) => {

            });

            request.write(post_data);
            request.end();
        } catch (error) {
            logger.log(error);
        }
    },

    checkifAuthenticated: function(req, res) {
        try {
            if (typeof req.session.passport == 'undefined') {
                logger.log("user is not authenticated..back to login");

                var go_to_login_file = `${appRoot}/views/go_to_login.html`;

                res.sendFile(go_to_login_file);
                //res.redirect('/login?');

                return false;
            } else {
                logger.log("user is already authenticated..proceed");

                return true;
            }
        } catch (error) {
            logger.log(error);
        }
    },

    unescapeHTML: function(escapedHTML) {
        try {
            return escapedHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, "&").replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&rsquo;/g, "'").replace(/(?:\r\n|\r|\n)/g, '');
        } catch (error) {
            logger.log(error);
        }
    },

    escapeString: function(val) {
        try {
            val = val.replace(/[\0\n\r\b\t\\'"\x1a]/g, function(s) {
                switch (s) {
                    case "\0":
                        return "\\0";
                    case "\n":
                        return "\\n";
                    case "\r":
                        return "\\r";
                    case "\b":
                        return "\\b";
                    case "\t":
                        return "\\t";
                    case "\x1a":
                        return "\\Z";
                    case "'":
                        return "''";
                    case '"':
                        return '""';
                    default:
                        return "\\" + s;
                }
            });

            return val;
        } catch (error) {
            logger.log(error);
        }
    },

    downloadFile: function(res, fileName) {
        try {
            logger.log("Downloading File");
            //var file = path.join(__dirname, '../assets' , fileName);
            var file = `${appRoot}/assets/uploads/docs/resumes/${fileName}`;

            res.download(file);
        } catch (error) {
            logger.log(error);
        }
    },

    downloadResumeFromAzure: function(res, fileName) {
        try {
            logger.log("Downloading File from Azure");

            var azureHelper = new AzureHelper();
            azureHelper.downloadFilesFromAzure(fileName);

            // res.download(file);
        } catch (error) {
            logger.log(error);
        }
    },

    downloadFile2: function(url, dest) {
        try {
            var file = fs.createWriteStream(dest);
            var request = https.get(url, function(response) {
                response.pipe(file);
                file.on('finish', function() {
                    file.close(); // close() is async, call cb after close compvares.
                });
            }).on('error', function(err) { // Handle errors
                fs.unlink(dest); // Devare the file async. (But we don't check the result)
                console.log(err)
                    //if (cb) cb(err.message);
            });
        } catch (error) {
            logger.log(error);
        }
    },

    copyFile: function(file, dir2) {
        try {
            //gets file name and adds it to dir2
            var f = path.basename(file);
            var source = fs.createReadStream(file);
            var dest = fs.createWriteStream(path.resolve(dir2, f));

            source.pipe(dest);
            source.on('end', function() { logger.log('Succesfully copied'); });
            source.on('error', function(err) { logger.log(err); });
        } catch (error) {
            logger.log(error);
        }
    },

    checkApplicationDeadline: function(date) {
        try {
            var current_date = moment();
            var converted_date = moment(date);

            return converted_date < current_date ? 'Closed' : this.formatDateTime(date);
        } catch (error) {
            logger.log(error);
        }
    }
}

module.exports = helpers;