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
        let user = await User.findOne({ "auth.local.email": email })
        //if no user found return object containing error message
        if (!user) {
            return done(null, false, {
                login: {
                    email: 'User does not exist'
                }
            })
        }
        //if password not correct return object containing error message
        if (!user.validatePassword(password)) {
            return done(null, false, {
                login: {
                    password: 'Wrong password'
                }
            })
        }
        //if all checks went well continue with user object
        return done(null, user)
    } catch(err) {
        done(err)
    }
}))