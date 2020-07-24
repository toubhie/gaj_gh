import express from 'express';
import db from '../db/database';
import Job from '../models/job';
import User from '../models/user';
import helpers from '../config/helpers';
import config from './../config/config'
import formidable from 'formidable';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import mailer from '../config/mail/mailer';
import logger from './../config/log4js';

const router = express.Router();

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.use(session({
    secret: config.session_secret,
    resave: config.session_resave,
    key: config.session_key,
    saveUninitialized: config.session_save_uninitialized,
    cookie: { maxAge: config.session_cookie_max_age }
}));

router.get("/", (req, res, next) => {

    db.query(Job.getAllJobsQuery(), (err, data)=> {
        if(!err) {
            res.status(200).json({
                message:"All Jobs listed.",
                jobs:data
            });
        }
    });    
});

router.get("/get-all-jobs", (req, res, next) => {

    db.query(Job.getAllJobsQuery(), (err, data)=> {
        if(!err) {
            for(let i = 0; i < data.length; i++){
                data[i].date_time_ago = helpers.getCurrentTimeAgo(data[i].date_created);
            }

            res.status(200).json({
                message:"All Jobs listed.",
                jobs:data
            });
        }
    });    
});

router.get("/get-all-job-filters", (req, res, next) => {

    db.query(Job.getAllIndustries(), (err, data)=> {
        if(!err) {
            let allIndustry = data;

            db.query(Job.getAllStates(), (err, data)=> {
                if(!err) {
                    let allStates = data;
        
                    db.query(Job.getAllJobTypes(), (err, data)=> {
                        if(!err) {
                            let allJobTypes = data;

                            db.query(Job.getAllJobCategories(), (err, data)=> {
                                if(!err) {
                                    let allJobCategories = data;

                                    db.query(Job.getAllSkills(), (err, data)=> {
                                        if(!err) {
                                            let allSkills = data;
                                
                                            res.status(200).json({
                                                message: "All Job Filters.",
                                                industries: allIndustry,
                                                states: allStates,
                                                jobTypes: allJobTypes,
                                                jobCategories: allJobCategories,
                                                skills: allSkills
                                            });
                                        }
                                    });    
                                }
                            });    
                
                        }
                    });    
                   
                }
            });    
            
        }
    });    
});

router.get("/get-all-states", (req, res, next) => {

    db.query(Job.getAllStates(), (err, data)=> {
        if(!err) {
            let allStates = data;

            res.status(200).json({
                message: "All States.",
                states: allStates
            });            
        }
    });    
});

router.get("/get-all-job-types", (req, res, next) => {

    db.query(Job.getAllJobTypes(), (err, data)=> {
        if(!err) {
            let allJobTypes = data;

            res.status(200).json({
                message: "All Job Types.",
                job_types: allJobTypes
            });            
        }
    });    
});

router.get("/get-all-job-post-params", (req, res, next) => {

    db.query(Job.getAllStates(), (err, data)=> {
        if(!err) {
            let allStates = data;

            db.query(Job.getAllJobTypes(), (err, data)=> {
                if(!err) {
                    let allJobTypes = data;

                    db.query(Job.getAllJobCategories(), (err, data)=> {
                        if(!err) {
                            let allJobCategories = data;

                            db.query(Job.getAllIndustries(), (err, data)=> {
                                if(!err) {
                                    let allIndustries = data;

                                    db.query(Job.getAllQualifications(), (err, data)=> {
                                        if(!err) {
                                            let allQualifications = data;

                                            db.query(Job.getAllExperienceLevel(), (err, data)=> {
                                                if(!err) {
                                                    let allExperienceLevel = data;

                                                    db.query(Job.getAllSkill(), (err, data)=> {
                                                        if(!err) {
                                                            let allSkills = data;   

                                                            db.query(Job.getAllShortlistParams(), (err, data)=> {
                                                                if(!err) {
                                                                    let allShortlistParams = data;
                                                                                        
                                                                    db.query(Job.getAllCountries(), (err, data)=> {
                                                                        if(!err) {
                                                                            let allCountries = data;
                                                                                                
                                                                            res.status(200).json({
                                                                                message: "All Data.",
                                                                                states: allStates,
                                                                                countries: allCountries,
                                                                                jobTypes: allJobTypes,
                                                                                jobCategories: allJobCategories,
                                                                                industries: allIndustries,
                                                                                qualifications: allQualifications,
                                                                                experienceLevel: allExperienceLevel,
                                                                                skills: allSkills,
                                                                                shortlistParams: allShortlistParams
                                                                            });            
                                                                        }
                                                                    });        
                                                                }
                                                            });            
                                                        }
                                                    });    
                                                }
                                            });    
                                        }
                                    });              
                                }
                            });             
                        }
                    });         
                }
            });        
        }
    });    
});

