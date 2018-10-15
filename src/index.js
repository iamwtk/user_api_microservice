import express from 'express'
import constants from './config/constants'

const app = new express()

app.get('/', (req,res) => {
    res.send('Hello World!')
})


app.listen(constants.PORT, err => err ? console.error(err) : console.log(`Server is runing on http://${constants.HOST}:${constants.PORT}`))