var express = require('express');
var db = require('../db/database');
var Assessment = require('../models/assessment');
var Job = require('../models/job');
var config = require('../config/config');
var helpers = require('./../config/helpers');
var logger = require('./../config/log4js');

var router = express.Router();

router.get("/", (req, res, next) => {
    try {
        db.query(Assessment.getAllAssessmentsQuery(), (err, data) => {
            if (!err) {
                res.status(200).json({
                    message: "Assessments listed.",
                    assessments: data
                });
            }
        });
    } catch (error) {
        logger.log(error);
    }
});

router.post("/add", (req, res, next) => {
    try {
        //read user information from request
        var assessment_name = req.body.assessment_name;
        var assessment_type = req.body.assessment_type;
        var job_assigned_to = req.body.job_assigned_to;
        var description = req.body.assessment_description;
        var timer = req.body.assessment_time;

        var userData = req.session.passport.user;
        var user_id = userData.user_id;

        var assessment = new Assessment();
        db.query(assessment.createAssessmentQuery(assessment_name, assessment_type, job_assigned_to,
            description, timer, user_id), (err, data) => {

            if (err) { logger.error(err) } else {
                res.status(200).json({
                    message: "Assessment added.",
                    assessmentId: data.insertId
                });
            }
        });
    } catch (error) {
        logger.log(error);
    }
});

router.get("/get-create-assessment-params", (req, res, next) => {
    try {
        var userData = req.session.passport.user;
        var user_id = userData.user_id;

        db.query(Job.getAllPostedJobsToBeAssigned(user_id), (err, data) => {
            if (!err) {
                var allJobs = data;

                for (var i = 0; i < allJobs.length; i++) {
                    allJobs[i].value = allJobs[i].value.toString();
                }

                db.query(Assessment.getAllAssessmentTypes(), (err, data) => {
                    if (!err) {
                        var allAssessmentTypes = data;

                        res.status(200).json({
                            message: "All Params",
                            assessment_types: allAssessmentTypes,
                            jobs: allJobs
                        });
                    }
                });
            }
        });
    } catch (error) {
        logger.log(error);
    }
});

