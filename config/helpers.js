import crypto from 'crypto';
import db from './../db/database';
import dateTime from 'node-datetime';
import config from './config';
import logger from './log4js';
import sessionStore from '../config/session_store';
import moment from 'moment';
import fs from 'fs';
import User from '../models/user';
import https from 'https';
import http from 'http';
import path from 'path';
import querystring from 'querystring';
import appRoot from 'app-root-path';

let helpers = {
    generateActivationToken : function(){
        return crypto.randomBytes(64).toString('hex');
    },

    generateInviteToken : function(){
        return crypto.randomBytes(10).toString('hex');
    },

    generatePasswordResetToken : function(){
        return crypto.randomBytes(10).toString('hex');
    },

    generateToken10 : function(){
        return crypto.randomBytes(10).toString('hex');
    },

    stringifyArray : function(array){
        return JSON.stringify(array);
    },

    parseJSONToArray : function(json){
        return JSON.parse(json);
    },

    getUsersActivityTrail : function(user_id){
        let sql = `SELECT * FROM activity_trail WHERE user_id = ${user_id}`;

        db.query(sql, (err, data) => {
            if(err){
                logger.log(err);
            } else {
                logger.log(data)
            }
        })
    },

    saveActivityTrail : function(user_id, title, description){
        let date_created = this.getCurrentTimeStamp();

        let sql = `INSERT INTO activity_trail(title, description, user_id, date_created) VALUES \
                    ('${title}', '${description}', ${user_id}, '${date_created}')`;

        db.query(sql, (err, data) => {
            if(err){
                logger.log(err);
            } else {
                logger.log("Activity_trail saved.")
            }
        })
    },

    checkifUndefined : function(value){
        if(typeof value === 'undefined'){
            return null;     
        } else{
            return value;
        } 
    },

    getCurrentTimeStamp : function(){
        let dt = dateTime.create();
        let date_created = dt.format('Y-m-d H:M:S');  

        return date_created;
    },

    convertDateTimeToMilliseconds : function(dateTime){
        let date = new Date (dateTime);

        return date.getTime();
    },

    showNotifyAlert : function(){
        
    },

    getCurrentTimeAgo : function(dateTime){
        return moment(dateTime).fromNow();
    },

    formatDateTime : function(dateTime){
        return moment(dateTime).format('ll');
    },

    formatDateToDatetime : function(date){
        return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },

    checkIfDirectoryExist : function(dir){
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
    },

    calculateProfilePercentage : function(user_id, userData, resumeInfo, resumeEducation, resumeWorkExperience, 
        resumeCertification, resumeSkill){

        let profile_score = 0;
        let user = new User();
    
        db.query(user.getAllSettingForProfilePercentage(), (err, data) => {
            if(err){logger.log(err)}
            else{
                let allParams = {};
                let total_param_score = 0;
    
                //Organize data
                for(let i = 0; i < data.length; i++){
                    allParams[data[i].setting_name] = parseInt(data[i].value);
                    total_param_score += parseInt(data[i].value);
                }
                
                //Checks
                if(typeof userData && resumeInfo && resumeEducation && resumeWorkExperience &&
                    resumeCertification == 'undefined'){

                    profile_score = 0;
                } else{
                    if(typeof userData.first_name != 'undefined' && userData.first_name && userData.first_name != ''){
                        profile_score += allParams.pp_first_name;
                    }
    
                    if(typeof userData.last_name != 'undefined' && userData.last_name && userData.last_name != ''){
                        profile_score += allParams.pp_last_name;
                    }
    
                    if(typeof userData.email != 'undefined' && userData.email && userData.email != ''){
                        profile_score += allParams.pp_email;
                    }
    
                    if(typeof userData.phone_number != 'undefined' && userData.phone_number && userData.phone_number != ''){
                        profile_score += allParams.pp_phone_number;
                    }
     
                    if(typeof userData.profile_picture != 'undefined' && userData.profile_picture && userData.profile_picture != ''){
                        profile_score += allParams.pp_profile_picture;
                    }
        
                    if(typeof resumeInfo.resume_file_url != 'undefined'&& resumeInfo.resume_file_url && resumeInfo.resume_file_url != ''){
                        profile_score += allParams.pp_cv_upload;
                    }
    
                    if(typeof resumeInfo.profile_summary != 'undefined'&& resumeInfo.profile_summary && resumeInfo.profile_summary != ''){
                        profile_score += allParams.pp_summary;
                    }
    
                    if(typeof resumeEducation != 'undefined' && resumeEducation && resumeEducation.length > 0){
                        profile_score += allParams.pp_education;
                    }
    
                    if(typeof resumeWorkExperience != 'undefined' && resumeWorkExperience && resumeWorkExperience.length > 0){
                        profile_score += allParams.pp_work_experience;
                    }
    
                    if(typeof resumeCertification != 'undefined' && resumeCertification && resumeCertification.length > 0){
                        profile_score += allParams.pp_certificates;
                    }

                    if(typeof resumeSkill != 'undefined' && resumeSkill && resumeSkill.length > 0){
                        profile_score += allParams.pp_skills;
                    }
    
                    if(typeof userData.address != 'undefined' && userData.address && userData.address != ''){
                        profile_score += allParams.pp_address;
                    }
    
                    if(typeof userData.state != 'undefined' && userData.state && userData.state != ''){
                        profile_score += allParams.pp_state;
                    }
    
                    if(typeof userData.country != 'undefined' && userData.country && userData.country != ''){
                        profile_score += allParams.pp_country;
                    }
    
                    if(typeof userData.gender != 'undefined' && userData.gender && userData.gender != ''){
                        profile_score += allParams.pp_gender;
                    }
    
                    if(typeof userData.tagline != 'undefined' && userData.tagline  && userData.tagline != ''){
                        profile_score += allParams.pp_tagline;
                    }
                }
    
                logger.log('profile_score - ' + profile_score)
                logger.log('total_param_score - ' + total_param_score)
    
                let profile_percentage = Math.round((profile_score/total_param_score) * 100);
                logger.log('profile_percentage - ' + profile_percentage);
                
                db.query(user.saveProfilePercentage(user_id, profile_percentage), (err, data) => {
                    if(err){logger.log(err)}
                    else{
                        logger.log('profile_percentage saved')
                    }
                });
            }
        });
    },

    sortRecommendedJobsArray : function(unsortedArray){
        let sortedArray = unsortedArray.concat();

        for(let i = 0; i < sortedArray.length; ++i){
            for(let j = i + 1; j < sortedArray.length; ++j){
                if(sortedArray[i].job_id === sortedArray[j].job_id){
                    sortedArray.splice(j--, 1);
                }
            }
        }

        return sortedArray;
    },

    sortUsersArray : function(unsortedArray){
        let sortedArray = unsortedArray.concat();

        for(let i = 0; i < sortedArray.length; ++i){
            for(let j = i + 1; j < sortedArray.length; ++j){
                if(sortedArray[i].user_id === sortedArray[j].user_id){
                    sortedArray.splice(j--, 1);
                }
            }
        }

        return sortedArray;
    },

    runPostRequestToLogin : function(hostlink, path, email, password){
        logger.log('hostlink - ' +hostlink);

        let params = {
            username: email,
            password: password
        }

        let post_data = querystring.stringify(params);

        let options = {
            url: hostlink,
            path: path,
            port: config.port,
            method: 'POST'
        }

        let request = http.request(options, (response) => {

        });

        request.write(post_data);
        request.end();
    },  
    
    checkifAuthenticated : function(req, res){
        if (typeof req.session.passport == 'undefined') { 
            logger.log("user is not authenticated..back to login");

            let go_to_login_file = `${appRoot}/views/go_to_login.html`;

            res.sendFile(go_to_login_file); 
            //res.redirect('/login?');

            return false;
        } else{
            logger.log("user is already authenticated..proceed"); 

            return true;
        }
    },

    unescapeHTML : function(escapedHTML) {
        return escapedHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,"&").replace(/&amp;/g,'&').replace(/&#39;/g, "'").replace(/&rsquo;/g, "'").replace(/(?:\r\n|\r|\n)/g, '');
    },

    escapeString : function (val) {
        val = val.replace(/[\0\n\r\b\t\\'"\x1a]/g, function (s) {
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
    },

    downloadFile : function(res, fileName){
        logger.log("Downloading File");
        //let file = path.join(__dirname, '../assets' , fileName);
        let file = `${appRoot}/assets/uploads/docs/resumes/${fileName}`;

        res.download(file);
    },

    copyFile : function(file, dir2){
        //gets file name and adds it to dir2
        let f = path.basename(file);
        let source = fs.createReadStream(file);
        let dest = fs.createWriteStream(path.resolve(dir2, f));
      
        source.pipe(dest);
        source.on('end', function() { logger.log('Succesfully copied'); });
        source.on('error', function(err) { logger.log(err); });
    },

    checkApplicationDeadline : function(date){        
        var current_date = moment();
        var converted_date = moment(date);

        return converted_date < current_date ? 'Closed' : this.formatDateTime(date)
    }
}

module.exports = helpers;