router.get("/get-all-cv-search-params", (req, res, next) => {

    db.query(Job.getAllStates(), (err, data) => {
        if(!err) {
            let allStates = data;

            db.query(Job.getAllQualifications(), (err, data) => {
                if(!err) {
                    let allQualifications = data;

                    res.status(200).json({
                        message: "All Data.",
                        states: allStates,
                        qualifications: allQualifications
                    });              
                }
            });        
        }
    });    
});

router.get("/get-all-industries", (req, res, next) => {

    db.query(Job.getAllIndustries(), (err, data)=> {
        if(!err) {
            let allIndustries = data;

            res.status(200).json({
                message: "All Data.",
                industries: allIndustries
            });     
        } 
    });    
});

router.get("/get-all-application-status", (req, res, next) => {

    db.query(Job.getAllApplicationStatus(), (err, data)=> {
        if(!err) {
            let allApplicationStatus = data;

            res.status(200).json({
                message: "All Application Status.",
                applicationStatus: allApplicationStatus
            });            
        }
    });    
});

router.get("/get-all-candidate-job-applications", (req, res, next) => {
    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    db.query(Job.getAllCandidateJobApplications(user_id), (err, data)=> {
        if(!err) {

            for(let i = 0; i < data.length; i++){
                data[i].date_applied = helpers.formatDateTime(data[i].date_created);
            }

            res.status(200).json({
                message: "All Job Applications.",
                jobs: data
            });            
        }
    });    
});

router.get("/filter-jobs", (req, res, next) => {
    let industry_params = req.query.f_industry;
    let skill_params = req.query.f_skill;
    let state_params = req.query.f_state;
    let job_type_params = req.query.f_job_type;
    let job_category_params = req.query.f_job_category;

    logger.log(industry_params)
    logger.log(state_params)
    logger.log(job_type_params)
    logger.log(job_category_params)

    let job = new Job();
    let filterJobsQuery = job.getFilterJobsProcessQuery(industry_params, skill_params, state_params,
         job_type_params, job_category_params);

    db.query(filterJobsQuery, (err, data) => {
        if(err){logger.log(err)}
        else{
            for(let i = 0; i < data.length; i++){
                data[i].date_time_ago = helpers.getCurrentTimeAgo(data[i].date_created);
            }

            res.status(200).json({
                message:"All Filtered Jobs listed.",
                jobs:data
            });
        }
    }) ;    
});

router.get("/keyword-search", (req, res, next) => {
    let keyword = req.query.keyword;

    db.query(Job.keywordSearch(keyword), (err, data)=> {
        if(!err) {
            if(data.length > 0) {
                for(let i = 0; i < data.length; i++){
                    data[i].date_time_ago = helpers.getCurrentTimeAgo(data[i].date_created);
                }
    
                res.status(200).json({
                    message:"All Jobs listed.",
                    jobs:data
                });
            } else {
                res.status(200).json({
                    message:"Jobs Not found.",
                    jobs:data
                }); 
            }
        } 
    });   
}); 

