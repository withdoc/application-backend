const express = require('express');
const path = require('path');
const sha256 = require('sha256');
const FabricConfig = require("../../bin/FabricConfig")
const RandomeHash = require("random-hash")
const authJwt = require('../../midlewares/authJwt');
const { type } = require('os');

const router = express.Router();
const fabric = new FabricConfig();

fabric.setConfig();

const setDocDetailAttr = (docType) => {
    if (docType == "VISA") return "visaType";
    else if (docType == "PASSPORT") return "passportSerialNumber";
    else return "driverLicenseSerialNumber";
}

router.post('/create', authJwt, async (req, res, next) => {
    const { email, password,
        docName, docSerialNum, docPublishedDate, docExpiryDate, docPublishOrg,
        docType, dataType, docDetailSerialNum} = req.body;
    const documentId = RandomeHash.generateHash();
    const docDetailId = RandomeHash.generateHash();
    await fabric.contract.submitTransaction('CreateDocument', documentId, docDetailId, email, password,
        docName, docSerialNum, docPublishedDate, docExpiryDate, docPublishOrg,docType, dataType, docDetailSerialNum)
        .then((documentInfo) => {
            console.log(documentInfo);
            res.send(200)
        })
        .catch(err => { res.send(err) });
    }
)

router.post('/getAllDocument', authJwt, async (req, res, next) => {
    // 추가인증 ?
    const {email} = req.body;
    let results = [];
    await fabric.contract.evaluateTransaction("GetAllDocuments", email).then(async (documents) => {
        const documentList = JSON.parse(documents);
        await documentList.map(async (document) => {
            await fabric.contract.evaluateTransaction("GetDocumentDetail", document.Key)
            .then(docDetails => {
                const docDetail = JSON.parse(docDetails);
                const typeName = setDocDetailAttr(document.Record.docType);
                document.Record[typeName] = docDetail[0].Record[typeName]
                results.push(document);
            })
        })
    })
    // 근본적 해결 방법 찾을 필요가 있음 (조회할 데이터가 많아지면 타임아웃 시간도 길어져야함)
    setTimeout(()=>res.send(results), 100);
})



module.exports = router;