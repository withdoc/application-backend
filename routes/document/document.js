const express = require('express');
const path = require('path');
const sha256 = require('sha256');
const FabricConfig = require("../../bin/FabricConfig")
const RandomeHash = require("random-hash")
const authJwt = require('../../midlewares/authJwt');

const router = express.Router();
const fabric = new FabricConfig();

fabric.setConfig();

router.post('/create', authJwt, async (req, res, next) => {
    const { email, password,
        docName, docSerialNum, docPublishedDate, docExpiryDate, docPublishOrg,
        docType, dataType } = req.body;
    const documentId = RandomeHash.generateHash();
    const docDetailId = RandomeHash.generateHash();
    console.log(sha256( email), sha256(password))
    await fabric.contract.submitTransaction('CreateDocument', documentId, docDetailId, sha256(email) , password,
        docName, docSerialNum, docPublishedDate, docExpiryDate, docPublishOrg,docType, dataType)
        .then((documentInfo) => {
            console.log(documentInfo);
            res.send(200)
        })
        .catch(err => { res.send(err) });
    }
)

module.exports = router;