var express = require('express');
const path = require('path');
var FabricConfig = require("../bin/FabricConfig")

var router = express.Router();
const fabric = new FabricConfig();

/* GET home page. */
router.get('/', async function(req, res, next) {
  
  await fabric.setConfig();
  fabric.contract.evaluateTransaction('GetAllAssets');
  res.render('index', { title: 'Express' });
//   const aa = new fabricConfig();
});

router.get('/add', async function(req, res, next){
    fabric.contract.submitTransaction("CreateAsset", "asset9", "용달루", "10", "찬호", 500)
    .catch(err => console.log(err));
    res.render('index', { title: 'Express' });
})

module.exports = router;