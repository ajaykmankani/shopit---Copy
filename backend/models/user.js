const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        maxLength: [30, 'Your name cannot be exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email address'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minLength: [6, 'Please enter at least 6 characters'],
        select: false
    },
    avatar: {
        Public_id: {
            type: String,
           
        },
        url: {
            type: String,
           
        }
    },
    role: {
        type: String,
        default: 'user'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date 
})


//encrypting password before saving to database
userSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

//compare user password
userSchema.methods.comparePassword = async function (enterdPassword){
    return await bcrypt.compare(enterdPassword, this.password)
}

userSchema.methods.getJwtToken = function() {
    return jwt.sign({ id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

// generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    //generate token
    const resetToken = crypto.randomBytes(20).toString('hex')

    //hash and set to resetPassowrdToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    //set token expire time
    this.resetPassowrdExpire = Date.now() + 30 * 60 * 1000  

    return resetToken
}
module.exports = mongoose.model ('User', userSchema)