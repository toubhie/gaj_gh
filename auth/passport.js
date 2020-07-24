import db from '../db/database';
import User from '../models/user';
import Company from '../models/company';
import Resume from '../models/resume';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import GoogleStrategy from 'passport-google-oauth20';
import LocalStrategy from 'passport-local';
import config from '../config/config';
import dateTime from 'node-datetime';
import bcrypt from 'bcryptjs';
import flash from 'connect-flash';
import storage from './../config/session_store';
import logger from './../config/log4js';
import uuidv1 from 'uuid/v1';
import mailer from '../config/mail/mailer';
import helper from './../config/helpers';


const auth = express.Router();

auth.use(cookieParser());
auth.use(bodyParser.urlencoded({ extended: false }));
auth.use(passport.initialize());
auth.use(passport.session());
auth.use(flash());

auth.use(session({
    secret: config.session_secret,
    resave: config.session_resave,
    key: config.session_key,
    saveUninitialized: config.session_save_uninitialized,
    cookie: { maxAge: config.session_cookie_max_age }
}));
  

// Passport Local Strategy 
passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, username, password, done) {
        let returnUrl = req.body.returnUrl;
        let token = req.body.token;

        console.log('returnUrl(before) - ' + returnUrl) 
        console.log('token(before) - ' + token) 
        
        db.query(User.checkIfEmailExist(username), (err, data) => {
            if(err){
                logger.log(err)
                return done(null, false, { message: 'Error' });
            }
            if(!data) {
                logger.log("NO DATA")
                return done(null, false, { message: 'bad password' });
            }

            // if the user is found but the password is wrong
            if(data.length > 0){                
                if (!bcrypt.compareSync(password, data[0].password)){
                    logger.log("Password does not match")
                    return done(null, false, { message: 'bad password2' });
                }
            }

            if(!data || data.length == 0){
                logger.log("This email is not registered")
                return done(null, false, { message: 'bad email/password' });
            } else{
                let getUserDataQuery = '';

                if(data[0].role_id == config.candidate_role_tag){
                    getUserDataQuery = User.getCandidateData(data[0].user_id);
                } else{
                    getUserDataQuery = User.getRecruiterData(data[0].user_id);
                }

                db.query(getUserDataQuery, (err, data) => {
                    if(err){logger.log(err)}
                    else{
                        //Check if there is a return url. If yes add it to userdata
                        if(typeof returnUrl != 'undefined' && returnUrl){
                            data[0].returnUrl = returnUrl;
                            data[0].token = token;
                        }

                        // all is well, return successful user
                        return done(null, data[0]);
                    }
                });
            }
        });       
    }   
));
 
auth.post('/login', passport.authenticate('local', { 
    failureRedirect: '/login?f=l&r=f', // redirect back to the signup page if there is an error
    failureFlash: true,
    failureMessage: "Invalid Email/Password. Please try again."

 }), function(req, res) {
        
        logger.log("User exist and is redirecting");

        logger.log(req.user);
        let userData = req.user;

        db.query(User.getUserRoleByUserId(userData.user_id), (err, data) => {
            if(!err){
                if(data){ 
                    let user_role = data[0].role_id;
                    logger.log("user_role -" + user_role);
                    
                    if(user_role == config.candidate_role_tag){
                        if(userData.returnUrl == 'start_test'){
                            processCandidateLoginToAssessment(req, res, userData, userData.token)
                        } else{
                            processCandidateLogin(req, res, userData, user_role);
                        }
                    }

                    else if(user_role == config.recruiter_admin_role_tag){
                        processRecruiterAdminLogin(req, res, userData, user_role);
                    }

                    else if(user_role == config.recruiter_role_tag){
                        processRecruiterLogin(req, res, userData, user_role);
                    }

                    else{
                        logger.log('No user role')
                        res.redirect('/login');
                    }
                }
            }
        });
});

auth.get('/login', passport.authenticate('local', { 
    failureRedirect: '/login?f=l&r=f', // redirect back to the signup page if there is an error
    failureFlash: true,
    failureMessage: "Invalid Email/Password. Please try again."

 }), function(req, res) {
        
        logger.log("User exist and is redirecting");

        logger.log(req.user);
        let userData = req.user;

        //Save user id
        storage.saveUserId(req, userData.user_id);  

        db.query(User.getUserRoleByUserId(userData.user_id), (err, data) => {
            if(!err){
                if(data){ 
                    let user_role = data[0].role_id;
                    logger.log("user_role -" + user_role);
                    
                    if(user_role == config.candidate_role_tag){
                        processCandidateLogin(req, res, userData, user_role);
                    }

                    else if(user_role == config.recruiter_admin_role_tag){
                        processRecruiterAdminLogin(req, res, userData, user_role);
                    }

                    else if(user_role == config.recruiter_role_tag){
                        processRecruiterLogin(req, res, userData, user_role);
                    }

                    else{
                        logger.log('No user role')
                        res.redirect('/login');
                    }
                }
            }
        });
});

