import express from "express";
import db from "../db/database";
import Assessment from "../models/assessment";
import Job from "../models/job";
import config from '../config/config';
import helpers from './../config/helpers';
import logger from './../config/log4js';

const router = express.Router();

router.get("/", (req, res, next) => {

    db.query(Assessment.getAllAssessmentsQuery(), (err, data)=> {
        if(!err) {
            res.status(200).json({
                message: "Assessments listed.",
                assessments: data
            });
        }
    });    
});

router.post("/add", (req, res, next) => {
    //read user information from request
    
    let assessment_name = req.body.assessment_name;
    let assessment_type = req.body.assessment_type;
    let job_assigned_to = req.body.job_assigned_to;
    let description = req.body.assessment_description;
    let timer = req.body.assessment_time;

    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    let assessment = new Assessment();
    db.query(assessment.createAssessmentQuery(assessment_name, assessment_type, job_assigned_to, 
        description, timer, user_id), (err, data)=> {

        if(err){logger.error(err)}
        else{
            res.status(200).json({
                message: "Assessment added.",
                assessmentId: data.insertId
            });
        }
    });
});

router.get("/get-create-assessment-params", (req, res, next) => {

    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    db.query(Job.getAllPostedJobsToBeAssigned(user_id), (err, data)=> {
        if(!err) {
            let allJobs = data;

            for(let i = 0; i < allJobs.length; i++){
                allJobs[i].value = allJobs[i].value.toString();
            }

            db.query(Assessment.getAllAssessmentTypes(), (err, data)=> {
                if(!err) {
                    let allAssessmentTypes = data;
        
                    res.status(200).json({
                        message: "All Params",
                        assessment_types: allAssessmentTypes,
                        jobs: allJobs
                    });            
                }
            });              
        }
    });    
});

router.post("/get-edit-assessment-params", (req, res, next) => {
    let assessment_id = req.body.assessment_id;
    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    db.query(Job.getAllPostedJobsToBeAssigned(user_id), (err, data)=> {
        if(!err) {
            let allJobs = data;

            for(let i = 0; i < allJobs.length; i++){
                allJobs[i].value = allJobs[i].value.toString();
            }

            db.query(Assessment.getAllAssessmentTypes(), (err, data)=> {
                if(!err) {
                    let allAssessmentTypes = data;
        
                    db.query(Assessment.getAllAssessmentQuestions(assessment_id), (err, data)=> {
                        if(!err) {
                            let allQuestions = data;
                
                            res.status(200).json({
                                message: "All Params",
                                assessment_types: allAssessmentTypes,
                                jobs: allJobs,
                                questions: allQuestions
                            });            
                        }
                    });              
                }
            });              
        }
    });    
});

router.get("/get-all-recruiters-assessments", (req, res, next) => {
    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    db.query(Assessment.getAllAssessmentsByRecruiter(user_id), (err, data)=> {
        if(!err) {
            for(let i = 0; i < data.length; i++){
                data[i].date_time_ago = helpers.getCurrentTimeAgo(data[i].date_created);
            }

            res.status(200).json({
                message: "All Assessments",
                assessments: data
            });             
        }
    });    
});

router.post("/create-questions", (req, res, next) => {
    //read user information from request
    let assessment_id = req.body.assessment_id;
    let question_set = JSON.parse(req.body.question_set);

    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    let assessment = new Assessment();

    for(let i = 0; i < question_set.length; i++){
        let question_no =  question_set[i].index;
        let question =  question_set[i].question;
        let question_type =  question_set[i].question_type;
        let correct_answer =  question_set[i].correct_answer;
        let score =  question_set[i].score;
        let time_to_answer =  question_set[i].time;

        let options = question_set[i].options;
        let option_a = options[0];
        let option_b = options[1];
        let option_c = options[2];
        let option_d = options[3];

        db.query(assessment.createQuestion(assessment_id, question_no, question, question_type, option_a, 
            option_b, option_c, option_d, correct_answer, score, time_to_answer, user_id), (err, data)=> {
            if(err) {logger.error(err)}
        });     
    }

    res.status(200).json({
        message: "Questions added.",
    }); 
    
});

router.post("/edit-questions", (req, res, next) => {
    //read user information from request
    let assessment_id = req.body.assessment_id;
    let question_set = JSON.parse(req.body.question_set);

    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    let assessment = new Assessment();

    var ifCompleted = false;

    for(let i = 0; i < question_set.length; i++){
        let question_id =  question_set[i].question_id;
        let question_no =  question_set[i].index;
        let question =  question_set[i].question;
        let question_type =  question_set[i].question_type;
        let correct_answer =  question_set[i].correct_answer;
        let score =  question_set[i].score;
        let time_to_answer =  question_set[i].time;

        let options = question_set[i].options;
        let option_a = options[0];
        let option_b = options[1];
        let option_c = options[2];
        let option_d = options[3];

        //If a new question has been added, create new question; else edit
        if(typeof question_id == 'undefined'){
            db.query(assessment.createQuestion(assessment_id, question_no, question, question_type, option_a,
                option_b, option_c, option_d, correct_answer, score, time_to_answer, user_id), (err, data)=> {
                if(!err) {
                    ifCompleted = true;       
                }
            }); 
        } else{
            db.query(assessment.editQuestion(question_id, question_no, question, question_type, option_a, 
                option_b, option_c, option_d, correct_answer, score, time_to_answer), (err, data)=> {
                if(!err) {
                    ifCompleted = true;       
                }
            }); 
        }   
        logger.log('ifCompleted - ' +ifCompleted) 
    }
        
    res.status(200).json({
        message: "Questions saved successfully.",
        result: true
    });
        
    
    //logger.log('ifCompleted (AFTER)- ' +ifCompleted)

});