router.get("/get-candidate-job-recommendations", (req, res, next) => {
    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    let filter = req.query.filter;

    let job = new Job();
    if(typeof filter != 'undefined' && filter){
        job.jobRecommendationProcessWithFilter(user_id, filter, (err, data) => {
            if(err){logger.log(err)}
            else{
                for(let i = 0; i < data.length; i++){
                    data[i].date_time_ago = helpers.getCurrentTimeAgo(data[i].date_created);

                    let job_id = data[i].job_id;

                    //let total_score = job.percentageMatchProcess(user_id, job_id);
                    //let percentage_match = Math.round(((total_score / 40) * 100) * 10) /10;  // 40 is the highest score
                    //logger.log('percentage_match - ' + percentage_match);

                    //data[i].percentage_score = percentage_match;
                }

                res.status(200).json({
                    message:"Jobs found.",
                    recommendedJobs: data
                });
            }
        }); 
    } else{
        job.jobRecommendationProcess(user_id, (err, data) => {
            if(err){logger.log(err)}
            else{
                for(let i = 0; i < data.length; i++){
                    data[i].date_time_ago = helpers.getCurrentTimeAgo(data[i].date_created);

                    let job_id = data[i].job_id;

                    //let total_score = job.percentageMatchProcess(user_id, job_id);
                    //let percentage_match = Math.round(((total_score / 40) * 100) * 10) /10;  // 40 is the highest score
                    //logger.log('percentage_match - ' + percentage_match);

                    //data[i].percentage_score = percentage_match;
                }
                
                res.status(200).json({
                    message:"Jobs found.",
                    recommendedJobs: data
                });
            }
        });
    } 
});

router.get("/get-candidate-job-recommendations-for-dashboard", (req, res, next) => {
    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    let job = new Job();
    job.jobRecommendationProcessForDashboard(user_id, (err, data) => {
        if(err){logger.log(err)}
        else{
            for(let i = 0; i < data.length; i++){
                data[i].date_time_ago = helpers.getCurrentTimeAgo(data[i].date_created);

                let job_id = data[i].job_id;

                //let total_score = job.percentageMatchProcess(user_id, job_id);
                //let percentage_match = Math.round(((total_score / 40) * 100) * 10) /10;  // 40 is the highest score
                //logger.log('percentage_match - ' + percentage_match);

                //data[i].percentage_score = percentage_match;
            }
            
            res.status(200).json({
                message:"Jobs found.",
                recommendedJobs: data
            });
        }
    });
});

router.get('/get-last-5-jobs', function (req, res){
    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    db.query(Job.getRecruiterLast5PostedJobs(user_id), (err, data) => {
        if(err){logger.log(err)}
        else{
            for(let i = 0; i < data.length; i++){
                data[i].date_time_ago = helpers.getCurrentTimeAgo(data[i].date_created);
            }
            res.status(200).json({
                message:"Posted Jobs.",
                jobs: data
            });
        }
    });   
});

router.get('/get-all-recruiter-posted-jobs', function (req, res){
    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    db.query(Job.getAllRecruiterPostedJobs(user_id), (err, data) => {
        if(err){logger.log(err)}
        else{
            for(let i = 0; i < data.length; i++){
                data[i].date_time_ago = helpers.getCurrentTimeAgo(data[i].date_created);
                data[i].application_deadline = helpers.formatDateTime(data[i].application_deadline);
            }
            res.status(200).json({
                message:"Posted Jobs.",
                jobs: data
            });
        }
    });   
});