function processCandidateLogin(req, res, user, user_role){
    logger.log("User is a CANDIDATE. Getting all users info ");
                    
    db.query(Resume.getResumeIdByUserId(user.user_id), (err, data) => {
        if(!err){
            if(data){
                let resume_id = data[0].resume_id;



                //Save user info
               // storage.saveCandidateData(req, user.user_id, user.user_uuid, user.first_name,
                //    user.last_name, user.email, user.phone_number, user_role, true, user.is_activated,
                //    resume_id, user.is_first_login, user.gender, user.tagline, user.address, user.photo_url)
            }
        }
    });

    // Get all candidate resume
    let resume = new Resume();
    resume.getAllUserResumeInformation(req, user.user_id);

    //Redirect to dashboard
    res.redirect('/candidates/dashboard');
}

function processRecruiterAdminLogin(req, res, user, user_role){
    logger.log("User is a RECRUITER ADMIN. Getting all info ");

    db.query(Company.getUserCompany(user.user_id), (err, data) => {
        if(err){logger.log(err)}
        else{
            if(data){
                let company_id = data[0].company_id;
                let company_name = data[0].company_name;
                
                //Save recruiter info
                //storage.saveRecruiterData(req, user.user_id, user.user_uuid, user.first_name,
                //    user.last_name, user.email, user.phone_number, user_role, true, company_id, 
                //    company_name, user.is_activated, user.is_first_login, user.photo_url);

                // Redirect to dashboard
                res.redirect('/recruiters/dashboard');
            }
        }
    })
}

function processRecruiterLogin(req, res, user, user_role){
    logger.log("User is a RECRUITER. Getting all info ");

    db.query(Company.getCompanyByIdQuery(user.company), (err, data) => {
        if(err){logger.log(err)}
        else{
            if(data){
                let company_id = data[0].company_id;
                let company_name = data[0].company_name;
                
                //Save recruiter info
                //storage.saveRecruiterData(req, user.user_id, user.user_uuid, user.first_name,
                //    user.last_name, user.email, user.phone_number, user_role, true, company_id, 
                //    company_name, user.is_activated, user.is_first_login, user.photo_url)
            
                // Redirect to dashboard
                res.redirect('/recruiters/dashboard');
            }
        }
    })
}

function processCandidateLoginToAssessment(req, res, user, token){
    logger.log("User is a CANDIDATE. Redirecting to Assessment");

    //Redirect to assessment
    res.redirect('/assessments/take-assessment/'+token);
}

// Passport Facebook Strategy 
passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret:config.facebook_api_secret ,
    callbackURL: config.facebook_callback_url,
    profileFields: [
      "id",
      "displayName",
      "email",
      "gender",
      "picture.type(large)"
    ]
},

function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
      if (config.use_database === true) {
          
          db.query(User.checkIfUserExistsBySocialMediaId(profile.id), (err, data) => {
              if (err) {
                  throw err;
              }
              if (data && data.length === 0) {
                  let fullname = profile.displayName.split(' ');
                  let first_name, last_name = '';

                  if(fullname.length > 0){
                      first_name = fullname[1];
                      last_name = fullname[0];
                  } else{
                      first_name = fullname;
                  }
                  
                  let dt = dateTime.create();
                  let date_created = dt.format('Y-m-d H:M:S');        
                  
                  let user = new User(uuidv1(), first_name, last_name, profile.emails[0].value, 'password', 
                  profile.id, date_created);
                  db.query(user.createCandidateQuery(), function(err, data) {
                      if (err) { throw err;  } 
                      
                      else {
                          if(data){
                              let user_id = data.insertId;
               
                              db.query(User.insertUserRole(user_id, 1), (err, data) => {
                               if(!err){
                                  logger.log("Candidate added with user role.");
                                  return done(null, profile);
                               }
                              })
                          }
                      }  
  
                  });
              return done(null, profile);
              } else {
                  logger.log("User already exist");
                  return done(null, profile);
              }
          });
  
      }
  });
}));

auth.get('/facebook', passport.authenticate('facebook', {scope: ['email', 'public_profile']}));

auth.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
  logger.log('in facebook callback');
  res.render('dashboard');
});



