const AWS = require("aws-sdk");
const fs = require("fs");
const { spawnSync } = require("child_process");
const doesFileExist = require("./does-file-exist");
const generateTmpFilePath = require("./generate-tmp-file-path");

const ffprobePath = "/opt/bin/ffprobe";
const ffmpegPath = "/opt/bin/ffmpeg";

const THUMBNAIL_TARGET_BUCKET = "demo-thumbnail-bucket";

module.exports = async (tmpVideoPath, numberOfThumbnailsToCreate, videoFileName) => {
    const durationInSeconds = getVideoDuration(tmpVideoPath);
    const randomTimes = generateRandomTimes(durationInSeconds, numberOfThumbnailsToCreate);

    for (let i = 0; i < randomTimes.length; i++) {
        const time = randomTimes[i];
        const nameOfImageToCreate = generateNameOfImageToUpload(videoFileName, i);
        const tmpThumbnailPath = await createImageInTmpDirectory(tmpVideoPath, time);

        if (doesFileExist(tmpThumbnailPath)) {
            await uploadFileToS3(tmpThumbnailPath, nameOfImageToCreate);
        }
    }
}

const getVideoDuration = (tmpVideoPath) => {
    const ffprobe = spawnSync(ffprobePath, [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=nw=1:nk=1",
        tmpVideoPath
    ]);

    return Math.floor(ffprobe.stdout.toString());
};

const generateRandomTimes = (videoDuration, numberOfTimesToGenerate) => {
    const timesInSeconds = [];

    const getRandomNumber = () => {
        return Math.floor(Math.random() * videoDuration);
    };

    for (let x = 0; x < numberOfTimesToGenerate; x++) {
        for (let attemptNumber = 0; attemptNumber < 3; attemptNumber++) {
            const randomNum = getRandomNumber();
            if (!timesInSeconds.includes(randomNum)) {
                timesInSeconds.push(randomNum);
                break;
            }
        }
    }

    return timesInSeconds;
};

const createImageInTmpDirectory = (tmpVideoPath, targetSecond) => {
    const tmpThumbnailPath = generateThumbnailPath(targetSecond);
    const ffmpegParams = createFfmpegParams(tmpVideoPath, tmpThumbnailPath, targetSecond);
    spawnSync(ffmpegPath, ffmpegParams);

    return tmpThumbnailPath;
};

const generateThumbnailPath = (targetSecond) => {
    const tmpThumbnailPathTemplate = "/tmp/thumbnail-{HASH}-{num}.jpg";
    const uniqueThumbnailPath = generateTmpFilePath(tmpThumbnailPathTemplate);
    const thumbnailPathWithNumber = uniqueThumbnailPath.replace("{num}", targetSecond);

    return thumbnailPathWithNumber;
};

const createFfmpegParams = (tmpVideoPath, tmpThumbnailPath, targetSecond) => {
    return [
        "-i", tmpVideoPath,
        "-ss", targetSecond,
        "-vf", "thumbnail,scale=80:140",
        "-vframes", 1,
        tmpThumbnailPath
    ];
};

const generateNameOfImageToUpload = (videoFileName, i) => {
    const strippedExtension = videoFileName.replace(".mp4", "");
    return `${strippedExtension}-${i}.jpg`;
};

const uploadFileToS3 = async (tmpThumbnailPath, nameOfImageToCreate) => {
    const contents = fs.createReadStream(tmpThumbnailPath);
    const uploadParams = {
        Bucket: THUMBNAIL_TARGET_BUCKET,
        Key: nameOfImageToCreate,
        Body: contents,
        ContentType: "image/jpg",
        ACL: "public-read"
    };

    const s3 = new AWS.S3();
    await s3.putObject(uploadParams).promise();
};