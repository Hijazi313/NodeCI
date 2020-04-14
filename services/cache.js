const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');

    return this;
}

mongoose.Query.prototype.exec = async function () {
    try {

        if (!this.useCache) {
            return exec.apply(this, arguments);
        }
        const key = JSON.stringify(Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        }));


        // See if we have a value for key in radis
        const cachedValue = await client.hget(this.hashKey, key)

        // if we do, return that 
        if (cachedValue) {

            const doc = JSON.parse(cachedValue);
            return Array.isArray(doc)
                ? doc.map(d => new this.model(d))
                : new this.model(doc);
        }


        // Otherwise, issue the query and store the result in radis
        const result = await exec.apply(this, arguments);
        // turn the result into JSON format to store in redis server
        client.hmset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
        return result

    }
    catch (err) {
        console.log(err);
    }


}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}