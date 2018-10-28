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


/**
 * Change the password
 * @param {Object}      req express request object
 * @param {Object}      res express response object
 * @param {Function}    next callback function
 */
export const changePassword = async (req, res, next) => {
    try {

        //check if user has assigned superuser role
        const isSuperUser = req.payload.role === 'superuser'

        //if user is superuser update user by id else update current user
        const userId = isSuperUser ? req.body.id : req.payload.id

        const { old_password ,password, password_2 } = req.body
       
        //find user
        const user = await User.findById(userId)

        //if user not found return error
        if(!user)
            return next(boom.notFound('User not found'))

        //if old password not valid return error
        if(!user.validatePassword(old_password))
             return next(boom.unauthorized('Wrong password'))

        //check if both passwords match
        if (password !== password_2)
            return next(boom.unauthorized('Passwords do not match.'))

        //check if password is valid
        if (!Password.validate(password)) {          
            const errorData = Password.validate(password, { list: true })
            return next(boom.notAcceptable('Invalid password.', errorData))
        }
        //set new password
        user.setPassword(password)

        //update user with new password
        await User.findByIdAndUpdate(userId, user)

        //return success message
        res.json({message: 'Password successfully changed.'})


    } catch(err) {
        //return error on any catch       
        return next(boom.badImplementation('Something went wrong', err))
    }    
    
}
