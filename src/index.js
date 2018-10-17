import express from 'express'
import bodyParser from 'body-parser'

import constants from './config/constants'

const app = new express()
const dev = process.env.NODE_ENV !== 'production'

dev && app.use(require('morgan')('dev'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

require('./config/redis')(app)
require('./config/database')
require('./models/model_user')
require('./config/passport')

app.use('/api/user', require('./routes/routes.user'))

//UnauthorizedError handler
app.use((err, req, res, next) => err.name === 'UnauthorizedError' &&  res.status(401).json({"error" : err.name + ": " + err.message}))


app.listen(constants.PORT, err => err ? console.error(err) : console.log(`Server is runing on http://${constants.HOST}:${constants.PORT}`))