import express from 'express'
import bodyParser from 'body-parser'
import constants from './config/constants'

const app = new express()


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


app.use('/api/user', require('./routes/routes.user'))


app.listen(constants.PORT, err => err ? console.error(err) : console.log(`Server is runing on http://${constants.HOST}:${constants.PORT}`))