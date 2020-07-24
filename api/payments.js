import express from "express";
import db from "../db/database";
import Payment from "../models/payment";

const router = express.Router();

router.post("/save-transaction-info", (req, res, next) => {
    let transaction_code = req.body.trxref;
    let amount = req.body.amount;
    let status = req.body.status;
    let user_id = req.body.user_id;
    let payment_plan_id = req.body.payment_plan_id;

    let payment = new Payment();
    db.query(payment.getCompanyIdByUserId(user_id), (err, data) => {
        if(!err){
            let company_id = data[0].company_id;

            db.query(payment.savePaymentTransaction(transaction_code, company_id, user_id, payment_plan_id, 
                amount, status), (err, data) => {
                if(!err){
                    res.status(200).json({
                        message:"Payment Transaction Saved.",
                        transaction_id: data.insertId 
                    });
                }
            });
        }
    });
});


module.exports = router;