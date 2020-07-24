import express from "express";
import db from "../db/database";
import User from "../models/user";
import uuidv1 from "uuid/v1";
import config from "../config/config";
import mailer from '../config/mail/mailer';
import helpers from '../config/helpers';
import logger from '../config/log4js';
import bcrypt from 'bcryptjs';
import formidable from 'formidable';
import path from 'path';

import session from "express-session";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import Resume from "../models/resume";
import Job from "../models/job";

const router = express.Router();

router.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: false }));

router.use(session({
    secret: config.session_secret,
    resave: config.session_resave,
    key: config.session_key,
    saveUninitialized: config.session_save_uninitialized,
    cookie: { maxAge: config.session_cookie_max_age }
}));

router.get('/dashboard', function (req, res){
    let userData = req.session.passport.user;

    res.render('candidate_dashboard', {
        view: 'dashboard',
        data: userData
    });
});

router.get('/profile', function (req, res){
    let userData = req.session.passport.user;
    logger.log(userData);

    let redirectFrom = req.query.q;
    let response = req.query.r;

    if(typeof redirectFrom != 'undefined' && redirectFrom){
        if(redirectFrom == 'summary'){
            res.render('candidate_profile', {
                view: 'profile',
                data: userData,
                showAlert: true,
                alertMessage: response == 's' ? 'Summary Successfully Updated' : 'An error occurred',
                alertType: response == 's' ? 'success' : 'error'
            });
        } 

        else if(redirectFrom == 'we_a'){
            res.render('candidate_profile', {
                view: 'profile',
                data: userData,
                showAlert: true,
                alertMessage: response == 's' ? 'Experience Saved' : 'Experience not added',
                alertType: response == 's' ? 'success' : 'error'
            });
        }

        else if(redirectFrom == 'we_e'){
            res.render('candidate_profile', {
                view: 'profile',
                data: userData,
                showAlert: true,
                alertMessage: response == 's' ? 'Experience Saved Successfully' : 'Experience edit failed',
                alertType: response == 's' ? 'success' : 'error'
            });
        }

        else if(redirectFrom == 'we_d'){
            res.render('candidate_profile', {
                view: 'profile',
                data: userData,
                showAlert: true,
                alertMessage: response == 's' ? 'Experience Deleted Successfully' : 'An error occurred',
                alertType: response == 's' ? 'success' : 'error'
            });
        }

        else if(redirectFrom == 'e_a'){
            res.render('candidate_profile', {
                view: 'profile',
                data: userData,
                showAlert: true,
                alertMessage: response == 's' ? 'Education Added' : 'Education not added',
                alertType: response == 's' ? 'success' : 'error'
            });
        }

        else if(redirectFrom == 'e_d'){
            res.render('candidate_profile', {
                view: 'profile',
                data: userData,
                showAlert: true,
                alertMessage: response == 's' ? 'Education Deleted' : 'An error occurred',
                alertType: response == 's' ? 'success' : 'error'
            });
        }

        else if(redirectFrom == 'e_e'){
            res.render('candidate_profile', {
                view: 'profile',
                data: userData,
                showAlert: true,
                alertMessage: response == 's' ? 'Education Saved Successfully' : 'Education edit failed',
                alertType: response == 's' ? 'success' : 'error'
            });
        }

        else if(redirectFrom == 'resume'){
            res.render('candidate_profile', {
                view: 'profile',
                data: userData,
                showAlert: true,
                alertMessage: response == 's' ? 'Resume Uploaded Successfully' : 'Resume upload failed',
                alertType: response == 's' ? 'success' : 'error'
            });
        }
         
    } else{
        res.render('candidate_profile', {
            view: 'profile',
            data: userData
        });
    }
});

