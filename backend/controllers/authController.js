const User = require('../models/user')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');

const crypto = require('crypto');
const { send } = require('process');
// Register a user = /api/v1/register

exports.registerUser = catchAsyncErrors( async (req, res, next) => {
    const { name, email, password} = req.body;

    const user = await User.create({
        name, 
        email, 
        password,
        avater: {
            public_id: 'avatars/kccvbpsuiusmwfebp3m',
            url: 'https://res.cloudinary.com/shopit/image/upload/v1606305757/avatars/kccvbpsuiusmwfebp3m.png'
        }
    })

  sendToken(user, 200, res)
})

// Login user => /a[i/v1/login]

exports.loginUser = catchAsyncErrors( async (req, res, next) => {
    const { email, password } = req.body

    //checks if email and password is entered by user

    if(!email || !password) {   
        return next(newErrorHandler('please enter email and password', 400))
        }

        //finding user in database
        const user = await User.findOne({ email}).select('+password')

        if(!user) {
            return next(new ErrorHandler('Invalid email or password', 401))
        }

        //checks if password is correct or not
        const isPasswordMatched = await user.comparePassword(password)

        if(!isPasswordMatched){
            return next(new ErrorHandler('Invalid Email or Password', 401))
        }

        sendToken(user, 200, res)

} )

// get currently logged in user details => /api/v1/me
exports.getUserProfile = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user
    })
})

// update / change password => /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

    //check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if(!isMatched){
        return next(new ErrorHandler('old password is incorrect'))
    }

    user.password = req.body.password
    await user.save()

    sendToken(user, 200, res)
})

//update user profile => /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    // update avatar: TODO

    const user = await User.findByIdAndUpdate(req.user.id, newUserData ,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})

//forgot password => /api/v1/password/forgot

exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findOne({ email: req.body.email })

    if(!user) {
        return next(new ErrorHandler('user not found with this email', 404))
    }

    // get reset token
    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false })

    //create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')} /api/v1/password/reset/${resetToken}`

    const message = `your password reset token is as follow: \n\n${resetUrl}\n\nIf you have not requested this emai, then ignore it.`

    try{
        await sendEmail({
            email: user.email,
            subject: 'shopit password recovery',
            message
        })

        res.status(200).json({
            success: true, 
            message: `email sent to: ${user.email}`,
            link: resetUrl
        })
    }catch(error){
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false })
        return next(new ErrorHandler(error.message, 500))
    }
})

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest
    ('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })

    if(!user){
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }

    if(req.body.password!==req.body.confirmPassword){
        return next(new ErrorHandler('Password does not match',400))
    }


    user.password = req.body.password

    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    sendToken(user, 200, res)
})

// logiut user = /api/v1/logout

exports.logout = catchAsyncErrors (async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
})

// admin routes

// get all users => /api/v1/admin/users
exports.allUsers = catchAsyncErrors(async(req, res, next)=>{
    const users = await User.find()

    res.status(200).json({
        success: true,
        users
    })
})

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler(`User dose not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
})