router.get('/job-detail/:jobId', function (req, res){
    let jobId = req.params.jobId;
    let p = req.query.p;    

    db.query(Job.getJobByIdQuery(jobId), (err, data)=> { 
        if(!err) {
            // sAVE data[0] to a var and checkIfUserAppliedToJob

            let jobData = data[0];
            let userData = req.session.passport.user;
            let user_id = userData.user_id;

            jobData.job_description = jobData.job_description.substring(0, jobData.job_description.length - 1);
            jobData.job_responsibilities = jobData.job_responsibilities.substring(0, jobData.job_responsibilities.length - 1)

            if(typeof jobData.job_responsibilities === 'undefined' || jobData.job_responsibilities == '' || 
                jobData.job_responsibilities == null || jobData.job_responsibilities == 'null'){

                jobData.job_description = jobData.job_description;
            } else {
                jobData.job_description = jobData.job_description + "<br><br><h6>Job Responsibilities</h6><br>"
                + jobData.job_responsibilities;
            }

            jobData.job_description = helpers.unescapeHTML(jobData.job_description);

            jobData.application_deadline = helpers.checkApplicationDeadline(jobData.application_deadline);

            let job = new Job();  
            db.query(job.checkIfUserAppliedToJob(jobId, user_id), (err, data) => {
                if(!err) {
                    if(data && data.length > 0) {                        
                        if(typeof p != 'undefined' && p){
                            if (p == 's'){
                                res.render('candidate_job_detail', {
                                    view: 'find-a-job',
                                    data: userData,
                                    jobData: jobData,
                                    showAlert: true,
                                    alertMessage: "Job Application Successful",
                                    alertType: "success"
                                }); 
                            } else if (p == 'f'){
                                res.render('candidate_job_detail', {
                                    view: 'find-a-job',
                                    data: userData,
                                    jobData: jobData,
                                    showAlert: true,
                                    alertMessage: "Job Application Failed.",
                                    alertType: "error"
                                }); 
                            }
                        } else{
                            res.render('candidate_job_detail', {
                                view: 'find-a-job',
                                data: userData,
                                jobData: jobData
                            }); 
                        }  
                        
                    } else {
                        res.status(200).json({
                            message:"Job Not found."
                        });
                    }
                } 
            });
        }
    });  
});

router.post('/check-application-status', function (req, res){
    let job_id = req.body.job_id;
    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    let job = new Job();
    db.query(job.checkIfUserAppliedToJob(job_id, user_id), (err, data) => {
        if(err){logger.log(err)}
        else{
            res.status(200).json({
                message:"Application Status",
                application_status: data[0].count
            });
        }
    });   
});