router.get('/get-all-resume-info', function(req, res){
    let userData = req.session.passport.user;

    db.query(Resume.getResumeByUserIdQuery(userData.user_id), (err, data) => {
        if(err){logger.log(err)}
        else{
            let resume = data[0];
            let resume_id = data[0].resume_id;

            logger.log("resume - ")
            logger.log(resume);

            //Get all Candidate Educations
            db.query(Resume.getAllEducationByResumeIdQuery(resume_id), (err, data) => {
                if(err){logger.log(err)}
                else{
                    let education = data;
                    logger.log("education - ")
                    logger.log(education);
                    
                    //Get all Candidate WEs
                    db.query(Resume.getAllWorkExperienceByResumeIdQuery(resume_id), (err, data) => {
                        if(err){logger.log(err)}
                        else{
                            let work_experience = data;
                            logger.log("work_experience - ")
                            logger.log(work_experience);
                            
                            //Get all Candidate Certifications
                            db.query(Resume.getAllCertificationByResumeIdQuery(resume_id), (err, data) => {
                                if(err){logger.log(err)}
                                else{
                                    let certification = data;
                                    logger.log("certification - ")
                                    logger.log(certification); 
                        
                                    //Get all Candidate Specializations
                                    db.query(Resume.getAllSpecializationByResumeIdQuery(resume_id), (err, data) => {
                                        if(err){logger.log(err)}
                                        else{
                                            let specialization = data;
                                            logger.log("specialization - ")
                                            logger.log(specialization);       
                                            
                                            //Get all Candidate Skills
                                            db.query(Resume.getAllSkillByResumeIdQuery(resume_id), (err, data) => {
                                                if(err){logger.log(err)}
                                                else{
                                                    let skills = data;
                                                    logger.log("skills - ")
                                                    logger.log(skills);

                                                    helpers.calculateProfilePercentage(userData.user_id, userData, resume, education, work_experience, 
                                                        certification, skills);

                                                    res.status(200).json({
                                                        userData: userData,
                                                        resume: resume, 
                                                        education: education, 
                                                        work_experience: work_experience, 
                                                        certification: certification, 
                                                        specialization: specialization, 
                                                        skills: skills
                                                    });                                      
                                                }
                                            })
                                        }
                                    })
                                }
                            })

                        }
                    })     
                }
            })
        }
    })
});
 
router.get('/find-a-job', function (req, res){
    logger.log("find-a-job")
    let userData = req.session.passport.user;

    res.render('candidate_find_a_job', {
        view: 'find-a-job',
        data: userData
    });
});

router.get('/job-applications', function (req, res){
    logger.log("job-applications")
    let userData = req.session.passport.user;

    res.render('candidate_job_applications', {
        view: 'job-applications',
        data: userData
    });
});

router.get('/recommended-jobs', function (req, res){
    logger.log("recommended-jobs")

    let userData = req.session.passport.user;

    res.render('candidate_recommended_jobs', {
        view: 'recommended-jobs',
        data: userData
    });
});

router.get("/get-candidate-activity-history", (req, res, next) => {
    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    let user = new User();
    db.query(user.getUserActivityHistory(user_id), (err, data) => {
        if(err){logger.log(err)}
        else{
            for(let i = 0; i < data.length; i++){
                data[i].date_time_ago = helpers.getCurrentTimeAgo(data[i].date_created);
            }
            res.status(200).json({
                message:"Activity History found.",
                activityHistory: data
            });
        }
    });   
});

router.get("/get-candidate-statistics", (req, res, next) => {
    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    let user = new User();
    db.query(user.getCountOfCandidateApplications(user_id), (err, data) => {
        if(err){logger.log(err)}
        else{
            let candidateJobApplicationsCount = data[0].count;

            db.query(user.getCountOfCandidateSavedJobs(user_id), (err, data) => {
                if(err){logger.log(err)}
                else{
                    let candidateSavedJobsCount = data[0].count;

                    let job = new Job();
                    job.jobRecommendationsCount(user_id, (err, data) => {
                        if(err){logger.log(err)}
                        else{
                            let candidateRecommendedJobsCount = data;
        
                            res.status(200).json({
                                message:"Candidate Statistics.",
                                jobApplicationsCount: candidateJobApplicationsCount,
                                savedJobsCount: candidateSavedJobsCount,
                                recommendedJobsCount: candidateRecommendedJobsCount
                            });
                        } 
                    });
                } 
            });
        }
    });   
});

