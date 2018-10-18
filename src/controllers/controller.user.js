import mongoose from 'mongoose'
import passport from 'passport'
const User = mongoose.model('User')


export const get = async (req,res) => {
    try {
        const user = await User.findById(req.payload.id, '-auth')
        return res.json({user})
    } catch (err) {
        return res.status(401).json(err)
    }
}

export const signup = async (req,res) => {
    const user = req.body.user
    try {
        const UserData = new User()

        UserData.auth.local.email = user.email
        UserData.setPassword(user.password)

        await UserData.save()

       return res.json({ user: UserData.toAuthJSON() })

    } catch(err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            return res.status(401).json({...err, errmsg: 'Email already in use!'})
        }
        return res.status(401).json(err)
    }
    
}

export const login = (req, res, next) => {   
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return next(err)
        if (user) {            
            user.auth.local.token = user.generateJWT()
            return res.json({ user: user.toAuthJSON() })
        }
        return res.status(400).json(info)
    })(req, res, next)
}

export const getAll = async (req, res) => {
    try {
        const users = await User.find({}, '-auth')
        return res.json(users)
    } catch(err) {        
        return res.status(400).json(err)
    }    
}

export const deleteUser = async (req,res) => {
    try {
        const user = await User.findByIdAndRemove(req.body.user.id)
        if (user) return res.json({message: 'User deleted'})
        else return res.json({message: 'User not found'})
    } catch (err) {
        return res.status(400).json(err)
    }
}

export const updateUser = async (req,res) => {
    const userId = req.payload.role === 'admin' ? req.body.user.id : req.payload.id
    const userData = {...req.body.user}
    delete userData.role     
    try {
        const user = await User.findByIdAndUpdate(userId, userData)
        if (user) return res.json({message: 'User updated'})
        else return res.json({message: 'User not found'})
    } catch (err) {
        return res.status(400).json(err)
    }
}



