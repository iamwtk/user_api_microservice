import jwt          from 'express-jwt'
import constants    from '../config/constants'

const getTokenFromHeaders = (req) => {

    const authorization = req.headers.authorization    

    if (authorization && authorization.split(' ')[0] === 'Token') 
        return authorization.split(' ')[1]
    
    return null

}

const auth = {
    required: jwt({
        secret:         constants.AUTH_SECRET,
        userProperty:   'payload',
        getToken:       getTokenFromHeaders,
    }),
    optional: jwt({
        secret:              constants.AUTH_SECRET,
        userProperty:        'payload',
        getToken:            getTokenFromHeaders,
        credentialsRequired: false,
    })   
};

export default auth