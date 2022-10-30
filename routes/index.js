var express = require('express');
const path = require('path');
var FabricConfig = require("../bin/FabricConfig")

var router = express.Router();
const fabric = new FabricConfig();

/* GET home page. */
router.get('/', async function(req, res, next) {
  
  res.render('index', { title: 'Express' });
  
});
// router.get('/add', async function(req, res, next){
//   await fabric.setConfig();
//   fabric.contract.submitTransaction("CreateDocument", "visa2", "hpyho33", "my visa", "10231", "2020-01-01", "2022-12-31", "KISA", "visa")
//     .catch(err => console.log(err));
//   res.render('index', { title: 'Express' });
// })

module.exports = router;