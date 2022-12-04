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
    const {travelTitle, guestCnt ,destinationCountry, leaveDate, arriveDate } = req.body;
    const travelId = RandomeHash.generateHash();
    await fabric.contract.submitTransaction('CreateTravel',  travelId, req.id, travelTitle, guestCnt, destinationCountry, leaveDate, arriveDate)
        .then(() => {
            res.send("ok")
        })
        .catch(err => { res.send(err) });
})

router.get('/all', authJwt, async (req, res, next) => {
    await fabric.contract.evaluateTransaction("GetAllTravels", req.id).then(async (travels) => {
        const travelList = JSON.parse(travels);
        res.send(travelList);
    })
    .catch(err => res.send(err))
})

router.get('/', authJwt, async (req, res, next) => {
    const travelId = req.query.travelId;
    
    await fabric.contract.evaluateTransaction("GetSpecificTravel", travelId).then(async (travel) => {
        const travelJson = JSON.parse(travel);
        res.send(travelJson);
    })
    .catch(err => res.send(err))

})

router.delete('/', authJwt, async (req, res, next) => {
    const travelId = req.query.travelId;

    await fabric.contract.submitTransaction("DeleteTravel", travelId)
    .then(()=>{res.send(200)})
    .catch(err => { res.send(err) });
})

router.get('/get-document-status', authJwt, async (req, res, next) => {
    // 추가인증 ?
    const {country} = req.query;
    let results = {};
    for (const countryName of docList[country]) results[countryName] = false;

    await fabric.contract.evaluateTransaction("GetAllDocuments", req.id).then(async (documents) => {
        const documentList = JSON.parse(documents);
        await documentList.map(async (document) => {
            results[document.Record.docType] = true;
        })
    })
    // 근본적 해결 방법 찾을 필요가 있음 (조회할 데이터가 많아지면 타임아웃 시간도 길어져야함)
    res.send(results)
})

module.exports = router;