router.post("/processapply", (req, res, next) => {
    let user = req.session.passport.user;

    let form = new formidable.IncomingForm();
    
    form.on('fileBegin', function (name, file){
        if(file.name != ''){
            // Check if dir exist. If not create
            helpers.checkIfDirectoryExist(config.additional_resume_upload_dir);

            let originalFileExtension = path.extname(file.name).toLowerCase();

            file.name = user.user_id + '_' + user.first_name + '_' + user.last_name + '_additional_file' +
                        originalFileExtension;

            file.path = config.additional_resume_upload_dir + file.name;
        } 
    });

    form.on('file', function (name, file){
        if(file.name != ''){     
            //Upload additional file       
            logger.log('Uploaded ' + file.name);
            helpers.copyFile(file.path, config.main_assets_additional_resume_dir);
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
            let user_email = user.email;
            let user_full_name = user.first_name + ' ' + user.last_name;

            let job_id = fields.job_id;
            let job_title = fields.job_title;
            let cover_letter = fields.cover_letter;
            let additional_resume_url = '';

            if(files.additional_file.name != ''){
                additional_resume_url = files.additional_file.name;
            }

            cover_letter = cover_letter.replace("'", "\\'");

            let job = new Job();
            db.query(job.applyForJobQuery(job_id, user_id, cover_letter, additional_resume_url), (err, data) =>{
                if(err){ 
                    logger.log(err);
                    helpers.saveActivityTrail(user_id, "Job Application", "Job Application to - " + job_title + " failed");
                    res.redirect('/jobs/job-detail/' + job_id + '?p=f');
                }
                else{            
                    helpers.saveActivityTrail(user_id, "Job Application", "You applied to the " + job_title + " role");
                
                    mailer.sendJobApplicationMail(user_full_name, user_email, job_title);

                    res.redirect('/jobs/job-detail/' + job_id + '?p=s');
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

router.get('/apply/:jobId', function (req, res){
    let jobId = req.params.jobId;
    let userData = req.session.passport.user;

    let user = new User();
    db.query(user.getCandidateCV(userData.user_id), (err, data)=> { 
        if(!err) {
            let candidate_resume_url = 
                typeof data[0].resume_file_url != 'undefined' && data[0].resume_file_url
                && data[0].resume_file_url != '' && data[0].resume_file_url != null  
                ? data[0].resume_file_url : 'false';

            
            db.query(Job.getJobByIdQuery(jobId), (err, data)=> { 
                if(!err) {
                    if(data && data.length > 0) {
                        res.render('job_application_page', {
                            view: 'find-a-job',
                            data: userData,
                            jobData: data[0],
                            candidate_resume_url: candidate_resume_url
                        }); 
                    } else {
                        res.status(200).json({
                            message: "Job Not found."
                        });
                    }
                } 
            });    
        } 
    });    
});

router.post("/create-job", (req, res, next) => {

    let job_title = req.body.job_title;
    let job_type = req.body.job_type;
    let job_category = req.body.job_category;
    let location = req.body.location;
    let industry = req.body.industry; 
    let job_description = req.body.job_description; 
    let job_responsibilities = req.body.job_responsibilities; 
    let min_qualification = req.body.min_qualification; 
    let experience_level = req.body.experience_level; 
    let min_year_of_experience = req.body.min_year_of_experience; 
    let max_year_of_experience = req.body.max_year_of_experience; 
    let expected_salary = req.body.expected_salary; 
    let gender_type = req.body.gender_type; 
    let application_deadline = req.body.application_deadline; 
    let minimum_age = req.body.minimum_age; 
    let maximum_age = req.body.maximum_age; 
    let required_skills = req.body.required_skills;
    let shortlist_params = req.body.shortlist_params;    

    let recruiterData = req.session.passport.user;
    let user_id = recruiterData.user_id;
    let recruiter_full_name = recruiterData.company_name;
    let recruiter_email = recruiterData.email;
    let company_id = recruiterData.company_id;

    let default_country_id = 156; //Make Nigeria default
    
    let job = new Job();
    db.query(job.createJobQuery(job_title, company_id, default_country_id, job_type, job_category, location,
        industry, job_description, job_responsibilities, min_qualification, experience_level, min_year_of_experience,
        max_year_of_experience, expected_salary, gender_type, application_deadline, minimum_age, maximum_age,
        required_skills, shortlist_params, user_id), (err, data)=> {
        
        if(!err){
            helpers.saveActivityTrail(user_id, "Job Posted", 'Your Job '+job_title+' has been posted.');

            let job_id = data.insertId;

            logger.log("job_id - " + job_id)
            
            mailer.sendJobPostedMail(req, recruiter_email, recruiter_full_name, job_id, job_title);

            res.status(200).json({
                message:"Job added.",
                jobId: data.insertId
            });
        }    
    });
});

router.post("/edit-job-post", (req, res, next) => {

    let job_id = req.body.job_id;
    let job_title = req.body.job_title;
    let job_type = req.body.job_type;
    let job_category = req.body.job_category;
    let location = req.body.location;
    let industry = req.body.industry; 
    let job_description = req.body.job_description; 
    let job_responsibilities = req.body.job_responsibilities; 
    let min_qualification = req.body.min_qualification; 
    let experience_level = req.body.experience_level; 
    let min_year_of_experience = req.body.min_year_of_experience; 
    let max_year_of_experience = req.body.max_year_of_experience; 
    let expected_salary = req.body.expected_salary; 
    let gender_type = req.body.gender_type; 
    let application_deadline = req.body.application_deadline; 
    let minimum_age = req.body.minimum_age; 
    let maximum_age = req.body.maximum_age; 
    let required_skills = req.body.required_skills;
    let shortlist_params = req.body.shortlist_params;    

    let recruiterData = req.session.passport.user;
    let user_id = recruiterData.user_id;
    let recruiter_full_name = recruiterData.full_name;
    let recruiter_email = recruiterData.email;
    let company_id = recruiterData.company_id;

    let default_country_id = 156; //Make Nigeria default
    
    let job = new Job();
    db.query(job.editJobPostQuery(job_id, job_title, job_type, job_category, location, industry, job_description, 
        job_responsibilities, min_qualification, experience_level, min_year_of_experience, 
        max_year_of_experience, expected_salary, gender_type, application_deadline, minimum_age, maximum_age,
        required_skills, shortlist_params), (err, data)=> {
        
        if(!err){
            helpers.saveActivityTrail(user_id, "Job Post Edited", 'Your edited your job post: ('+job_title+').');

            //let job_id = data.insertId;

            //logger.log("job_id - " + job_id)
            
            //mailer.sendJobPostedMail(req, recruiter_email, recruiter_full_name, job_id, job_title);

            res.status(200).json({
                message: "Job edited.",
                result: true
            });
        }    
    });
});

router.post("/search-job-old", (req, res, next) => {
    let keyword = req.body.keyword;
    let industry = req.body.industry;
    //let state = req.body.state;
    //let country = req.body.country;
    let location = req.body.location;

    db.query(Job.searchJobsQuery(keyword, location), (err, data)=> {
        if(!err) {
            if(data.length > 0) {
                res.status(200).json({
                    message:`Jobs found.`,
                    searchedJobs:data
                });
            } else {
                res.status(200).json({
                    message:"Job Not found."
                });
            }
        } 
    });   
});

router.post("/search-job", (req, res, next) => {
    let keyword = req.body.keyword;
    let industry = req.body.industry;
    //let state = req.body.state;
    //let country = req.body.country;
    let location = req.body.location;

    res.redirect('/find-a-job?search='+keyword);
});

router.post("/save-job", (req, res, next) => {
    //read user information from request
    let job_id = req.body.job_id;
    let user_id = req.body.user_id;

    db.query(Job.saveJobQuery(job_id, user_id), (err, data)=> {
        helpers.saveActivityTrail(user_id, "Job Saved", "You saved a Job post with job_id - " + job_id);
        res.status(200).json({
            message:"Job added to wishlist.",
            savedJobId: data.insertId
        });
    });
});

router.post("/delete-job", (req, res, next) => {
    let job_id = req.body.job_id;
    let job_title = req.body.job_title;

    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    db.query(Job.deleteJobByIdQuery(job_id), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {

                helpers.saveActivityTrail(user_id, "Job Deleted", "You deleted a Job post titled ("+job_title+")");

                res.status(200).json({
                    message: 'Job deleted.',
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

router.post("/get-all-job-applicants", (req, res, next) => {
    let job_id = req.body.job_id;

    db.query(Job.getAllJobApplicants(job_id), (err, data) => {
        if(!err){
            let applicants_list = data;
            
            for(let i = 0; i < applicants_list.length; i++){
                applicants_list[i].date_created = helpers.formatDateTime(applicants_list[i].date_created);
                applicants_list[i].date_applied = helpers.formatDateTime(applicants_list[i].date_applied);
            }

            res.status(200).json({
                message: "All Applicants",
                applicants: data
            });
        }
    });

});

router.post("/get-all-shortlisted-job-applicants", (req, res, next) => {
    let job_id = req.body.job_id;

    db.query(Job.getAllShortlistedJobApplicants(job_id), (err, data) => {
        if(!err){
            for(let i = 0; i < data.length; i++){
                data[i].date_created = helpers.formatDateTime(data[i].date_created);
                data[i].date_applied = helpers.formatDateTime(data[i].date_applied);
            }
            res.status(200).json({
                message: "All Shortlisted Applicants",
                applicants: data
            });
        }
    });

});

router.get("/shortlist", (req, res, next) => {
    
    let user_id = 59;
    let job_id = 3081;

    let job = new Job();
    job.newShortlistProcess(res, user_id, job_id);
    //job.percentageMatchProcess(user_id, job_id)

});

router.get("/:jobId", (req, res, next) => {
    let jobId = req.params.jobId;

    db.query(Job.getJobByIdQuery(jobId), (err, data)=> { 
        if(!err) {
            if(data && data.length > 0) {
                
                res.status(200).json({
                    message:"Job found.",
                    job: data
                });
            } else {
                res.status(200).json({
                    message:"Job Not found."
                });
            }
        } 
    });    
});

module.exports = router;