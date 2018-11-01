import http         from 'http'
import app          from './app'
import constants    from './config/constants'

require('./config/database')

const server = http.createServer(app).listen(constants.PORT, (err) => {
    
    if (err) {
        console.error(err)
        return process.exit(1)
    }

    return console.log('Server up!')    
})


