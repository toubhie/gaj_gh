import config from '../config/config';
import helper from '../config/helpers';

class Assessment{
    constructor(){
    }

    static getAllAssessmentsQuery(){
        let sql = `SELECT * FROM assessment ORDER BY date_created DESC`;

        return sql;
    }

    createAssessmentQuery(assessment_name, assessment_type, job_assigned_to, description, timer, user_id){
        assessment_name = helper.escapeString(assessment_name); 
        assessment_name = helper.checkifUndefined(assessment_name);

        assessment_type = helper.checkifUndefined(assessment_type);
        job_assigned_to = helper.checkifUndefined(job_assigned_to);
        
        description = helper.escapeString(description); 
        description = helper.checkifUndefined(description);
        
        timer = helper.checkifUndefined(timer);

        let assessment_token = helper.generateToken10();

        let date_created = helper.getCurrentTimeStamp();

        let sql = `INSERT INTO assessment(assessment_token, assessment_name, assessment_type, \
                job_assigned_to, assessment_description, time, date_created, created_by, \
                is_deleted) VALUES ('${assessment_token}', '${assessment_name}', '${assessment_type}', \
                ${job_assigned_to}, '${description}', '${timer}', '${date_created}', \
                ${user_id}, ${config.false})`;

        return sql;
    }

    editAssessmentQuery(assessment_id, assessment_name, assessment_type, job_assigned_to, description, timer){
        assessment_name = helper.escapeString(assessment_name); 
        assessment_name = helper.checkifUndefined(assessment_name);

        assessment_type = helper.checkifUndefined(assessment_type);
        job_assigned_to = helper.checkifUndefined(job_assigned_to);
        
        description = helper.escapeString(description); 
        description = helper.checkifUndefined(description);

        timer = helper.checkifUndefined(timer);

        let date_updated = helper.getCurrentTimeStamp();

        let sql = `UPDATE assessment SET assessment_name='${assessment_name}',assessment_type=${assessment_type}, \
                job_assigned_to=${job_assigned_to}, assessment_description='${description}', time='${timer}', \
                date_updated='${date_updated}' WHERE assessment_id = ${assessment_id}`;

        return sql;
    }

    static getAllAssessmentTypes(){
        let sql = `SELECT * FROM assessment_type`;

        return sql;
    }

    createQuestion(assessment_id, question_no, question, question_type, option_a, option_b, option_c, option_d, 
        correct_answer, score, time_to_answer, user_id){

        question = helper.escapeString(question); 
        question = helper.checkifUndefined(question);
    
        option_a = helper.escapeString(option_a);
        option_a = helper.checkifUndefined(option_a);
            
        option_b = helper.escapeString(option_b); 
        option_b = helper.checkifUndefined(option_b);

        option_c = helper.escapeString(option_c); 
        option_c = helper.checkifUndefined(option_c);

        option_d = helper.escapeString(option_d); 
        option_d = helper.checkifUndefined(option_d);

        correct_answer = helper.escapeString(correct_answer); 
        correct_answer = helper.checkifUndefined(correct_answer);

        let date_created = helper.getCurrentTimeStamp();    
        
        let sql = `INSERT INTO questions(job_assessment_id, question_type, question_no, questions, \
            possible_answera, possible_answerb, possible_answerc, possible_answerd, correct_answer, \
            score, time_to_answer, date_created, created_by, is_deleted) VALUES (${assessment_id}, ${question_type}, \
            '${question_no}', '${question}', '${option_a}', '${option_b}', '${option_c}', '${option_d}', \
            '${correct_answer}', '${score}', '${time_to_answer}', '${date_created}', ${user_id}, \
            '${config.false}')`;

        return sql;
    }

    editQuestion(question_id, question_no, question, question_type, option_a, option_b, option_c, 
        option_d, correct_answer, score, time_to_answer){

        question = helper.escapeString(question); 
        question = helper.checkifUndefined(question);
        
        option_a = helper.escapeString(option_a);
        option_a = helper.checkifUndefined(option_a);
                
        option_b = helper.escapeString(option_b); 
        option_b = helper.checkifUndefined(option_b);
    
        option_c = helper.escapeString(option_c); 
        option_c = helper.checkifUndefined(option_c);
    
        option_d = helper.escapeString(option_d); 
        option_d = helper.checkifUndefined(option_d);
    
        correct_answer = helper.escapeString(correct_answer); 
        correct_answer = helper.checkifUndefined(correct_answer);

        let date_updated = helper.getCurrentTimeStamp();    

        let sql = `UPDATE questions SET question_type=${question_type}, question_no='${question_no}', \
                questions='${question}', possible_answera='${option_a}', possible_answerb='${option_b}', \
                possible_answerc='${option_c}', possible_answerd='${option_d}', correct_answer='${correct_answer}', \
                score=${score}, time_to_answer=${time_to_answer}, date_updated='${date_updated}' WHERE \
                question_id = ${question_id}`;

        return sql;
    }

    static deleteAssessmentByIdQuery(assessment_id) {
        let sql = `UPDATE assessment SET is_deleted = '${config.true}' WHERE assessment_id = ${assessment_id}`;
        return sql;           
    }

    static getAllAssessmentsByRecruiter(user_id){
        let sql = `SELECT a.*, atp.assessment_type_name, \
            (SELECT COUNT(*) FROM questions q WHERE q.job_assessment_id = a.assessment_id) AS questions_count, \
            (SELECT j.job_name FROM job j WHERE j.job_id = a.job_assigned_to) AS name_of_job \
            FROM assessment a \
            INNER JOIN assessment_type atp ON a.assessment_type = atp.assessment_type_id \
            WHERE a.created_by = ${user_id} AND a.is_deleted = ${config.false} \
            ORDER BY a.date_created DESC`;

        return sql;
    }

    getCountOfRecruiterAssessmentsCreated(user_id){
        let sql = `SELECT COUNT(*) AS count FROM assessment WHERE created_by = ${user_id} AND \
                is_deleted = ${config.false}`;

        return sql;
    }

    getAssessmentByAssessmentId(assessment_id){
        let sql = `SELECT a.*, j.job_name, ast.assessment_type_name FROM assessment a \
                INNER JOIN job j ON a.job_assigned_to = j.job_id \
                INNER JOIN assessment_type ast ON a.assessment_type = ast.assessment_type_id \
                WHERE a.assessment_id = ${assessment_id}`;

        return sql;
    }

    getAllAssessmentCandidates(assessment_id){
        let sql = `SELECT u.user_id, u.first_name, u.last_name, u.phone_number, u.photo_url, \
                ar.score, ar.grade, ar.time_spent, ar.date_created FROM assessment_result ar \
                INNER JOIN user u ON ar.candidate_id = u.user_id \
                WHERE ar.assessment_id = ${assessment_id}`;

        return sql;
    }

    static getAllAssessmentQuestions(assessment_id){
        let sql = `SELECT * FROM questions WHERE job_assessment_id = ${assessment_id} \
                AND is_deleted = ${config.false}`;

        return sql;
    }

    getAssessmentInfoByToken(token){
        let sql = `SELECT * FROM assessment WHERE assessment_token = '${token}'`;

        return sql;
    }
}
 
export default Assessment;