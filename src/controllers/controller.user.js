/**
 *  User Controller
 * @module controllers/controller.user 
 */

import boom         from 'boom'                     //error handler
import User         from '../models/model.user'     //user mongoose model

/**
 * Returns single user from database by user id
 * @param {Object}      req express request object
 * @param {Object}      res express response object
 * @param {Function}    next callback function
 */
export const getSingle = async (req, res, next) => {
        
    try {
        //get user id 
        const id = (req.payload && req.payload.id) ? req.payload.id : null

        //if no id call error handler as callback
        if (!id)
            return next(boom.unauthorized('You are not supposed to call this function'))
        //call database with user id
        const user = await User.findById(id, '-auth')

        //if user found return user object as JSON
        if (user) 
            return res.json({ user })

        //if user not found call error handler as callback
        return next(boom.notFound('User not found'))

    } catch (err) {

        //if any error call error handler as callback        
        return next(boom.badImplementation('Something went wrong', err))
    }
}

/**
 * Gets all users from database - should be called only by superuser
 * @param {Object}      req express request object
 * @param {Object}      res express response object
 * @param {Function}    next callback function
 */
export const getAll = async (req, res, next) => {
    try {

        //get users from database
        const users = await User.find({}, '-auth')

        //if returned any users return array as response
        if (users.length > 0)        
            return res.json(users)

        //return error in callback if no users found
        return next(boom.notFound('No users found.'))

    } catch(err) { 
        
        //return error on any catch       
        return next(boom.badImplementation('Something went wrong', err))
    }    
} 

/**
 * Deletes user from database - should be called only by superuser
 * @param {Object}      req express request object
 * @param {Object}      res express response object
 * @param {Function}    next callback function
 */
export const deleteUser = async (req, res, next) => {
    try {
        //get user id 
        const id = (req.body && req.body.id) ? req.body.id : null

        //if no id call error handler as callback
        if (!id)
            return next(boom.notAcceptable('User id is missing.'))

        //remove user by id
        const user = await User.findByIdAndRemove(id)

        //if returned removed user return success message
        if (user) 
            return res.json({message: 'User deleted.'})

        //return error in callback
        return next(boom.notFound('User not found.'))

    } catch (err) {

        //if catches error return 500
        return next(boom.badImplementation('Something went wrong', err))
    }
}


/**
 * Updates user in database - role can be updated only by superuser
 * @param {Object}      req express request object
 * @param {Object}      res express response object
 * @param {Function}    next callback function
 */
export const updateUser = async (req, res, next) => {
    try {

        //check if user has assigned admin role
        const isSuperUser   = req.payload.role === 'superuser'        

        //if user is super admin update user by id else update current user
        const userId        =  isSuperUser ? req.body.user.id : req.payload.id

        //get user data and if user is not admin delete role - can be updated only by admin
        const userData      = {...req.body.user}
        if (!isSuperUser)
            delete userData.role     

        //update user by id with new userdata
        const user = await User.findByIdAndUpdate(userId, userData)

        //if updated return success message
        if (user) 
            return res.json({message: 'User updated'})

        //return error
        return next(boom.notFound('User not found'))

    } catch (err) {

        //on any catch return 500
        return next(boom.badImplementation('Something went wrong', err))
    }
}



export const userExists = async (req, res, next) => {
    try {
        //get email from url
        const email = req.params.email
        
        //count documents in database with email
        const count = await User.countDocuments({"auth.local.email": email})
        
        //return if user count is more than 0
        return res.json({userExists: count !== 0})

    } catch (err) {

        //return any error catch
        return next(boom.badImplementation('Something went wrong', err))
    }
} 