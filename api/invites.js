import express from "express";
import db from "../db/database";
import User from "../models/user";
import logger from './../config/log4js';

const router = express.Router();

router.get("/:inviteToken", (req, res, next) => {
    let inviteToken = req.params.inviteToken;

    db.query(User.getUserByInviteToken(inviteToken), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                logger.log("User id Invited - " + data[0].user_id);
                let user_id = data[0].user_id;

                let user = new User();
                db.query(user.deactivateInviteToken(data[0].user_id), (err, data)=> {
                    if(err){logger.log(err)}
                    else{
                        logger.log("User Invite Token is deactivated");
                        
                        // Redirect to create password page
                        res.redirect('/recruiters/create-password?userId='+user_id);
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


module.exports = router;