router.post("/edit-assessment-data", (req, res, next) => {
    //read user information from request
    
    let assessment_id = req.body.assessment_id;
    let assessment_name = req.body.assessment_name;
    let assessment_type = req.body.assessment_type;
    let job_assigned_to = req.body.job_assigned_to;
    let description = req.body.assessment_description;
    let timer = req.body.assessment_time;

    let assessment = new Assessment();
    db.query(assessment.editAssessmentQuery(assessment_id, assessment_name, assessment_type, job_assigned_to, 
        description, timer), (err, data)=> {

        if(data){
            res.status(200).json({
                message: "Assessment edited.",
                result: true
            });
        }
    });
});

router.get('/assessment-detail/:assessmentId', function (req, res){
    let assessment_id = req.params.assessmentId;
    let userData = req.session.passport.user;

    let assessment = new Assessment();
    db.query(assessment.getAssessmentByAssessmentId(assessment_id), (err, data) => {
        if(err){logger.log(err)}
        else{
            let assessmentData = data[0];

            res.render('recruiter_view_assessment', {
                view: 'assessments',
                data: userData,
                assessmentData: assessmentData
            }); 
        }
    });
});

router.post('/get-all-assessment-candidates', function (req, res){
    let assessment_id = req.body.assessment_id;
    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    let assessment = new Assessment();
    db.query(assessment.getAllAssessmentCandidates(assessment_id), (err, data) => {
        if(err){logger.log(err)}
        else{
            let allAssessmentCandidates = data;

            let total_score = 0;

            for(let i = 0; i < allAssessmentCandidates.length; i++){
                data[i].date_attempted = helpers.formatDateTime(data[i].date_created);

                total_score += parseInt(data[i].score);
            }

            let average_score = (total_score/allAssessmentCandidates.length)
            average_score = Math.round(average_score * 10) / 10; //Round up to 1 decimal place
            logger.log('average_score - ' +average_score);

            res.status(200).json({
                message: "All Assessment Candidates",
                candidates: allAssessmentCandidates,
                average_score: average_score
            });  
        }
    });
});

router.get('/edit-assessment/:assessmentId', function (req, res){
    let assessmentId = req.params.assessmentId;
    let userData = req.session.passport.user;

    let assessment = new Assessment();
    db.query(assessment.getAssessmentByAssessmentId(assessmentId), (err, data)=> { 
        if(!err) {
            let assessmentData = data[0];

            res.render('recruiter_edit_assessment', {
                view: 'assessments',
                data: userData,
                assessmentData: assessmentData
            }); 
        }
    });      
});

router.post("/delete-assessment", (req, res, next) => {
    let assessment_id = req.body.assessment_id;
    let assessment_name = req.body.assessment_name;

    let userData = req.session.passport.user;
    let user_id = userData.user_id;

    db.query(Assessment.deleteAssessmentByIdQuery(assessment_id), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {

                helpers.saveActivityTrail(user_id, "Assessment Deleted", "You have deleted your assessment.");

                res.status(200).json({
                    message: 'Assessment deleted.',
                    affectedRows: data.affectedRows
                });
            } else {
                res.status(200).json({
                    message:"Assessment Not found."
                });
            }
        } 
    });   
});

router.get('/take-assessment/:assessmentToken', function (req, res){
    let assessmentToken = req.params.assessmentToken; 

    let assessment = new Assessment();
    db.query(assessment.getAssessmentInfoByToken(assessmentToken), (err, data) => {
        if(err){logger.error(err)}
        else{
            let assessmentData = data[0];

            res.redirect('/assessments/assessment-info/' + assessmentData.assessment_id);
        }
    });
});

router.get('/assessment-info/:assessmentId', function (req, res){
    let assessmentId = req.params.assessmentId;

    let assessment = new Assessment();
    db.query(assessment.getAssessmentByAssessmentId(assessmentId), (err, data) => {
        if(err){logger.error(err)}
        else{
            let assessmentData = data[0];

            res.render('assessment_info_page', {
                assessmentData: assessmentData
            });
        }
    });
});

router.get('/start-test/:assessmentToken', function (req, res){
    let assessmentToken = req.params.assessmentToken;

    if(typeof req.session.passport != 'undefined' || req.session.passport || req.session.passport != null){
        let userData = req.session.passport.user;
       
        let assessment = new Assessment();
        db.query(assessment.getAssessmentInfoByToken(assessmentToken), (err, data) => {
            if(err){logger.error(err)}
            else{
                let assessmentData = data[0];

                res.render('assessment_question_page', {
                    userData: userData,
                    assessmentData: assessmentData
                }); 
            }
        });


    } else{
        res.redirect('/login?f=start_test&t='+assessmentToken);
    }

    
});

router.post("/get-assessment-questions", (req, res, next) => {
    let assessment_id = req.body.assessment_id;

    db.query(Assessment.getAllAssessmentQuestions(assessment_id), (err, data)=> {
        if(err){logger.error(err)}
        else {
            let questionsData = data; 

            res.status(200).json({
                message: "All Questions",
                questionsData: questionsData
            });             
        }
    });    
});  

module.exports = router;