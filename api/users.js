import express from "express";
import db from "../db/database";
import User from "../models/user";
import uuidv1 from "uuid/v1";

const router = express.Router();

router.get("/", (req, res, next) => {

    db.query(User.getAllUsersQuery(), (err, data)=> {
        if(!err) {
            res.status(200).json({
                message:"Users listed.",
                users:data
            });
        }
    });    
});

router.post("/add", (req, res, next) => {
    //read user information from request
    let user = new User(uuidv1(), req.body.first_name, req.body.last_name, req.body.email, req.body.password);

    db.query(user.createUserQuery(), (err, data)=> {
        res.status(200).json({
            message:"User added.",
            userId: data.insertId
        });
    });
});

router.get("/:userId", (req, res, next) => {
    let userId = req.params.userId;

    db.query(User.getUserByIdQuery(userId), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                
                res.status(200).json({
                    message:"User found.",
                    user: data
                });
            } else {
                res.status(200).json({
                    message:"User Not found."
                });
            }
        } 
    });    
});

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

module.exports = router;