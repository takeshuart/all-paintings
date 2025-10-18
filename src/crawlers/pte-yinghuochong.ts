import axios, { AxiosResponse } from 'axios';
import { downloadFile } from '../utils/https'
import path from 'path';
import fs from 'fs';
import { any } from 'bluebird';

const JSEncrypt = require('node-jsencrypt');

// 用于爬取萤火虫app的题库
const url: string = 'https://api.fireflyau.com/apiWeb/pte/prediction/predictionWeekVideo/getListOne'
//登录后，在request header中获取新的token字段
const token: string = 'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJ5aGMtMjAxOSIsImlhdCI6MTczOTc5MDA2MCwic3ViIjoie1widXNlcklkXCI6XCJlYWUzM2M5NWZhNTEzOWZmMjE0NjMxOWI1OWI1MDI5NlwifSIsImV4cCI6MTc0MDM5NDg2MH0.ML3sdwGxFNfsjZS4UUw57AgKcV_qYBYK6c7m8optTHc';



// RSA 公钥 
//在js代码的return e.headers.s = l(JSON.stringify(t))的l函数中
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC5i3L440bfzeFCMQQNr/hvR0OC
pnMX0Ot0cXzX1PhII88vbR6JFH7FMsGWQAowIRYUe63DNnfXxdtWLxLe2kFKlXdi
fGZDICeR07mXbtRb6ozxvQFa1pxeibvccMR5UloB7yIufwkOT0Sri++3Z/Zz8hZZ
wWevhNnH4IkjE+CnFQIDAQAB
-----END PUBLIC KEY-----`;

fetchWeeklyForecastSST()

//SST 听一分钟左右的音频，然后10分钟写一篇50-70字的总结
async function fetchWeeklyForecastSST() {
    const outputDir = path.join('D:\\雅思&PTE\\PTE考试\\萤火虫资料\\SST周预测\\视频讲解');

    for (let index = 4; index < 77; index++) {
        try {
            const result = await doFetch(index + 1, 'LSST')
            const record = result.records[0]
            let qAudioUrl = record.question
            const questionId = record.qNum
            const videoUrl=record.videoUrl //对vip开放的讲解视频，但是接口中返回了mp4地址
            let answer = String(record.answerInfo).trimEnd()
            const textAndZh = record.answerTranscript//原文+翻译
            const qText = textAndZh.split('\n') //删除包含中文的行
                .filter((line: any) => !/[\u4e00-\u9fa5]/.test(line))
                .filter((line: any) => line.trim() !== '')
                .join(' ');
            const title = record.title
            const answers = answer.split('\n')
            if (answer.length > 0) {
                answer = answers[0] //pick the first answer
            }
            const audioFileName = `${index + 1}.${title}.mp4`
            console.log(`${index + 1}#${questionId}\t${title}\n${qText}\n\n答案：${answer}\n\n\n`)
            if(videoUrl){
                await downloadFile(videoUrl, path.join(outputDir, audioFileName))
            }
            // if (qAudioUrl) {
            //     await downloadFile(qAudioUrl, path.join(outputDir, audioFileName))
            // } else {
            //     console.log(`缺失音频:\t${audioFileName}`)
            // }
            new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            console.error(error)
        }
    }
}
async function fetchWeeklyForecastWFD() {
    const outputDir = path.join('D:\\雅思&PTE\\PTE考试\\萤火虫资料\\SST周预测');

    for (let index = 0; index < 2; index++) {
        try {
            // const index=164
            const result = await doFetch(index + 1, 'LWFD')
            const record = result.records[0]
            let qAudioUrl = record.question ? record.question : record.questionRecord
            if (record.questionAudios) {
                for (const au of record.questionAudios) {
                    if (au.title == '正常难度（女1）') {
                        qAudioUrl = au.audioUrl
                        break
                    }
                }
            }
            const questionId = record.qNum
            const qSentenceType = record.tagSentence //句子结构
            let qText = String(record.answerInfo).trimEnd()
            const qTextZh = record.answerInfo2 //中文翻译
            const qRemark = record.remark ? record.remark : ''
            if (qText.endsWith('.')) {
                qText = qText.slice(0, -1);
            }
            const audioFileName = `${index + 1}.${qText}.mp3`
            console.log(`${index + 1}\t${qText}\t${qSentenceType}\t${qTextZh}\t#${questionId}\t${qRemark}`)
            if (qAudioUrl) {
                await downloadFile(qAudioUrl, path.join(outputDir, audioFileName))
            } else {
                console.log(`缺失音频:\t${audioFileName}`)
            }
            new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            console.error(error)
        }
    }
}


