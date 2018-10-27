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

const validation = {
    email: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{8,100}$/g
}

export default eval(process.env.NODE_ENV)