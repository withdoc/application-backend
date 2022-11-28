const express = require('express');
const sha256 = require('sha256');
const FabricConfig = require("../../bin/FabricConfig")
const RandomeHash = require("random-hash")
const authJwt = require('../../midlewares/authJwt');

const router = express.Router();
const fabric = new FabricConfig();

fabric.setConfig();

const setDocDetailAttr = (docType) => {
    if (docType == "VISA") return "visaType";
    else if (docType == "PASSPORT") return "passportSerialNumber";
    else return "driverLicenseSerialNumber";
}

router.post('/', authJwt, async (req, res, next) => {
    const { email, password,
        docName, docSerialNum, docPublishedDate, docExpiryDate, docPublishOrg,
        docType, docDetailSerialNum} = req.body;

    const documentId = RandomeHash.generateHash();
    const docDetailId = RandomeHash.generateHash();
    await fabric.contract.submitTransaction('CreateDocument', documentId, docDetailId, email, sha256(password),
        docName, docSerialNum, docPublishedDate, docExpiryDate, docPublishOrg,docType, "document", docDetailSerialNum)
        .then((documentInfo) => {
            console.log(documentInfo);
            res.send("ok")
        })
        .catch(err => { res.send(err) });
    }
)

router.get('/all', authJwt, async (req, res, next) => {
    // 추가인증 ?
    const email = req.query.email;
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

router.get('/', authJwt, async (req, res, next) => {
    const docId = req.query.docId;
    const document =  JSON.parse(await fabric.contract.evaluateTransaction("GetSpecificDocument", docId));
    const docDetail = JSON.parse(await fabric.contract.evaluateTransaction("GetDocumentDetail", docId))[0];
    for(const key in docDetail.Record){
        if(key != "id" && key != "docId")
            document[key] = docDetail.Record[key];
    }
    res.send(document);
})

router.post('/delete', authJwt, async (req, res, next) => {
    const { docId, email, password } = req.body;

    const passwordHashedValue = sha256(password)
    await fabric.contract.submitTransaction('DeleteDocument', email, passwordHashedValue, docId)
        .then(()=>{res.send(200)})
        .catch(err => { res.send(err) });
    }
)

module.exports = router;