import dateTime from 'node-datetime';
import config from '../config/config';
import db from '../db/database';

class Payment{

    savePaymentTransaction(transaction_code, company_id, user_id, payment_plan_id, amount, status){
        transaction_code = this.checkifUndefined(transaction_code);
        company_id = this.checkifUndefined(company_id);
        user_id = this.checkifUndefined(user_id);
        payment_plan_id = this.checkifUndefined(payment_plan_id);
        amount = this.checkifUndefined(amount); 
        status = this.checkifUndefined(status); 


        let date_created = this.getCurrentTimeStamp();

        let sql = `INSERT INTO transactions(transaction_code, company_id, user_id, payment_plan_id, amount, status, \
            date_created) VALUES ('${transaction_code}', ${company_id}, ${user_id}, ${payment_plan_id}, '${amount}', \
            '${status}', '${date_created}')`;
 
        return sql;
    }

    getCompanyIdByUserId(user_id){
        let sql = `SELECT company_id FROM company WHERE created_by = ${user_id}`

        return sql;
    }

    checkifUndefined(value){
        if(typeof value === 'undefined'){
             return null;     
        } else{
            return value;
        } 
    }

    getCurrentTimeStamp(){
        let dt = dateTime.create();
        let date_created = dt.format('Y-m-d H:M:S');  

        return date_created;
    }


}

export default Payment;