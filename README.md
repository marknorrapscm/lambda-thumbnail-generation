## Lambda Thumbnail Generation

### 🚀 What is this?

This is the complete source code to accompany the article here: <url>

Basically:

* Create an S3 bucket
* Create a trigger event to run a Lambda whenever an `mp4` file is uploaded to that bucket
* That event triggers the Lambda (created from this source code) which uses FFmpeg to generate *n* thumbnails
* Those thumbnails are then uploaded to anotehr S3 bucket

### 💨 How do I use it?

Create a Lambda and use the files in the `src/` folder. You need to read the article to see how it ties in the AWS infrastructure.

### 🎲 Why would I use this over AWS Transcoder?

You wouldn't, necessarily. AWS Transcoder is good but very expensive compared to doing it yourself in Lambda. I have processed a few hundred short videos using the above source code / technique laid out in the article. The cost has been $0.00. Using AWS Transcoder it would have cost me several hundred USD.