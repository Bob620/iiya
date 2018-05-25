const {promisify} = require('util');

const client = require('redis').createClient();

module.exports = {
	get: promisify(client.get).bind(client),
	set: promisify(client.set).bind(client),
	del: promisify(client.del).bind(client),
	h: {
		getall: promisify(client.hgetall).bind(client),
		set: promisify(client.hset).bind(client),
		del: promisify(client.hdel).bind(client)
	},
	hm: {
		set: promisify(client.hmset).bind(client),
		get: promisify(client.hmget).bind(client)
	},
	s: {
		members: promisify(client.smembers).bind(client),
		add: promisify(client.sadd).bind(client),
		rem: promisify(client.srem).bind(client),
		ismember: promisify(client.sismember).bind(client)
	}
};
