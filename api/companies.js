import express from "express";
import db from "../db/database";
import Company from "../models/company";
import uuidv4 from "uuid/v4";

const router = express.Router();

router.get("/", (req, res, next) => {

    db.query(Company.getAllCompaniesQuery(), (err, data)=> {
        if(!err) {
            res.status(200).json({
                message:"Companies listed.",
                companyId:data
            });
        }
    });    
});

router.post("/add", (req, res, next) => {
    //read user information from request
    let company = new Company(uuidv4(), req.body.company_name, req.body.rc_number);

    db.query(company.createCompanyQuery(), (err, data)=> {
        res.status(200).json({
            message:"Company added.",
            companyId: data.insertId
        });
    });
});

router.get("/:companyId", (req, res, next) => {
    let companyId = req.params.companyId;

    db.query(Company.getCompanyByIdQuery(companyId), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                res.status(200).json({
                    message:"Company found.",
                    product: data
                });
            } else {
                res.status(200).json({
                    message:"Company Not found."
                });
            }
        } 
    });    
});

router.post("/delete", (req, res, next) => {

    var companyId = req.body.companyId;

    db.query(Company.deleteCompanyByIdQuery(companyId), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {
                res.status(200).json({
                    message:`Company deleted with id = ${companyId}.`,
                    affectedRows: data.affectedRows
                });
            } else {
                res.status(200).json({
                    message:"Company Not found."
                });
            }
        } 
    });   
});

module.exports = router;