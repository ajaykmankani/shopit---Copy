const express = require('express')
const router = express.Router()


    const { getProducts, newProduct, getSingleProduct,updateProduct,deleteProduct } = require('../controllers/productControllers')


    const { isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth')


// router.route('/products').get(isAuthenticatedUser , authorizeRoles('admin'), getProducts)
router.route('/products').get( getProducts)
router.route('/product/:id').get(getSingleProduct)
router.route('/admin/product/:id').put(updateProduct)
router.route('/admin/product/:id').delete(deleteProduct)
router.route('/admin/product/new').post(newProduct)

module.exports = router