async function doFetch(index: number, questionType: string): Promise<any> {
    try {
        const sValue = getS();
        const response: AxiosResponse = await axios.get(url, {
            params: {
                pageNo: index,
                rank: 7,
                questionType: questionType,//题型LWFD\LSST
            },
            headers: {
                'Token': `${token}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                'Origin': 'https://www.fireflyau.com',
                'Referer': 'https://www.fireflyau.com/',
                'S': sValue
            }
        });

        const code = response.data.code
        if (code != 200) {
            console.error(JSON.stringify(response.data))
        } else {
            const resultBase64: string = response.data.result;
            const decodedResult: string = Buffer.from(resultBase64, 'base64').toString('utf-8');
            const result = JSON.parse(decodedResult);
            return result

        }

    } catch (error) {
        console.error('Error:', error);
    }
}


//====计算签名====

//通过chrome-inspect-Network表格中的Initiator字段定位到发起请求的js代码, 
//鼠标放在Initiator上，会显示倒序的函数调链，
//最下方有个handleClick函数，从这里开始debug，找到设置设置headers中的s字段的代码。
function encryptData(data: string): string {
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(PUBLIC_KEY); // 设置公钥
    return encryptor.encrypt(data) || ''; // 加密数据
}

function getS(): string {
    const t = {
        s: "LSDJ435315WAAS",
        // t:1739790530504
        t: new Date().getTime(),
    };
    const data = JSON.stringify(t);
    const s = encryptData(data);
    return s;
}

//喜马拉雅上传音频文件名不能超过80个单词
//
function shorterAudioFileName() {

    const sourceDir = path.join('D:\\雅思&PTE\\PTE考试\\萤火虫资料\\WFD周预测\\female1');
    const targetDir = 'D:\\雅思&PTE\\PTE考试\\萤火虫资料\\WFD周预测\\shorter name';

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    fs.readdir(sourceDir, (err, files) => {
        if (err) {
            console.error('Error reading source directory:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(sourceDir, file);
            const targetPath = path.join(targetDir, file);

            if (path.extname(file).toLowerCase() === '.mp3' && fs.statSync(filePath).isFile()) {
                let newFileName = file;
                const fileNameWithoutExt = path.basename(file, '.mp3');

                //从后往前删除单词，直到文件名小于70个字符
                if (fileNameWithoutExt.length > 70) {
                    let truncatedName = fileNameWithoutExt;

                    // 截断文件名直到剩余部分长度 + '...' 组合不超过 70 个字符
                    while ((truncatedName + '...').length > 70) {
                        const lastSpaceIndex = truncatedName.lastIndexOf(' ');  // 找到最后一个空格
                        if (lastSpaceIndex === -1) break;

                        truncatedName = truncatedName.slice(0, lastSpaceIndex); // 删除最后一个单词
                    }

                    // 加上 '...'
                    newFileName = truncatedName + '...'.concat('.mp3');
                }

                const newFilePath = path.join(targetDir, newFileName);

                fs.copyFile(filePath, newFilePath, (err) => {
                    if (err) {
                        console.error(`Error moving file ${file}:`, err);
                    } else {
                        console.log(`Moved file: ${file} -> ${newFileName}`);
                    }
                });
            }
        });
    });
}