router.post("/get-edit-assessment-params", (req, res, next) => {
    try {
        var assessment_id = req.body.assessment_id;
        var userData = req.session.passport.user;
        var user_id = userData.user_id;

        db.query(Job.getAllPostedJobsToBeAssigned(user_id), (err, data) => {
            if (!err) {
                var allJobs = data;

                for (var i = 0; i < allJobs.length; i++) {
                    allJobs[i].value = allJobs[i].value.toString();
                }

                db.query(Assessment.getAllAssessmentTypes(), (err, data) => {
                    if (!err) {
                        var allAssessmentTypes = data;

                        db.query(Assessment.getAllAssessmentQuestions(assessment_id), (err, data) => {
                            if (!err) {
                                var allQuestions = data;

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
    } catch (error) {
        logger.log(error);
    }
});

router.get("/get-all-recruiters-assessments", (req, res, next) => {
    try {
        var userData = req.session.passport.user;
        var user_id = userData.user_id;

        db.query(Assessment.getAllAssessmentsByRecruiter(user_id), (err, data) => {
            if (!err) {
                for (var i = 0; i < data.length; i++) {
                    data[i].date_time_ago = helpers.getCurrentTimeAgo(data[i].date_created);
                }

                res.status(200).json({
                    message: "All Assessments",
                    assessments: data
                });
            }
        });
    } catch (error) {
        logger.log(error);
    }
});

router.post("/create-questions", (req, res, next) => {
    try {
        //read user information from request
        var assessment_id = req.body.assessment_id;
        var question_set = JSON.parse(req.body.question_set);

        var userData = req.session.passport.user;
        var user_id = userData.user_id;

        var assessment = new Assessment();

        for (var i = 0; i < question_set.length; i++) {
            var question_no = question_set[i].index;
            var question = question_set[i].question;
            var question_type = question_set[i].question_type;
            var correct_answer = question_set[i].correct_answer;
            var score = question_set[i].score;
            var time_to_answer = question_set[i].time;

            var options = question_set[i].options;
            var option_a = options[0];
            var option_b = options[1];
            var option_c = options[2];
            var option_d = options[3];

            db.query(assessment.createQuestion(assessment_id, question_no, question, question_type, option_a,
                option_b, option_c, option_d, correct_answer, score, time_to_answer, user_id), (err, data) => {
                if (err) { logger.error(err) }
            });
        }

        res.status(200).json({
            message: "Questions added.",
        });
    } catch (error) {
        logger.log(error);
    }
});

router.post("/edit-questions", (req, res, next) => {
    try {
        //read user information from request
        var assessment_id = req.body.assessment_id;
        var question_set = JSON.parse(req.body.question_set);

        var userData = req.session.passport.user;
        var user_id = userData.user_id;

        var assessment = new Assessment();

        var ifCompvared = false;

        for (var i = 0; i < question_set.length; i++) {
            var question_id = question_set[i].question_id;
            var question_no = question_set[i].index;
            var question = question_set[i].question;
            var question_type = question_set[i].question_type;
            var correct_answer = question_set[i].correct_answer;
            var score = question_set[i].score;
            var time_to_answer = question_set[i].time;

            var options = question_set[i].options;
            var option_a = options[0];
            var option_b = options[1];
            var option_c = options[2];
            var option_d = options[3];

            //If a new question has been added, create new question; else edit
            if (typeof question_id == 'undefined') {
                db.query(assessment.createQuestion(assessment_id, question_no, question, question_type, option_a,
                    option_b, option_c, option_d, correct_answer, score, time_to_answer, user_id), (err, data) => {
                    if (!err) {
                        ifCompvared = true;
                    }
                });
            } else {
                db.query(assessment.editQuestion(question_id, question_no, question, question_type, option_a,
                    option_b, option_c, option_d, correct_answer, score, time_to_answer), (err, data) => {
                    if (!err) {
                        ifCompvared = true;
                    }
                });
            }
            logger.log('ifCompvared - ' + ifCompvared)
        }

        res.status(200).json({
            message: "Questions saved successfully.",
            result: true
        });

    } catch (error) {
        logger.log(error);
    }
});

router.post("/edit-assessment-data", (req, res, next) => {
    try {
        //read user information from request

        var assessment_id = req.body.assessment_id;
        var assessment_name = req.body.assessment_name;
        var assessment_type = req.body.assessment_type;
        var job_assigned_to = req.body.job_assigned_to;
        var description = req.body.assessment_description;
        var timer = req.body.assessment_time;

        var assessment = new Assessment();
        db.query(assessment.editAssessmentQuery(assessment_id, assessment_name, assessment_type, job_assigned_to,
            description, timer), (err, data) => {

            if (data) {
                res.status(200).json({
                    message: "Assessment edited.",
                    result: true
                });
            }
        });
    } catch (error) {
        logger.log(error);
    }
});

router.get('/assessment-detail/:assessmentId', function(req, res) {
    try {
        var assessment_id = req.params.assessmentId;
        var userData = req.session.passport.user;

        var assessment = new Assessment();
        db.query(assessment.getAssessmentByAssessmentId(assessment_id), (err, data) => {
            if (err) { logger.log(err) } else {
                var assessmentData = data[0];

                res.render('recruiter_view_assessment', {
                    view: 'assessments',
                    data: userData,
                    assessmentData: assessmentData
                });
            }
        });
    } catch (error) {
        logger.log(error);
    }
});

router.post('/get-all-assessment-candidates', function(req, res) {
    try {
        var assessment_id = req.body.assessment_id;
        var userData = req.session.passport.user;
        var user_id = userData.user_id;

        var assessment = new Assessment();
        db.query(assessment.getAllAssessmentCandidates(assessment_id), (err, data) => {
            if (err) { logger.log(err) } else {
                var allAssessmentCandidates = data;

                var total_score = 0;

                for (var i = 0; i < allAssessmentCandidates.length; i++) {
                    data[i].date_attempted = helpers.formatDateTime(data[i].date_created);

                    total_score += parseInt(data[i].score);
                }

                var average_score = (total_score / allAssessmentCandidates.length)
                average_score = Math.round(average_score * 10) / 10; //Round up to 1 decimal place
                logger.log('average_score - ' + average_score);

                res.status(200).json({
                    message: "All Assessment Candidates",
                    candidates: allAssessmentCandidates,
                    average_score: average_score
                });
            }
        });
    } catch (error) {
        logger.log(error);
    }
});

router.get('/edit-assessment/:assessmentId', function(req, res) {
    try {
        var assessmentId = req.params.assessmentId;
        var userData = req.session.passport.user;

        var assessment = new Assessment();
        db.query(assessment.getAssessmentByAssessmentId(assessmentId), (err, data) => {
            if (!err) {
                var assessmentData = data[0];

                res.render('recruiter_edit_assessment', {
                    view: 'assessments',
                    data: userData,
                    assessmentData: assessmentData
                });
            }
        });
    } catch (error) {
        logger.log(error);
    }
});

router.post("/devare-assessment", (req, res, next) => {
    try {
        var assessment_id = req.body.assessment_id;
        var assessment_name = req.body.assessment_name;

        var userData = req.session.passport.user;
        var user_id = userData.user_id;

        db.query(Assessment.devareAssessmentByIdQuery(assessment_id), (err, data) => {
            if (!err) {
                if (data && data.affectedRows > 0) {

                    helpers.saveActivityTrail(user_id, "Assessment Devared", "You have devared your assessment.");

                    res.status(200).json({
                        message: 'Assessment devared.',
                        affectedRows: data.affectedRows
                    });
                } else {
                    res.status(200).json({
                        message: "Assessment Not found."
                    });
                }
            }
        });
    } catch (error) {
        logger.log(error);
    }
});

router.get('/take-assessment/:assessmentToken', function(req, res) {
    try {
        var assessmentToken = req.params.assessmentToken;

        var assessment = new Assessment();
        db.query(assessment.getAssessmentInfoByToken(assessmentToken), (err, data) => {
            if (err) { logger.error(err) } else {
                var assessmentData = data[0];

                res.redirect('/assessments/assessment-info/' + assessmentData.assessment_id);
            }
        });
    } catch (error) {
        logger.log(error);
    }
});

router.get('/assessment-info/:assessmentId', function(req, res) {
    try {
        var assessmentId = req.params.assessmentId;

        var assessment = new Assessment();
        db.query(assessment.getAssessmentByAssessmentId(assessmentId), (err, data) => {
            if (err) { logger.error(err) } else {
                var assessmentData = data[0];

                res.render('assessment_info_page', {
                    assessmentData: assessmentData
                });
            }
        });
    } catch (error) {
        logger.log(error);
    }
});

router.get('/start-test/:assessmentToken', function(req, res) {
    try {
        var assessmentToken = req.params.assessmentToken;

        if (typeof req.session.passport != 'undefined' || req.session.passport || req.session.passport != null) {
            var userData = req.session.passport.user;

            var assessment = new Assessment();
            db.query(assessment.getAssessmentInfoByToken(assessmentToken), (err, data) => {
                if (err) { logger.error(err) } else {
                    var assessmentData = data[0];

                    res.render('assessment_question_page', {
                        userData: userData,
                        assessmentData: assessmentData
                    });
                }
            });


        } else {
            res.redirect('/login?f=start_test&t=' + assessmentToken);
        }
    } catch (error) {
        logger.log(error);
    }
});

router.post("/get-assessment-questions", (req, res, next) => {
    try {
        var assessment_id = req.body.assessment_id;

        db.query(Assessment.getAllAssessmentQuestions(assessment_id), (err, data) => {
            if (err) { logger.error(err) } else {
                var questionsData = data;

                res.status(200).json({
                    message: "All Questions",
                    questionsData: questionsData
                });
            }
        });
    } catch (error) {
        logger.log(error);
    }
});

module.exports = router;