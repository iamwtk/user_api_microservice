/**
 *  Authentication Controller
 * @module controllers/controller.auth 
 */


import passport     from 'passport'                 //authentication module
import boom         from 'boom'                     //error handler
import User         from '../models/model.user'     //user mongoose model
import Password     from '../config/password-validator' //password validator




/**
 * Creates user in database and returns auth data
 * @param {Object}      req express request object
 * @param {Object}      res express response object
 * @param {Function}    next callback function
 */
export const signup = async (req, res, next) => {
    try {

        //if user object is missing return error
        if (!req.body.user) 
            return next(boom.unauthorized('No user data received.'))        
        
        //get user data    
        const user                                      = req.body.user,
        { auth: { local: { password, password_2 } } }   = user        
        
        //check if both passwords match
        if (password !== password_2)
            return next(boom.unauthorized('Passwords do not match.'))

        //check if password is valid
        if (!Password.validate(password)) {          
            const errorData = Password.validate(password, { list: true })
            return next(boom.notAcceptable('Invalid password.', errorData))
        }
        //creates new mongo user
        const UserData = new User(user)
        
        //sets user password hash   
        UserData.setPassword(password)

        //saves user to database
        await UserData.save()        

        //returns new users authorization data
        return res.json({ user: UserData.toAuthJSON() })

    } catch(err) {
        
        //if mongo validation error return callback with error       
        if(err.name === 'ValidationError') {
            return next(boom.unauthorized(err.message))
        }
        // all other server errors           
        return next(boom.badImplementation('Something went wrong', err))
    }
    
}

/**
 * Authenticates user in passport and returns wuth token
 * @param {Object}      req express request object
 * @param {Object}      res express response object
 * @param {Function}    next callback function
 */
export const login = (req, res, next) => {    
    passport.authenticate('local', { session: false }, (err, user) => {

        if (err) 
            return next(boom.unauthorized(err))

        if (user) {            
            user.auth.local.token = user.generateJWT()
            return res.json({ user: user.toAuthJSON() })
            
        }        
    })(req, res, next)
}