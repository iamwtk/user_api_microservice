require('dotenv').config()

export default {
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || 'localhost',
    AUTH_SECRET: process.env.AUTH_SECRET || 'some secret string'
}