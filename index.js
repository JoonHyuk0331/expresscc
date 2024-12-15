const express = require('express');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
const port = 3000;
require("dotenv").config();
console.log("accessKeyId:", process.env.SECRET_KEY_ID);
console.log("secretAccessKey:", process.env.SECRET_KEY_ACCESS);

// AWS S3 설정
const REGION = 'us-east-1'; // S3 리전
const BUCKET_NAME = 'bucketforcc1214';
const FILE_NAME = 'data/cat-5195431_1280.jpg';

//AWS S3 Client 생성
const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.SECRET_KEY_ID,
        secretAccessKey: process.env.SECRET_KEY_ACCESS,
    },
});

app.get('/', async (req, res) => {
    try {
        // 서명된 URL 생성
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: FILE_NAME,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 }); // 5분 유효

        // 이미지를 포함한 HTML 응답
        const htmlResponse = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
</head>
<body>
    <h1>S3에서 로드된 이미지</h1>
    <img src="${url}" alt="S3에서 로드된 이미지" style="max-width:500px;">
</body>
</html>
        `;

        res.send(htmlResponse);
    } catch (err) {
        console.error('Error generating signed URL:', err);
        res.status(500).send('Error generating signed URL');
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});
