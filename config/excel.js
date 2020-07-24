import excelLib from 'excel4node';
import logger from './log4js';
import fs from 'fs';

let excel = {
    createAllApplicantsWorkbook : function(res, job_id, jobName, applicants_list){
        try{
            let workbook = new excelLib.Workbook();
            let worksheet = workbook.addWorksheet('Sheet 1');
            worksheet.column(1).setWidth(4.38);
            worksheet.column(2).setWidth(43.13);
            worksheet.column(3).setWidth(43.13);
            worksheet.column(4).setWidth(15.63);
            worksheet.column(5).setWidth(12);
            worksheet.column(6).setWidth(55.63);

            let fileName = "all_applicants_for_" + jobName + ".xlsx";

            let headerStyle = workbook.createStyle({
                font: {
                    color: '#FFFFFF',
                    size: 12,
                    bold: true
                },
                fill: {
                    type: 'pattern', // the only one implemented so far.
                    patternType: 'solid', // most common.
                    fgColor: '#06942A',
                },
            });


            worksheet.cell(1, 1, 1, 6, true).string('All Applicants for ' + jobName + ' job role').style(headerStyle);

            worksheet.cell(2, 1).string('S/N').style(headerStyle);
            worksheet.cell(2, 2).string('Name').style(headerStyle);
            worksheet.cell(2, 3).string('Email').style(headerStyle);
            worksheet.cell(2, 4).string('Phone Number').style(headerStyle);
            worksheet.cell(2, 5).string('Date Applied').style(headerStyle);
            worksheet.cell(2, 6).string('Link to profile').style(headerStyle);

            for(let i = 0; i < applicants_list.length; i++){
                worksheet.cell(i+3, 1).number(i+1);

                let fullName = applicants_list[i].first_name + ' ' + applicants_list[i].last_name;
                worksheet.cell(i+3, 2).string(fullName);

                worksheet.cell(i+3, 3).string(applicants_list[i].email);
                worksheet.cell(i+3, 4).string(applicants_list[i].phone_number);
                worksheet.cell(i+3, 5).string(applicants_list[i].date_applied);

                let gaj_profile_link = 'www.getajobgh.com/recruiters/candidate-info/'
                    + applicants_list[i].user_id + '/?l=' + job_id;

                worksheet.cell(i+3, 6).string(gaj_profile_link);
            }

            let filePath = 'assets/temp/' + fileName;

            workbook.write(filePath, function(err, stat){
                if(err){logger.log(err)}
                else{
                    res.download(filePath, function(err, result){
                        if(!err){
                            logger.log("file downloaded");
                            try {
                                fs.unlinkSync(filePath)
                                //file removed from temp dir
                            } catch(err) {
                                console.error(err)
                            };
                        }
                    });
                }
            });

        } catch(err){
            logger.log(err);
        }
    },

    createAllShortlistedApplicantsWorkbook : function(res, job_id, jobName, applicants_list){
        try{
            let workbook = new excelLib.Workbook();
            let worksheet = workbook.addWorksheet('Sheet 1');
            worksheet.column(1).setWidth(4.38);
            worksheet.column(2).setWidth(43.13);
            worksheet.column(3).setWidth(43.13);
            worksheet.column(4).setWidth(15.63);
            worksheet.column(5).setWidth(12);
            worksheet.column(6).setWidth(55.63);

            let fileName = jobName + "_shortlisted_candidates.xlsx";

            let headerStyle = workbook.createStyle({
                font: {
                    color: '#FFFFFF',
                    size: 12,
                    bold: true
                },
                fill: {
                    type: 'pattern', // the only one implemented so far.
                    patternType: 'solid', // most common.
                    fgColor: '#06942A',
                },
            });

            worksheet.cell(1, 1, 1, 6, true).string('All Shortlisted Applicants for ' + jobName + ' job role').style(headerStyle);

            worksheet.cell(2, 1).string('S/N').style(headerStyle);
            worksheet.cell(2, 2).string('Name').style(headerStyle);
            worksheet.cell(2, 3).string('Email').style(headerStyle);
            worksheet.cell(2, 4).string('Phone Number').style(headerStyle);
            worksheet.cell(2, 5).string('Date Applied').style(headerStyle);
            worksheet.cell(2, 6).string('Link to Profile').style(headerStyle);

            for(let i = 0; i < applicants_list.length; i++){
                worksheet.cell(i+3, 1).number(i+1);

                let fullName = applicants_list[i].first_name + ' ' + applicants_list[i].last_name;
                worksheet.cell(i+3, 2).string(fullName);

                worksheet.cell(i+3, 3).string(applicants_list[i].email);
                worksheet.cell(i+3, 4).string(applicants_list[i].phone_number);
                worksheet.cell(i+3, 5).string(applicants_list[i].date_applied);

                let gaj_profile_link = 'www.getajobgh.com/recruiters/candidate-info/'
                    + applicants_list[i].user_id + '/?l=' + job_id;

                worksheet.cell(i+3, 6).string(gaj_profile_link);
            }

            //res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheet');

            let filePath = 'assets/temp/' + fileName;

            workbook.write(filePath, function(err, stat){
                if(err){logger.log(err)}
                else{
                    res.download(filePath, function(err, result){
                        if(!err){
                            logger.log("file downloaded");
                            try {
                                fs.unlinkSync(filePath)
                                //file removed from temp dir
                            } catch(err) {
                                console.error(err)
                            };
                        }
                    });
                }
            });
        } catch(err){
            logger.log(err);
        }
    },

    createAllNonShortlistedApplicantsWorkbook : function(res, job_id, jobName, applicants_list){
        try{
            let workbook = new excelLib.Workbook();
            let worksheet = workbook.addWorksheet('Sheet 1');
            worksheet.column(1).setWidth(4.38);
            worksheet.column(2).setWidth(43.13);
            worksheet.column(3).setWidth(43.13);
            worksheet.column(4).setWidth(15.63);
            worksheet.column(5).setWidth(12);
            worksheet.column(6).setWidth(55.63);

            let fileName = jobName + "_non_shortlisted_candidates.xlsx";

            let headerStyle = workbook.createStyle({
                font: {
                    color: '#FFFFFF',
                    size: 12,
                    bold: true
                },
                fill: {
                    type: 'pattern', // the only one implemented so far.
                    patternType: 'solid', // most common.
                    fgColor: '#06942A',
                },
            });

            worksheet.cell(1, 1, 1, 6, true).string('All Non-Shortlisted Applicants for ' + jobName + ' job role').style(headerStyle);

            worksheet.cell(2, 1).string('S/N').style(headerStyle);
            worksheet.cell(2, 2).string('Name').style(headerStyle);
            worksheet.cell(2, 3).string('Email').style(headerStyle);
            worksheet.cell(2, 4).string('Phone Number').style(headerStyle);
            worksheet.cell(2, 5).string('Date Applied').style(headerStyle);
            worksheet.cell(2, 6).string('Link to Profile').style(headerStyle);

            for(let i = 0; i < applicants_list.length; i++){
                worksheet.cell(i+3, 1).number(i+1);

                let fullName = applicants_list[i].first_name + ' ' + applicants_list[i].last_name;
                worksheet.cell(i+3, 2).string(fullName);

                worksheet.cell(i+3, 3).string(applicants_list[i].email);
                worksheet.cell(i+3, 4).string(applicants_list[i].phone_number);
                worksheet.cell(i+3, 5).string(applicants_list[i].date_applied);

                let gaj_profile_link = 'www.getajobgh.com/recruiters/candidate-info/'
                    + applicants_list[i].user_id + '/?l=' + job_id;

                worksheet.cell(i+3, 6).string(gaj_profile_link);
            }

            //res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheet');

            let filePath = 'assets/temp/' + fileName;

            workbook.write(filePath, function(err, stat){
                if(err){logger.log(err)}
                else{
                    res.download(filePath, function(err, result){
                        if(!err){
                            logger.log("file downloaded");
                            try {
                                fs.unlinkSync(filePath)
                                //file removed from temp dir
                            } catch(err) {
                                console.error(err)
                            };
                        }
                    });
                }
            });
        } catch(err){
            logger.log(err);
        }
    }
}

module.exports = excel;