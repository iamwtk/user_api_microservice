import mongoose from 'mongoose'
import passport from 'passport'
import LocalStrategy from 'passport-local'

const User = mongoose.model('User')

//assign POST fields to local Strategy
const authFields = {
    usernameField: 'user[email]',
    passwordField: 'user[password]',
}

//pass local strategy to passport
passport.use(new LocalStrategy(authFields, async (email, password, done) => {
    try {
        //search for user by email address
        const user = await User.findOne({ "auth.local.email": email })
        //if no user found return object containing error message
        if (!user) {
            return done(new Error('User does not exist.'), false)
        }
        //if password not correct return object containing error message
        if (!user.validatePassword(password)) {
            return done(new Error('Wrong password.'), false)
        }
        //if all checks went well continue with user object
        return done(null, user)
    } catch(err) {
        done(err)
    }
}))