// Passport Google Strategy 
passport.use(new GoogleStrategy({
    clientID: config.google_client_id,
    clientSecret:config.google_client_secret ,
    callbackURL: config.google_callback_url,
},

function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        if (config.use_database === true) {
          
            db.query(User.checkIfUserExistsBySocialMediaId(profile.id), (err, data) => {
                if (err) {
                    throw err;
                }
                if (data && data.length === 0) {
                    let fullname = profile.displayName.split(' ');
                    let first_name, last_name = '';
  
                    if(fullname.length > 0){
                        first_name = fullname[1];
                        last_name = fullname[0];
                    } else{
                        first_name = fullname;
                    }
                    
                    let dt = dateTime.create();
                    let date_created = dt.format('Y-m-d H:M:S');        
                    
                    let user = new User(uuidv1(), first_name, last_name, profile.emails[0].value, 'password', 
                    profile.id, date_created);
                    db.query(user.createCandidateQuery(), function(err, data) {
                        if (err) { throw err;  }   
                        else {
                            if(data){
                                let user_id = data.insertId;
                 
                                db.query(User.insertUserRole(user_id, config.candidate_role_tag), (err, data) => {
                                    if(!err){
                                        logger.log("Candidate added with user role.");
                                        return done(null, profile);
                                    }
                                })
                            }
                        }  
    
                    });
                return done(null, profile);
                } else {
                    logger.log("User already exist");
                    return done(null, profile);
                }
            });
    
        }
    });

}));

auth.get('/google', passport.authenticate('google', {scope: ['email', 'profile', 'openid']}));

auth.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) {
  logger.log('in google callback');
  res.render('dashboard');
});


// Passport LinkedIn Strategy 
// passport.use(new LinkedInStrategy({
//     clientID: config.linkedin_client_id,
//     clientSecret: config.linkedin_client_secret,
//     callbackURL: config.linkedin_callback_url,
//     scope: ['r_emailaddress', 'r_liteprofile', 'w_member_social']
// }, 
  
// function(accessToken, refreshToken, profile, done) {
//     // asynchronous verification, for effect...
//     process.nextTick(function () {
     
//         logger.log(profile)
//       return done(null, profile);
//     });
// })); 

// auth.get('/linkedin', passport.authenticate('linkedin', {state: true}));

// auth.get('/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/' }),
// function(req, res) {
//   logger.log('in linkedin callback');
//   res.render('dashboard');
// });


auth.get('/logout', function(req, res){
    req.logout();
    req.session.destroy();
    res.redirect('/');
});
    
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { 
        logger.log("user is already authenticated..proceed");
        return next();
    }

    logger.log("user is not authenticated..back to login");
    res.redirect('/login') 
}

auth.post('/forgotpassword', function(req, res){
    let email = req.body.email;
 
    db.query(User.checkIfEmailExist(email), (err, data) => {
        if(err){ throw err; }
        else{
            if(data && data.length > 0){
                logger.log('user exist...Sending Password Reset Mail');

                let userData = data[0];

                let user_id = userData.user_id;
                let userFullName = userData.first_name + " " + userData.last_name;

                mailer.sendForgotPasswordEmail(req, user_id, userFullName, email);

                res.redirect('/forgot-password?v=s');

            } else{
                res.redirect('/forgot-password?v=f');
            }
           
        }
    });
});

auth.get("/verify-password-token/:token", (req, res, next) => {
    let password_reset_token = req.params.token;

    db.query(User.getUserByPasswordResetToken(password_reset_token), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                logger.log("User id From Password Reset Token - " + data[0].user_id);
                let user_id = data[0].user_id;

                let user = new User();
                db.query(user.deactivatePasswordResetToken(data[0].user_id), (err, data)=> {
                    if(err){logger.log(err)}
                    else{
                        logger.log("User Password Reset Token is deactivated");
                        
                        // Redirect to create password page
                        res.redirect('/create-password?userId='+user_id);
                    } 
                });    
            } else {
                res.status(200).json({
                    message:"User Not found."
                });
            }
        } 
    });    
});

auth.get('/verify/:userId/:token', function(req, res){
    let user_id = req.params.userId;
    let token = req.params.token;

    let user = new User();
    
    db.query(user.compareUserActivationToken(user_id, token), (err, data) =>{
        if(!err){
            if(data && data.length > 0){
                db.query(user.activateUser(user_id), (err, data) => {
                    if(!err){
                        if(data && data.affectedRows > 0){
                            logger.log("User activated");

                            let ifAuthenticated = helper.checkifAuthenticated(req, res);
                            logger.log('ifAuthenticated - ' + ifAuthenticated)

                            if(ifAuthenticated){
                                res.redirect("/candidates/dashboard");
                            } 
                        } 
                        else{
                            logger.log("User NOT activated")
                            res.send("User NOT activated");
                        }
                    }
                })
            }
            else{
                logger.log("User with token doesnt exist")
                res.send("User with token doesnt exist");
            }
            
        }
    })
});

// Passport session setup.
passport.serializeUser(function(user, done) {
    logger.log("This is user id serializwd -----" + user.user_id);

    done(null, user);
});
    
passport.deserializeUser(function(user, done) {
    done(null, user);
});

module.exports = auth, ensureAuthenticated;

