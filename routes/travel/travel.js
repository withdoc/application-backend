const express = require('express');
const sha256 = require('sha256');
const FabricConfig = require("../../bin/FabricConfig")
const RandomeHash = require("random-hash")
const authJwt = require('../../midlewares/authJwt');
const docList = require('../../utils/docList.json')

const router = express.Router();
const fabric = new FabricConfig();

fabric.setConfig();

router.post('/', authJwt, async (req, res, next) => {
    const { email, travelTitle, destinationCountry, leaveDate, arriveDate } = req.body;

    await fabric.contract.evaluateTransaction("GetAllDocuments", email).then(async (documents) => {
        const documentList = JSON.parse(documents);
        await documentList.map(async (document) => {
            console.log(document);
        })
    })
    // 근본적 해결 방법 찾을 필요가 있음 (조회할 데이터가 많아지면 타임아웃 시간도 길어져야함)
    setTimeout(()=>res.send(results), 100);
})

router.get('/get-document-status', authJwt, async (req, res, next) => {
    // 추가인증 ?
    const {email, country} = req.query;
    let results = {};
    for (const countryName of docList[country]) results[countryName] = false;

    await fabric.contract.evaluateTransaction("GetAllDocuments", email).then(async (documents) => {
        const documentList = JSON.parse(documents);
        await documentList.map(async (document) => {
            results[document.Record.docType] = true;
        })
    })
    // 근본적 해결 방법 찾을 필요가 있음 (조회할 데이터가 많아지면 타임아웃 시간도 길어져야함)
    res.send(results)
})

module.exports = router;