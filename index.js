require("dotenv").config();

const express = require('express');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
const port = 3000;


// AWS S3 설정
const REGION = 'us-east-1'; // S3 리전
const BUCKET_NAME = 'bucketforcc1214';
const FILE_NAME = 'data/cat-5195431_1280.jpg';

// AWS S3 Client 생성
const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.SECRET_KEY_ID,
        secretAccessKey: process.env.SECRET_KEY_ACCESS,
    },
});

// CPU 부하를 일으키는 함수 (소수 계산)
function calculatePrimes(max) {
    const primes = [];
    for (let i = 2; i <= max; i++) {
        let isPrime = true;
        for (let j = 2; j <= Math.sqrt(i); j++) {
            if (i % j === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) primes.push(i);
    }
    return primes;
}

app.get('/', async (req, res) => {
    try {
        // 서명된 URL 생성
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: FILE_NAME,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 }); // 5분 유효

        // CPU 부하 계산 실행
        console.time("primeCalculation");
        const primes = calculatePrimes(400000); // 예: 5만까지의 소수를 계산 (부하 설정)
        console.timeEnd("primeCalculation");

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
    <h2>CPU 부하 테스트 결과</h2>
    <p>소수 개수: ${primes.length}</p>
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
