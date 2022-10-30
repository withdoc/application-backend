const express = require('express');
const path = require('path');
const sha256 = require('sha256');
const FabricConfig = require("../../bin/FabricConfig")
const router = express.Router();
const fabric = new FabricConfig();

router.get('/', async function(req, res, next) {
  
  await fabric.setConfig();
  let result = await fabric.contract.evaluateTransaction('GetAllAssets');
  await console.log(fabric.prettyJSONString(result));
  res.send(200);
});

router.post('/signup', async function(req, res, next){
    const {userAuthication} = req.body;
    await fabric.registerNewUser(sha256(userAuthication));
    res.send(200);
})

router.post('/add', async function(req, res, next){
    await fabric.setConfig();
    // await fabric.contract.submitTransaction('CreateDocument', '11', '11', '11', '11', '11', '11', '11', '11');
    await fabric.contract.submitTransaction('CreateAsset', 'asset13', 'yellow', '5', 'Tom', '1300');
    res.send(200);
})

router.get('init', async function(req, res, next){

})

module.exports = router;