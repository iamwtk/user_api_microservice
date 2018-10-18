import mongoose from 'mongoose'
import passport from 'passport'
import boom from 'boom'
const User = mongoose.model('User')


export const get = async (req, res, next) => {
    try {
        const user = await User.findById(req.payload.id, '-auth')
        if (user) {
            return res.json({user})
        }
        return next(boom.notFound('User not found'))
    } catch (err) {        
        return next(boom.badImplementation('Something went wrong', err))
    }
}

export const signup = async (req, res, next) => {
    const user = req.body.user
    try {
        const UserData = new User()

        UserData.auth.local.email = user.email
        UserData.setPassword(user.password)

        await UserData.save()

       return res.json({ user: UserData.toAuthJSON() })

    } catch(err) {       
        return next(boom.badImplementation('Something went wrong', err))
    }
    
}

export const login = (req, res, next) => {   
    passport.authenticate('local', { session: false }, (err, user) => {
        if (err) return next(boom.unauthorized(err))
        if (user) {            
            user.auth.local.token = user.generateJWT()
            return res.json({ user: user.toAuthJSON() })
        }        
    })(req, res, next)
}

export const getAll = async (req, res, next) => {
    try {
        const users = await User.find({}, '-auth')
        return res.json(users)
    } catch(err) {        
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



