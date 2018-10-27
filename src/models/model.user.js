import mongoose  from 'mongoose'
import validator from 'validator'
import crypto    from 'crypto'
import jwt       from 'jsonwebtoken'
import constants from '../config/constants'

const {
    Schema
} = mongoose



const UserSchema = new Schema({
    auth: {
        local: {
            email:  { type: String, required: true },
            hash:   String,
            salt:   String,
        }
    },
    role:    { type: String, enum: ['admin', 'user', 'shop_owner'], default: 'user'},
    profile: {
        name:   String,
        phone:  String        
    }

})

//Validations
UserSchema.path('auth.local.email').validate(email => validator.isEmail(email), 'Please enter valid email address.')
UserSchema.path('auth.local.email').validate(async email => {
    try {
        const count = await mongoose.model('User', UserSchema).countDocuments({"auth.local.email": email})  
        return count === 0
    }
    catch(err) {
        return console.error(err)
    }     
    
}, 'Email already exists')

UserSchema.methods.setPassword = function (password) {
    this.auth.local.salt = crypto.randomBytes(16).toString('hex')
    this.auth.local.hash = crypto.pbkdf2Sync(password, this.auth.local.salt, 10000, 512, 'sha512').toString('hex')
}

UserSchema.methods.validatePassword = function (password) {
    const hash = crypto.pbkdf2Sync(password, this.auth.local.salt, 10000, 512, 'sha512').toString('hex')
    return this.auth.local.hash === hash
}


UserSchema.methods.generateJWT = function () {
    return jwt.sign({
        email:      this.auth.local.email,
        id:         this._id,
        role:       this.role,
        expiresIn:  3600,
    }, constants.AUTH_SECRET)
}

UserSchema.methods.toAuthJSON = function () {
    return {
        _id:    this._id,
        email:  this.auth.local.email,
        role:   this.role,
        token:  this.generateJWT(),
        expire: 3600
    };
};

export default mongoose.model('User', UserSchema)