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
 * Gets all users from database
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

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndRemove(req.body.user.id)
        if (user) return res.json({message: 'User deleted'})
        else return next(boom.notFound('User not found'))
    } catch (err) {
        return next(boom.badImplementation('Something went wrong', err))
    }
}

export const updateUser = async (req, res, next) => {
    const userId = req.payload.role === 'admin' ? req.body.user.id : req.payload.id
    const userData = {...req.body.user}
    delete userData.role     
    try {
        const user = await User.findByIdAndUpdate(userId, userData)
        if (user) return res.json({message: 'User updated'})
        else return next(boom.notFound('User not found'))
    } catch (err) {
        return next(boom.badImplementation('Something went wrong', err))
    }
}



const userExists = async (email, next) => {
    try {
        const count = await User.countDocuments({"auth.local.email": email})        
        return count !== 0
    } catch (err) {
        return next(boom.badImplementation('Something went wrong', err))
    }
} 