router.post("/upload-resume", (req, res, next) => {
    let user = req.session.passport.user;

    let form = new formidable.IncomingForm();
    
    form.on('fileBegin', function (name, file){
        if(file.name != ''){
            // Check if dir exist. If not create
            helpers.checkIfDirectoryExist(config.resume_upload_dir);

            let originalFileExtension = path.extname(file.name).toLowerCase();

            file.name = user.user_id + '_' + user.first_name + '_' + user.last_name + '_resume' +
                        originalFileExtension;

            file.path = config.resume_upload_dir + file.name;
        } 
    });

    form.on('file', function (name, file){
        if(file.name != ''){     
            //Upload additional file       
            logger.log('Uploaded ' + file.name);

            helpers.copyFile(file.path, config.main_assets_resume_dir);
        }
    });

    form.parse(req, function(err, fields, files) {
        if(err) {logger.log(err)}
        else{
            logger.log('##### fields #####');
            logger.log(fields);
            logger.log('##### files #####');
            logger.log(files);

            let user_id = user.user_id;
            let resume_id = fields.resume_id;
            let resume_url = ''; 

            if(files.resume.name != ''){
                resume_url = files.resume.name;
            }

            let userObj = new User();
            db.query(userObj.updateResumeFileUrlQuery(user_id, resume_id, resume_url), (err, data) =>{
                if(err){ 
                    logger.log(err);
                    helpers.saveActivityTrail(user_id, "Resume Upload",
                     "Resume upload failed");
                    res.redirect('/candidates/profile?q=resume&r=f');
                }
                else{            
                    helpers.saveActivityTrail(user_id, "Resume Upload", "Resume uploaded");
                    res.redirect('/candidates/profile?q=resume&r=s');
                }
            });
        }     
    });


    form.on('error', function (name, file){
        if(file.name != ''){
            logger.log('Error Uploading file: ' + file.name);
        }
    });

    form.on('progress', function(bytesReceived, bytesExpected) {
        if(bytesReceived && bytesExpected){
            let percent_complete = (bytesReceived / bytesExpected) * 100;
            logger.log(percent_complete.toFixed(2));
        }        
    });
}); 

