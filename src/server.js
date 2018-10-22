import http         from 'http'
import app          from './app'
import constants    from './config/constants'

require('./config/database')

const server = http.createServer(app).listen(constants.PORT, (err) => {
    
    if (err) 
        return console.error(err)

    return console.log('Server up!')    
})


