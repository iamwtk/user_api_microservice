import express      from 'express'
import bodyParser   from 'body-parser'

const app = new express()
const dev = process.env.NODE_ENV !== 'production'

dev && app.use(require('morgan')('dev'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


require('./models/model.user')
require('./config/passport')

app.use('/api/user', require('./routes/routes'))


//error handler 
app.use((err, req, res, next) => {

    if (err.isServer) console.error(err)

    if (err.name === 'UnauthorizedError') 
        return res
                .status(401)
                .json({"error" : err.name + ": " + err.message})

    return res
            .status(err.output.statusCode)
            .json({...err.output.payload, data: err.data})
})

export default app