import { S3 } from "@aws-sdk/client-s3";
import fs from "fs";
import generateTmpFilePath from "./generate-tmp-file-path.mjs";

export default async (triggerBucketName, videoFileName) => {
	const downloadResult = await getVideoFromS3(triggerBucketName, videoFileName);
	const videoAsBuffer = downloadResult.Body;
	const tmpVideoFilePath = await saveFileToTmpDirectory(videoAsBuffer);

	return tmpVideoFilePath;
}

const getVideoFromS3 = async (triggerBucketName, fileName) => {
	const s3 = new S3();
	const res = await s3.getObject({
		Bucket: triggerBucketName,
		Key: fileName
	});

	return res;
};

const saveFileToTmpDirectory = async (fileAsBuffer) => {
    const tmpVideoPathTemplate = "/tmp/vid-{HASH}.mp4";
    const tmpVideoFilePath = generateTmpFilePath(tmpVideoPathTemplate);
	await fs.promises.writeFile(tmpVideoFilePath, fileAsBuffer, "base64");

	return tmpVideoFilePath;
};