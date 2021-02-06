## Lambda Thumbnail Generation

### 🚀 What is this?

This is the complete source code to accompany the [article here](https://www.norrapscm.com/posts/2021-01-31-generate-thumbnails-using-lambda/).

### ⭐ What does it do?

It takes a video that was uploaded to an S3 bucket and generates *n* number of thumbnails from it.

### 💨 How do I use it?

Create a Lambda and use the files in the `src/` folder. You need to read the article to see how it ties in the AWS infrastructure, but basically:

* Create an S3 bucket
* Create a trigger event to run a Lambda whenever an `.mp4` file is uploaded to that bucket
* That event triggers the Lambda (created from this source code) which uses FFmpeg to generate *n* thumbnails
* Those thumbnails are then uploaded to another S3 bucket

### 🎲 Why would I use this over AWS Transcoder?

You wouldn't, necessarily. AWS Transcoder is good but very expensive compared to doing it yourself in Lambda. I have processed a few hundred short videos using the above source code / technique laid out in the article; the cost has been $0.00. AWS Transcoder costs around $0.45 per 60 minutes of video processed.