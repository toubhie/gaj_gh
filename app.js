import express from 'express';
import bodyparser from 'body-parser';
import cors from 'cors';
import flash from 'connect-flash';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import appRoot from 'app-root-path';

import users from './api/users';
import jobs from './api/jobs';
import companies from './api/companies';
import candidates from './api/candidates';
import recruiters from './api/recruiters';
import auth from './auth/passport';
import resumes from './api/resumes';
import payments from './api/payments';
import invites from './api/invites';
import assessments from './api/assessments';

import config from './config/config';
import User from './models/user';
import Job from './models/job';
import db from './db/database';
import helpers from './config/helpers';
import logger from './config/log4js';
import mailer from './config/mail/mailer';

import AzureHelper from './config/azure_helpers';

const app = express(); 

app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(session({
    secret: config.session_secret,
    resave: config.session_resave,
    key: config.session_key,
    saveUninitialized: config.session_save_uninitialized,
    cookie: { maxAge: config.session_cookie_max_age }
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/assets'));

app.use("/users", users);
app.use("/jobs", jobs);
app.use("/companies", companies);
app.use("/auth", auth);
app.use("/candidates", candidates);
app.use("/recruiters", recruiters);
app.use("/resume", resumes);
app.use("/payments", payments);
app.use("/invites", invites);
app.use("/assessments", assessments);

app.get('/faq', function (req, res){
    if(typeof req.session.passport != 'undefined' || req.session.passport || req.session.passport != null){
        let userData = req.session.passport.user;
        res.render('faq', {
            userAuthenticated: 'true',
            userData: userData
        }); 
    } else{
        res.render('faq', {
            userAuthenticated: 'false'
        }); 
    }
});

app.get('/azure-test', function(req, res){
    let azureHelper = new AzureHelper();

    azureHelper.uploadBlobToAzure2();
});

app.get('/', function (req, res){
    
    let job = new Job();
    db.query(job.get10LatestJobs(), (err, data) => {
        if(err){logger.log(err)}
        else{
            let jobs = data;

            if(typeof req.session.passport != 'undefined' || req.session.passport || req.session.passport != null){
                let userData = req.session.passport.user;
                res.render('index', {
                    userAuthenticated: 'true',
                    userData: userData,
                    jobs: jobs
                }); 
            } else{
                res.render('index', {
                    userAuthenticated: 'false',
                    jobs: jobs
                }); 
            }
        }
    });
});
 
app.get('/company-info', function (req, res){
    if(typeof req.session.passport != 'undefined' || req.session.passport || req.session.passport != null){
        let userData = req.session.passport.user;
        res.render('company_info', {
            userAuthenticated: 'true',
            userData: userData
        }); 
    } else{
        res.render('company_info', {
            userAuthenticated: 'false'
        }); 
    }
});

app.get('/find-a-job', function (req, res){
    if(typeof req.session.passport != 'undefined' || req.session.passport || req.session.passport != null){
        let userData = req.session.passport.user;
        res.render('search_job', {
            userAuthenticated: 'true',
            userData: userData
        }); 
    } else{
        res.render('search_job', {
            userAuthenticated: 'false'
        }); 
    }
});

app.get('/job-detail/:jobId', function (req, res){
    let jobId = req.params.jobId;

    db.query(Job.getJobByIdQuery(jobId), (err, data)=> { 
        if(!err) {
            let jobData = data[0];

            if(typeof jobData.company_description != 'undefined' || jobData.company_description != null ||
                jobData.company_description != 'null' || jobData.company_description != ''){

                jobData.company_description = jobData.company_description.substring(0, jobData.company_description.length - 1);
                jobData.company_description = helpers.unescapeHTML(jobData.company_description);
            }

            if(typeof jobData.job_description != 'undefined' || jobData.job_description != null ||
                jobData.job_description != 'null' || jobData.job_description != ''){

                jobData.job_description = jobData.job_description.substring(0, jobData.job_description.length - 1);
                jobData.job_description = helpers.unescapeHTML(jobData.job_description);
            }
            
            if(typeof jobData.job_responsibilities != 'undefined' || jobData.job_responsibilities != null ||
                jobData.job_responsibilities != 'null' || jobData.job_responsibilities != ''){

                jobData.job_responsibilities = jobData.job_responsibilities.substring(0, jobData.job_responsibilities.length - 1);
                jobData.job_responsibilities = helpers.unescapeHTML(jobData.job_responsibilities);
            }

            jobData.application_deadline = helpers.checkApplicationDeadline(jobData.application_deadline);
            
            
            if(typeof req.session.passport != 'undefined' || req.session.passport || req.session.passport != null){
                let userData = req.session.passport.user;
                res.render('job_detail', {
                    userAuthenticated: 'true',
                    jobData: jobData,
                    userData: userData
                }); 
            } else{
                res.render('job_detail', {
                    userAuthenticated: 'false',
                    jobData: jobData
                }); 
            }
        }
    });  
});

app.get('/login', function (req, res){
    let redirectFrom = req.query.f;
    let response = req.query.r;

    if(typeof redirectFrom != 'undefined' && redirectFrom){
        //If redirect is from Update User Profile
        if(redirectFrom == 'u_iu'){
            res.render('login', {
                showAlert: true,
                alertMessage: response == 's' ? 'Information Saved Successfully. Please login' : 'Profile could not update',
                alertType: response == 's' ? 'success' : 'error'
            }); 
        } 

        else if(redirectFrom == 'l'){
            res.render('login', {
                showAlert: true,
                alertMessage: response == 's' ? 'Login Successful' : 'Invalid E-mail or Password',
                alertType: response == 's' ? 'success' : 'error' 
            }); 
        }  

        else if(redirectFrom == 'fp'){
            res.render('login', {
                showAlert: true,
                alertMessage: response == 's' ? 'Password has been changed successfully' : 'Something happened while changing your password. Please contact support.',
                alertType: response == 's' ? 'success' : 'error'
            }); 
        } 

        else if(redirectFrom == 'start_test'){
            res.render('login', {
                showAlert: true,
                alertMessage: 'You need to login to take this test',
                alertType: 'info',
                returnUrl: 'start_test'
            }); 
        } 
        
    } else{
        res.render('login');
    }
});

app.get('/candidate-info', function (req, res){
    if(typeof req.session.passport != 'undefined' || req.session.passport || req.session.passport != null){
        let userData = req.session.passport.user;
        res.render('candidates_landing_page', {
            userAuthenticated: 'true',
            userData: userData
        }); 
    } else{
        res.render('candidates_landing_page', {
            userAuthenticated: 'false'
        }); 
    }
});

app.get('/recruiter-info', function (req, res){
    if(typeof req.session.passport != 'undefined' || req.session.passport || req.session.passport != null){
        let userData = req.session.passport.user;
        res.render('recruiters_landing_page', {
            userAuthenticated: 'true',
            userData: userData
        }); 
    } else{
        res.render('recruiters_landing_page', {
            userAuthenticated: 'false'
        }); 
    }
});

app.get('/assessment', function (req, res){
    if(typeof req.session.passport != 'undefined' || req.session.passport || req.session.passport != null){
        let userData = req.session.passport.user;
        res.render('assessment_landing_page', {
            userAuthenticated: 'true',
            userData: userData
        }); 
    } else{
        res.render('assessment_landing_page', {
            userAuthenticated: 'false'
        }); 
    }
});

app.get('/career-advice', function (req, res){
    res.redirect('http://blog.getajobgh.com');
});

app.get('/post-a-job', function (req, res){
    res.render('login'); 
});

app.get('/register', function (req, res){
    let response = req.query.v;

    if(typeof response != 'undefined' && response){
        res.render('register', {
            showAlert: true,
            alertMessage: response == 's' ? 'Registration Successful' : 'This email address exists in our database. Please use another email.',
            alertType: response == 's' ? 'success' : 'error'
        });       
    } else{
        res.render('register');
    }
});

app.get('/forgot-password', function (req, res){
    let response = req.query.v;

    if(typeof response != 'undefined' && response){
        res.render('forgot_password', {
            showAlert: true,
            alertMessage: response == 's' ? 'A Password Reset link has been sent to your registered email address' : 'This email address does not exist in our database.',
            alertType: response == 's' ? 'success' : 'error'
        });       
    } else{
        res.render('forgot_password');
    }
}); 

app.get("/create-password", (req, res, next) => {
       
    let user_id = req.query.userId;
    
    res.render('change_password', {user_id: user_id});

});

app.post("/create-password-for-user", (req, res, next) => {
    let user_id = req.body.user_id;
    let password = req.body.password;
    
    db.query(User.updatePasswordForUser(user_id, password), (err, data)=> {
        if(!err){
            if(data && data.affectedRows > 0) {
 
                helpers.saveActivityTrail(user_id, "Password Reset", "Password has been changed successfully.");
 
                res.redirect('/login?f=fp&r=s');

            } else {
                res.redirect('/recruiters/create-password?userId='+user_id);
            }
        }
    });
    
});

app.get('/privacy-policy', function (req, res){
    if(typeof req.session.passport != 'undefined' || req.session.passport || req.session.passport != null){
        let userData = req.session.passport.user;
        res.render('privacy_policy', {
            userAuthenticated: 'true',
            userData: userData
        }); 
    } else{
        res.render('privacy_policy', {
            userAuthenticated: 'false'
        }); 
    }
});

app.get('/cookie-policy', function (req, res){
    if(typeof req.session.passport != 'undefined' || req.session.passport || req.session.passport != null){
        let userData = req.session.passport.user;
        res.render('cookie_policy', {
            userAuthenticated: 'true',
            userData: userData
        }); 
    } else{
        res.render('cookie_policy', {
            userAuthenticated: 'false'
        }); 
    }
});

app.get('/h1dd3n_s1t3map', function(req, res) {
    let sitemap_file = `${appRoot}/views/includes/sitemap/sitemap.xml`;

    res.sendFile(sitemap_file);
});


//if we are here then the specified request is not found
app.use((req, res, next)=> {
    if(typeof req.session.passport != 'undefined' || req.session.passport || req.session.passport != null){
        let userData = req.session.passport.user;
        res.status(404).render('404', {
            userAuthenticated: 'true',
            userData: userData
        }); 
    } else{
        res.status(404).render('404', {
            userAuthenticated: 'false'
        }); 
    }    
});

//all other requests are not implemented.
app.use((err, req, res, next) => {
   res.status(err.status || 501);
   res.json({
       error: {
           code: err.status || 501,
           message: err.message
       }
   });
});

module.exports = app;