var helpers = require('./helpers');
var config = require('./config');
var logger = require('./log4js');

var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./scratch');

var localStore = {

    saveUsersRecommendedJobsByQualification: function(jobs) {
        try {
            localStorage.setItem(config.tag_job_recommendation_by_qualification, jobs)


            logger.log("Recommended Jobs By Qualification Saved!");


            // let allJobs = this.getUsersRecommendedJobs(); 

            /* if(allJobs.length == 0){
                    logger.log("allJobs is 0")
                    localStorage.setItem('recommendedJobs', jobs);
                } else{
                    logger.log("allJobs IS NOT 0")
                    localStorage.setItem('recommendedJobs', (allJobs +jobs));
                } */
        } catch (error) {
            logger.log(error);
        }
    },

    getUsersRecommendedJobsByQualification: function() {
        try {
            let allJobs = localStorage.getItem(config.tag_job_recommendation_by_qualification);

            logger.log("allJobs - " + allJobs);

            //let allJobsArray = helpers.parseJSONToArray(allJobs);


            //logger.log("allJobs - " + allJobs.length)
            //logger.log(allJobsArray)

            return allJobs;
        } catch (error) {
            logger.log(error);
        }
    },

    saveUsersRecommendedJobsByGender: function(jobs) {
        try {
            localStorage.setItem(config.tag_job_recommendation_by_gender, jobs)

            logger.log("Recommended Jobs By Gender Saved!");
        } catch (error) {
            logger.log(error);
        }
    },


    clearLocalStore: function() {
        try {
            if (typeof localStorage === "undefined" || localStorage === null) {
                var LocalStorage = require('node-localstorage').LocalStorage;
                var localStorage = new LocalStorage('./scratch');
            }

            localStorage.clear();
        } catch (error) {
            logger.log(error);
        }
    }
}


module.exports = localStore;