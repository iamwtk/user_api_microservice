import express from 'express'
import bodyParser from 'body-parser'

import constants from './config/constants'

const app = new express()
const dev = process.env.NODE_ENV !== 'production'

dev && app.use(require('morgan')('dev'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


require('./config/database')
require('./models/model.user')
require('./config/passport')

app.use('/api/user', require('./routes/routes.user'))

//error handler 
app.use((err, req, res, next) => {
    if (err.isServer) console.error(err)
    if (err.name === 'UnauthorizedError') return res.status(401).json({"error" : err.name + ": " + err.message})
    return res.status(err.output.statusCode).json(err.output.payload)
})


app.listen(constants.PORT, err => err ? console.error(err) : console.log(`Server is runing on http://${constants.HOST}:${constants.PORT}`))