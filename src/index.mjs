import fs from "fs";
import path from "path";
import doesFileExist from "./does-file-exist.mjs";
import downloadVideoToTmpDirectory from "./download-video-to-tmp-directory.mjs";
import generateThumbnailsFromVideo from "./generate-thumbnails-from-video.mjs";

const THUMBNAILS_TO_CREATE = 2;

export const handler = async (event) => {
	await wipeTmpDirectory();
	const { videoFileName, triggerBucketName } = extractParams(event);
	const tmpVideoPath = await downloadVideoToTmpDirectory(triggerBucketName, videoFileName);

	if (doesFileExist(tmpVideoPath)) {
		await generateThumbnailsFromVideo(tmpVideoPath, THUMBNAILS_TO_CREATE, videoFileName);
	}
};

const extractParams = event => {
	const videoFileName = decodeURIComponent(event.Records[0].s3.object.key).replace(/\+/g, " ");
	const triggerBucketName = event.Records[0].s3.bucket.name;

	return { videoFileName, triggerBucketName };
};

const wipeTmpDirectory = async () => {
	const files = await fs.promises.readdir("/tmp/");
	const filePaths = files.map(file => path.join("/tmp/", file));
	await Promise.all(filePaths.map(file => fs.promises.unlink(file)));
}