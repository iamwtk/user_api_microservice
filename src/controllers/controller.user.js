import mongoose from 'mongoose'
import passport from 'passport'
const User = mongoose.model('User')


export const get = async (req,res) => res.send('Hello World!')

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
        const users = await User.find({}, '-auth.local.salt -auth.local.hash')
        return res.json(users)
    } catch(err) {        
        return res.status(400).json(err)
    }    
}



