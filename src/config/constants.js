require('dotenv').config()

const test = {
    PORT: 8080,
    HOST: 'localhost',
    AUTH_SECRET: 'some secret string'
}

const development = {
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || 'localhost',
    AUTH_SECRET: process.env.AUTH_SECRET || 'some secret string'
}

export default eval(process.env.NODE_ENV)