const fs = require("fs");
const AWS = require("aws-sdk");
const generateTmpFilePath = require("./generate-tmp-file-path");

const tmpVideoPathTemplate = "/tmp/vid-{HASH}.mp4";

module.exports = async (triggerBucketName, videoFileName) => {
	const downloadResult = await getVideoFromS3(triggerBucketName, videoFileName);
	const videoAsBuffer = downloadResult.Body;
	const tmpVideoFilePath = await saveFileToTmpDirectory(videoAsBuffer);

	return tmpVideoFilePath;
}

const getVideoFromS3 = async (triggerBucketName, fileName) => {
	const s3 = new AWS.S3();
	const res = await s3.getObject({
		Bucket: triggerBucketName,
		Key: fileName
	}).promise();

	return res;
};

const saveFileToTmpDirectory = async (fileAsBuffer) => {
    const tmpVideoFilePath = generateTmpFilePath(tmpVideoPathTemplate);
	fs.createWriteStream(tmpVideoFilePath); // try without this; not sure we really need it
	await fs.promises.writeFile(tmpVideoFilePath, fileAsBuffer, "base64");

	return tmpVideoFilePath;
};