router.post("/upload-profile-picture", (req, res, next) => {
    let userData = req.session.passport.user;

    let form = new formidable.IncomingForm();

    form.on('fileBegin', function (name, file){
        if(file.name != ''){
            // Check if dir exist. If not create
            helpers.checkIfDirectoryExist(config.profile_picture_upload_dir);

            let originalFileExtension = path.extname(file.name).toLowerCase();

            file.name = userData.user_id + '_' + userData.first_name + '_' + 
                        userData.last_name + '_profile_pic' + originalFileExtension;

            file.path = config.profile_picture_upload_dir + file.name;
        } 
    });  

    form.on('file', function (name, file){
        if(file.name != ''){     
            //Upload additional file       
            logger.log('Uploaded ' + file.name);
            helpers.copyFile(file.path, config.main_assets_profile_pic_dir);
        }
    });

    form.parse(req, function(err, fields, files) {
        if(err) {logger.log(err)}
        else{
            let user_id = userData.user_id;
            let profile_pic_url = '';
            let full_profile_pic_url = '';

            if(files.profile_picture.name != ''){
                profile_pic_url = files.profile_picture.name;
                full_profile_pic_url = config.profile_picture_dir + profile_pic_url;
            }

            let user = new User();
            db.query(user.updateProfilePictureUrlQuery(user_id, full_profile_pic_url), (err, data) =>{
                if(err){ 
                    logger.log(err);
                    helpers.saveActivityTrail(user_id, "Profile Picture Upload",
                     "Profile Picture upload failed");

                    res.status(200).json({
                        status: 'failed'
                    });

                }
                else{            
                    helpers.saveActivityTrail(user_id, "Profile Picture Upload", "Profile Picture Uploaded");
                    
                    /*sessionStore.saveCandidateData(req, user_id, userData.user_uuid, userData.first_name, 
                        userData.last_name, userData.email, userData.phone_number, userData.user_role, 
                        userData.is_logged_in, userData.is_activated, userData.resume_id, userData.is_first_login, 
                        userData.gender, userData.tagline, userData.address, full_profile_pic_url); */

                    //.saveProfilePicture(req, full_profile_pic_url);

                    req.session.passport.user = {
                        user_id : userData.user_id,
                        user_uuid : userData.user_uuid,
                        first_name : userData.first_name,
                        last_name : userData.last_name,
                        username : userData.username,
                        other_name : userData.other_name,
                        email : userData.email,
                        phone_number : userData.phone_number,
                        address : userData.address,
                        state : userData.state,
                        country : userData.country,
                        gender : userData.gender,
                        dob : userData.dob,
                        profile_completeness : userData.profile_completeness,
                        photo_url : full_profile_pic_url,
                        social_media_id : userData.social_media_id,
                        company : userData.company,
                        tagline : userData.tagline,
                        industry : userData.industry,
                        password : userData.password,
                        last_login_time : userData.last_login_time,
                        last_login_ip_address : userData.last_login_ip_address,
                        date_created : userData.date_created,
                        is_activated : userData.is_activated,
                        is_password_set : userData.is_password_set,
                        activation_token : userData.activation_token,
                        invite_token : userData.invite_token,
                        is_invite_token_active : userData.is_invite_token_active,
                        is_first_login : userData.is_first_login,
                        role_id : userData.role_id,
                        resume_id : userData.resume_id
                    }


                    res.status(200).json({
                        status: 'success',
                        message: "Profile picture uploaded.",
                        photo_url: full_profile_pic_url
                    });
                }
            }); 
        }     
    });

    form.on('error', function (name, file){
        if(file.name != ''){
            logger.log('Error Uploading file: ' + file.name);
        }
    });

    form.on('progress', function(bytesReceived, bytesExpected) {
        if(bytesReceived && bytesExpected){
            let percent_complete = (bytesReceived / bytesExpected) * 100;
            logger.log(percent_complete.toFixed(2));
        }        
    });
}); 

router.get('/saved-jobs', function (req, res){
    logger.log("saved-jobs")
    let userData = req.session.passport.user;

    res.render('candidate_saved_jobs', {
        view: 'saved-jobs',
        data: userData
    });
});

router.get('/get-all-saved-jobs', function (req, res){
    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    let user = new User();
    db.query(user.getAllCandidatesSavedJobs(user_id), (err, data)=> {
        if(!err) {
            res.status(200).json({
                message: "All Saved Jobs.",
                jobs: data
            });            
        }
    });    
});

router.post("/remove-saved-job", (req, res, next) => {
    let saved_job_id = req.body.saved_job_id;

    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    let job = new Job();
    db.query(job.removeSavedJob(saved_job_id), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {

                helpers.saveActivityTrail(user_id, "Job Removed",
                 "You removed a job from your saved jobs");

                res.status(200).json({
                    message: 'Job Removed.',
                    affectedRows: data.affectedRows
                });
            } else {
                res.status(200).json({ 
                    message:"Job Not found."
                });
            }
        } 
    });   
});

router.get('/settings', function (req, res){
    logger.log("settings")
    let userData = req.session.passport.user;

    logger.log(userData)

    let redirectFrom = req.query.f;
    let response = req.query.r;

    if(typeof redirectFrom != 'undefined' && redirectFrom){
        if(redirectFrom == 'u_pp'){
            res.render('candidate_settings', {
                view: 'settings',
                data: userData, 
                showAlert: true,
                alertMessage: response == 's' ? 'Profile picture updated successfully' : 'An error occurred',
                alertType: response == 's' ? 'success' : 'error'    
            });
        } 
         
    } else{
        res.render('candidate_settings', {
            view: 'settings',
            data: userData
        });
    }
});

