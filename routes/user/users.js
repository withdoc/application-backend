const express = require('express');
const path = require('path');
const sha256 = require('sha256');
const FabricConfig = require("../../bin/FabricConfig")
const router = express.Router();
const jwt = require('../../utils/jwt-util');
const redisClient = require('../../utils/redis');
const authJwt = require('../../midlewares/authJwt');

const fabric = new FabricConfig();
fabric.setConfig();

router.get('/', async function(req, res, next) {
  
  
  let result = await fabric.contract.evaluateTransaction('GetAllAssets');
  await console.log(fabric.prettyJSONString(result));
  res.send(200);
});

router.post('/signup', async function(req, res, next){
  const { email, password, name, address, sex, nation, birthday } = req.body;
  await fabric.registerNewUser(email).then(async ()=>{
    await fabric.contract.submitTransaction('CreateUser', "", email, sha256(password), name, address, sex, nation, birthday);
  }).catch(err => { throw new Error(`The asset ${email} already exist`); });
  res.send(200);
})

router.post('/signin', async function(req, res, next){
  const { email, password } = req.body;
  const passwordHashedValue = sha256(password)
  const exist = fabric.contract.evaluateTransaction("UserExists", email, passwordHashedValue)
  if (exist) { // id, pw가 맞다면..
    const user = {
      id:email,
      role:"user"
    }
    // access token을 발급합니다.
    
    const accessToken = await jwt.sign(user);
    res.status(200).send({ // client에게 토큰 모두를 반환합니다.
      ok: true,
      data: {
        accessToken,
      },
    });
  } else {
    res.status(401).send({
      ok: false,
      message: 'password is incorrect',
    });
  }
})

router.put('/modify', authJwt, async function(req, res, next){
  const { email, password } = req.body;
  const emailHashedValue = email;
  const passwordHashedValue = sha256(password)
  await fabric.contract.submitTransaction("ModifyPassword", emailHashedValue, passwordHashedValue)
    .then(()=>{res.send(200)})
    .catch(err => {res.send(401)})
})

router.post('/delete', authJwt, async (req,res,next) => {
  const { email, password } = req.body;
  const emailHashedValue = email;
  const passwordHashedValue = sha256(password)
  await fabric.contract.submitTransaction("DeleteUser", emailHashedValue, passwordHashedValue)
    .then(()=>{res.send(200)})
    .catch(err => {res.send(401)})
})

module.exports = router;