import redis from 'redis'
import session from 'express-session'
import constants from './constants'

const RedisStore = require('connect-redis')(session)
const client = redis.createClient(6379, 'redis')

module.exports = (app) => {
    app.use(session({
        secret: constants.AUTH_SECRET,
        store: new RedisStore({
            host: 'redis',
            port: 6379,
            client: client,
            ttl: 260
        }),
        resave: false,
        saveUninitialized: false
    }))
    client.on('connect', () => console.log('Redis client connected'))
    client.on('error', err => console.error(err))
}