router.post("/add", (req, res, next) => {
    'use strict';

     //read user information from request
     let user = new User();

     let user_uuid = uuidv1();
     let first_name = req.body.first_name;
     let last_name = req.body.last_name;
     let email = req.body.email;
     let phone_number = req.body.phone_number;
     let photo_url = req.body.photo_url;
     let social_media_id = req.body.social_media_id;
     let password = req.body.password;
 
     let username = '';
     let other_name = '';
     let gender = '';
     let dob = '';
     let profile_completeness = '';
     let tagline = '';
     let address = '';
 
     db.query(User.checkIfEmailExist(email), (err, data) => {
         if(!err){
             if(data && data.length > 0){
                res.redirect('/register?v=f');

             } else {
                 let is_activated = config.not_activated;

                 db.query(user.createUserQuery(user_uuid, first_name, last_name, username, other_name, email, phone_number, gender,
                     dob, profile_completeness, photo_url, social_media_id, tagline, password, is_activated), (err, data) => {
                    if(!err){
                        if(data){
                            let user_id = data.insertId;
                            logger.log("User inserted");
             
                            db.query(User.insertUserRole(user_id, config.candidate_role_tag), (err, data) => {
                                if(!err){

                                    logger.log("UserRole inserted");

                                    let resume = new Resume();

                                    db.query(resume.createResumeQuery(user_id), (err, data) => {
                                        if(!err){
                                            logger.log("UserResume Created");

                                            let is_logged_in = true;
                                            let resume_id = data.insertId;
                                            let is_first_login = config.true;

                                            //Save user id
                                            //sessionStore.saveUserId(req, user_id);  

                                            //saving user data in session
                                            //sessionStore.saveCandidateData(req, user_id, user_uuid, first_name, last_name, email, 
                                            //    phone_number, config.candidate_role_tag, is_logged_in, is_activated, resume_id,
                                            //    is_first_login, gender, tagline, address, photo_url);
// logger.log(req.session)
                                           // req.session.passport.user.user_id = user_id;

                                            let userData = 
                                                {
                                                    user_id : user_id,
                                                    user_uuid : user_uuid,
                                                    first_name : first_name,
                                                    last_name : last_name,
                                                    full_name : first_name + ' ' + last_name,
                                                    email : email,
                                                    phone_number : phone_number,
                                                    user_role : config.candidate_role_tag,
                                                    is_logged_in : is_logged_in,
                                                    is_activated : is_activated,
                                                    resume_id : resume_id,
                                                    is_first_login : is_first_login,
                                                    gender : gender,
                                                    tagline : tagline,
                                                    address : address,
                                                    profile_picture : photo_url
                                                };

                                           

                                            //Save Activity Trail
                                            helpers.saveActivityTrail(user_id, "Register", "Registration Completed.");
        

                                            let resumeEducation = {};
                                            let resumeWorkExperience = {};
                                            let resumeCertification = {};
                                            let resumeSkill = {};

                                            // process profile percentage
                                            helpers.calculateProfilePercentage(user_id, userData, resume,
                                                resumeEducation, resumeWorkExperience, resumeCertification, resumeSkill);

                                            // send welcome mail
                                            let fullname = first_name + ' ' + last_name;        
                                            mailer.sendWelcomeMail(req, user_id, fullname, email);

                                            // Redirect to login authentication to load session
                                            let redirect_link = '/auth/login?username=' + email + '&password=' + password;
                                            res.redirect(redirect_link);
                                        }
                                    })        
                                }
                            })
                        }
                    }
                });
            }
        }
    });
});

router.post("/update", (req, res, next) => {
    let userData = req.session.passport.user;
    let user_id = userData.user_id;
    
    if(req.body.current_password){
        changePassword(req, res, user_id, userData);
    } else{
        updateAllProfile(req, res, user_id, userData);
    }
});

