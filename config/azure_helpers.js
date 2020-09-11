var { StorageSharedKeyCredential, BlobServiceClient } = require('@azure/storage-blob');
var { AbortController } = require('@azure/abort-controller');
var fs = require("fs");
var path = require("path");

var logger = require('./log4js');
var config = require('./config');


class AzureHelper {

    async uploadResumeToAzure(files) {

        try {
            var fileName = config.docs_sub_container + config.resumes_folder + files.resume.name;
            var filePath = files.resume.path;

            var credentials = new StorageSharedKeyCredential(config.azure_storage_account_name, config.azure_storage_access_key);

            var blobServiceClient = new BlobServiceClient(`https://${config.azure_storage_account_name}.blob.core.windows.net`, credentials);

            var containerClient = blobServiceClient.getContainerClient(config.azure_storage_container_name);
            // var blobClient = containerClient.getBlobClient(fileName);
            // var blockBlobClient = blobClient.getBlockBlobClient();

            var aborter = AbortController.timeout(30 * config.one_minute);

            //await containerClient.create();
            //console.log(`Container: "${containerName}" is created`);

            //console.log("Containers:");
            //await this.showContainerNames(aborter, blobServiceClient);

            //await blockBlobClient.upload(content, content.length, aborter);
            //console.log(`Blob "${blobName}" is uploaded`);

            //await uploadLocalFile(aborter, containerClient, localFilePath);
            //console.log(`Local file "${localFilePath}" is uploaded`);

            await this.uploadStream(aborter, containerClient, fileName, filePath);
            console.log(`Local file "${filePath}" is uploaded as a stream`);

            //console.log(`Blobs in "${config.azure_storage_container}" container:`);

            //await this.showBlobNames(aborter, containerClient);

            // var downloadResponse = await blockBlobClient.download(0,aborter);
            // var downloadedContent = await streamToString(downloadResponse.readableStreamBody);

            // console.log(`Downloaded blob content: "${downloadedContent}"`);

            //await blockBlobClient.devare(aborter);
            //console.log(`Block blob "${blobName}" is devared`);

            //await containerClient.devare(aborter);
            //console.log(`Container "${containerName}" is devared`);
        } catch (err) {
            logger.log(err);
        }
    }

    async uploadAdditionalFilesToAzure(files) {
        try {
            var fileName = config.docs_sub_container + config.additional_files_folder + files.additional_file.name;
            var filePath = files.additional_file.path;

            var credentials = new StorageSharedKeyCredential(config.azure_storage_account_name, config.azure_storage_access_key);

            var blobServiceClient = new BlobServiceClient(`https://${config.azure_storage_account_name}.blob.core.windows.net`, credentials);

            var containerClient = blobServiceClient.getContainerClient(config.azure_storage_container_name);

            var aborter = AbortController.timeout(30 * config.one_minute);

            await this.uploadStream(aborter, containerClient, fileName, filePath);
            console.log(`Local file "${filePath}" is uploaded as a stream`);
        } catch (err) {
            logger.log(err);
        }
    }

    async uploadProfilePictureToAzure(files) {
        try {
            var fileName = config.images_sub_container + config.profile_pictures_folder + files.profile_picture.name;
            var filePath = files.profile_picture.path;

            var credentials = new StorageSharedKeyCredential(config.azure_storage_account_name, config.azure_storage_access_key);

            var blobServiceClient = new BlobServiceClient(`https://${config.azure_storage_account_name}.blob.core.windows.net`, credentials);

            var containerClient = blobServiceClient.getContainerClient(config.azure_storage_container_name);

            var aborter = AbortController.timeout(30 * config.one_minute);

            await this.uploadStream(aborter, containerClient, fileName, filePath);
            console.log(`Local file "${filePath}" is uploaded as a stream`);
        } catch (err) {
            logger.log(err);
        }
    }

    async uploadCompanyLogoToAzure(files) {
        try {
            var fileName = config.images_sub_container + config.company_logos_folder + files.profile_picture.name;
            var filePath = files.profile_picture.path;

            var credentials = new StorageSharedKeyCredential(config.azure_storage_account_name, config.azure_storage_access_key);

            var blobServiceClient = new BlobServiceClient(`https://${config.azure_storage_account_name}.blob.core.windows.net`, credentials);

            var containerClient = blobServiceClient.getContainerClient(config.azure_storage_container_name);

            var aborter = AbortController.timeout(30 * config.one_minute);

            await this.uploadStream(aborter, containerClient, fileName, filePath);
            console.log(`Local file "${filePath}" is uploaded as a stream`);
        } catch (err) {
            logger.log(err);
        }
    }

    async uploadLocalFile(aborter, containerClient, filePath) {
        try {
            filePath = path.resolve(filePath);

            var fileName = path.basename(filePath);

            var blobClient = containerClient.getBlobClient(fileName);
            var blockBlobClient = blobClient.getBlockBlobClient();

            return await blockBlobClient.uploadFile(filePath, aborter);
        } catch (err) {
            logger.log(err);
        }
    }

    async uploadStream(aborter, containerClient, fileName, filePath) {
        try {
            filePath = path.resolve(filePath);

            var blobClient = containerClient.getBlobClient(fileName);
            var blockBlobClient = blobClient.getBlockBlobClient();

            var stream = fs.createReadStream(filePath, {
                highWaterMark: config.four_megabytes,
            });

            var uploadOptions = {
                bufferSize: config.four_megabytes,
                maxBuffers: 5,
            };

            return await blockBlobClient.uploadStream(
                stream,
                uploadOptions.bufferSize,
                uploadOptions.maxBuffers,
                aborter);
        } catch (err) {
            logger.log(err);
        }
    }

    // [Node.js only] A helper method used to read a Node.js readable stream into string
    async streamToString(readableStream) {
        try {
            return new Promise((resolve, reject) => {
                var chunks = [];
                readableStream.on("data", (data) => {
                    chunks.push(data.toString());
                });
                readableStream.on("end", () => {
                    resolve(chunks.join(""));
                });
                readableStream.on("error", reject);
            });
        } catch (err) {
            logger.log(err);
        }
    }

    async downloadFilesFromAzure(fileURL) {
        try {
            console.log("fileURL : " + fileURL);
            var credentials = new StorageSharedKeyCredential(config.azure_storage_account_name, config.azure_storage_access_key);

            var blobServiceClient = new BlobServiceClient(`https://${config.azure_storage_account_name}.blob.core.windows.net`, credentials);

            var containerClient = blobServiceClient.getContainerClient(config.azure_storage_container_name);

            var aborter = AbortController.timeout(30 * config.one_minute);

            fileURL = "docs/resumes/" + fileURL;

            var blobClient = containerClient.getBlobClient(fileURL);
            var blockBlobClient = blobClient.getBlockBlobClient();

            var downloadResponse = await blockBlobClient.download(0);

            console.log('downloadResponse - ' + downloadResponse);

            //var downloadBlockBlobResponse = await blockBlobClient.download(0);
            console.log('\nDownloaded blob content...');
            console.log('\t', await this.streamToString(downloadResponse.readableStreamBody));

            console.log(`File downloaded`);
        } catch (err) {
            console.log(err);
        }
    }

}

export default AzureHelper;