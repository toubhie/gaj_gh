const express = require('express');
const db = require('../db/database');
const Company = require('../models/company');
const uuidv4 = require('uuid/v4');
const logger = require('../config/log4js');

const router = express.Router();

router.get("/", (req, res, next) => {
    try {
        db.query(Company.getAllCompaniesQuery(), (err, data) => {
            if (!err) {
                res.status(200).json({
                    message: "Companies listed.",
                    companyId: data
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
        let company = new Company(uuidv4(), req.body.company_name, req.body.rc_number);

        db.query(company.createCompanyQuery(), (err, data) => {
            res.status(200).json({
                message: "Company added.",
                companyId: data.insertId
            });
        });
    } catch (error) {
        logger.log(error);
    }
});

router.get("/:companyId", (req, res, next) => {
    try {
        let companyId = req.params.companyId;

        db.query(Company.getCompanyByIdQuery(companyId), (err, data) => {
            if (!err) {
                if (data && data.length > 0) {
                    res.status(200).json({
                        message: "Company found.",
                        product: data
                    });
                } else {
                    res.status(200).json({
                        message: "Company Not found."
                    });
                }
            }
        });
    } catch (error) {
        logger.log(error);
    }
});

router.post("/delete", (req, res, next) => {
    try {
        var companyId = req.body.companyId;

        db.query(Company.deleteCompanyByIdQuery(companyId), (err, data) => {
            if (!err) {
                if (data && data.affectedRows > 0) {
                    res.status(200).json({
                        message: `Company deleted with id = ${companyId}.`,
                        affectedRows: data.affectedRows
                    });
                } else {
                    res.status(200).json({
                        message: "Company Not found."
                    });
                }
            }
        });
    } catch (error) {
        logger.log(error);
    }
});

module.exports = router;