const redis = require('redis');

const redisClient = redis.createClient(3002);

module.exports = redisClient