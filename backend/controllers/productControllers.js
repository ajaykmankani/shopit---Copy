const Product = require('../models/product')
const APIFeatures = require('../utils/apiFeatures')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')

exports.newProduct = catchAsyncErrors (async (req, res) => {
    req.body.user = req.user.id
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        message: 'Product add successfully'
    })
})

exports.getProducts = catchAsyncErrors (async (req, res, next)=>{
    
    return next (new ErrorHandler('My Error', 400))

    const resPerPage = 8

    const productsCount = await Product.countDocuments()
    const apiFeatures = new APIFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resPerPage)

        const products = await apiFeatures.query

    res.status(200).json({
        success:true,
        count: products.length,
        products
    })

})

exports.getSingleProduct = catchAsyncErrors (async (req, res, next) => {
    const product = await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler('product not found', 404))
    }

    res.status(200).json({
        success: true,
        product
    })
})


exports.updateProduct = catchAsyncErrors (async (req, res)=> {

    let product = await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler('product not found', 404))
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        productsCount:product.length,
        product
    })
})

exports.deleteProduct = catchAsyncErrors (async (req, res) => {
    const product = await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler('product not found', 404))
        
    }
    await product.remove()

    res.status(200).json({
        success: true,
        message: "product is deleted"
    })

})
