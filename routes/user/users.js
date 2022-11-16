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
  await fabric.registerNewUser(sha256(email)).then(async ()=>{
    await fabric.contract.submitTransaction('CreateUser', "", sha256(email), sha256(password), name, address, sex, nation, birthday);
  }).catch(err => { throw new Error(`The asset ${email} already exist`); });
  // 
  
  /* 
    save data in couchdb
  */
  res.send(200);
})

router.post('/signin', async function(req, res, next){
  const { email, password } = req.body;
  const emailHashedValue = sha256(email);
  const passwordHashedValue = sha256(password)
  const exist = fabric.contract.evaluateTransaction("UserExists", emailHashedValue, passwordHashedValue)
  console.log(exist)
  if (exist) { // id, pw가 맞다면..
    const user = {
      id:emailHashedValue,
      role:"user"
    }
    // access token과 refresh token을 발급합니다.
    const accessToken = await jwt.sign(user);
    // const refreshToken = await jwt.refresh();

    // 발급한 refresh token을 redis에 key를 user의 id로 하여 저장합니다.
    // await redisClient.set(user.id, refreshToken);

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

router.put('/modify', authJwt, function(req, res, next){
  const { email, password } = req.body;
  if(true){
    
  }
  res.send(200);
})

router.post('/delete', authJwt, async (req,res,next) => {
  console.log(1111)
  const { email, password } = req.body;
  const emailHashedValue = sha256(email);
  const passwordHashedValue = sha256(password)
  await fabric.contract.submitTransaction("DeleteUser", emailHashedValue, passwordHashedValue)
    .then(()=>{res.send(200)})
    .catch(err => {res.send(401)})
})

module.exports = router;