function updateAllProfile(req, res, user_id, userData){
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone_number = req.body.phone_number;
    let address = req.body.address;
    let gender = req.body.gender;
    let dob = req.body.dob;
    let tagline = req.body.tagline;
    let state = req.body.state;
    let country = req.body.country;
    let industry = req.body.industry;

    let user = new User();
    db.query(user.updateCandidateQuery(user_id, first_name, last_name, email, phone_number,
         address, gender, dob, tagline, state, country, industry), (err, data)=> {
       if(!err){
            if(data && data.affectedRows > 0) {

                helpers.saveActivityTrail(user_id, "Profile Updated", "You updated your profile.");

                //Save back to session
                req.session.passport.user = {
                    user_id : userData.user_id,
                    user_uuid : userData.user_uuid,
                    first_name : first_name,
                    last_name : last_name,
                    username : userData.username,
                    other_name : userData.other_name,
                    email : email,
                    phone_number : phone_number,
                    address : address,
                    state : state,
                    country : country,
                    gender : gender,
                    dob : dob,
                    profile_completeness : userData.profile_completeness,
                    photo_url : userData.photo_url,
                    social_media_id : userData.social_media_id,
                    company : userData.company,
                    tagline : tagline,
                    industry : industry,
                    password : userData.password,
                    last_login_time : userData.last_login_time,
                    last_login_ip_address : userData.last_login_ip_address,
                    date_created : userData.date_created,
                    is_activated : userData.is_activated,
                    is_password_set : userData.is_password_set,
                    activation_token : userData.activation_token,
                    invite_token : userData.invite_token,
                    is_invite_token_active : userData.is_invite_token_active,
                    is_first_login : userData.is_first_login,
                    role_id : userData.role_id,
                    resume_id : userData.resume_id
                }

                userData = req.session.passport.user;

                res.render('candidate_settings', {
                    view: 'settings',
                    data: userData,
                    showAlert: true,
                    alertMessage: "Profile updated successfully.",
                    alertType: "success"
                });
            } else {
                res.render('candidate_settings', {
                    view: 'settings',
                    data: userData,
                    showAlert: true, 
                    alertMessage: "An error occurred updating your profile.",
                    alertType: "error"
                });
            }
       }
    });
}

function changePassword(req, res, user_id, userData){
    logger.log("in update password ooo")
    let current_password = req.body.current_password;
    let new_password = req.body.new_password;

    db.query(User.getUserPasswordQuery(user_id), (err, data) =>{
        if(err){logger.log(err)}
        
        else if(!data){
            logger.log("incorrect password");
            res.render('candidate_settings', {
                view: 'settings',
                data: userData,
                showAlert: true,
                alertMessage: "Incorrect Password",
                alertType: "error"
            });
        }

        else {
            if(data.length > 0){
                if(!bcrypt.compareSync(current_password, data[0].password)){
                    logger.log("Password does not match")

                    res.render('candidate_settings', {
                        view: 'settings',
                        data: userData,
                        showAlert: true,
                        alertMessage: "Password does not match",
                        alertType: "error"
                    });
                    
                } else {
                    logger.log("about to update")
                    db.query(User.updatePasswordQuery(user_id, new_password), (err, data)=> {
                        if(!err){
                            if(data && data.affectedRows > 0) {
                 
                                helpers.saveActivityTrail(user_id, "Password", "Password has been changed successfully.");
                 
                                res.render('candidate_settings', {
                                    view: 'settings',
                                    data: userData,
                                    showAlert: true,
                                    alertMessage: "Password changed Successfully",
                                    alertType: "success"
                                });
                            } else {
                                res.render('candidate_settings', {
                                    view: 'settings',
                                    data: userData,
                                    showAlert: true, 
                                    alertMessage: "An Error Occurred. Please try again.",
                                    alertType: "error"
                                });
                            }
                        }
                    });
                }
            }
        }
    });
}

router.post("/delete", (req, res, next) => {

    var userId = req.body.userId;

    db.query(User.deleteUserByIdQuery(userId), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {
                res.status(200).json({
                    message:`User deleted with id = ${userId}.`,
                    affectedRows: data.affectedRows
                });
            } else {
                res.status(200).json({
                    message:"User Not found."
                });
            }
        } 
    });   
});

router.get("/get-profile-percentage", (req, res, next) =>{
    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    db.query(User.getProfilePercentage(user_id), (err, data) => {
        if(err){logger.log(err)}
        else{
            res.status(200).json({
                message:"Candidate profile percentage.",
                profile_completeness: data[0].profile_completeness
            });
        }
    })
});
 

module.exports = router;