const express = require('express')
const {requireSignIn, isAdmin} = require('../middleware/authmiddleware');
const { createProductController, getProductController, getSingleProductController, productPhotoController, deleteProductController, updateProductController,
productFilterController, productCountController, productListController, searchProductController, realtedProductController, productCategoryController,braintreeTokenController,brainTreePaymentController} = require('../controllers/productController');
const formidable = require('express-formidable');


const router = express.Router();

//routes
//Create Product
router.post('/create-product', requireSignIn, isAdmin,formidable() ,createProductController);

//Update Product
router.put('/update-product/:pid', requireSignIn, isAdmin,formidable() ,updateProductController);

//get products
router.get('/get-product', getProductController);

//single product
router.get('/get-product/:slug', getSingleProductController);

//get photo
router.get("/product-photo/:pid", productPhotoController);

//delete product
router.delete('/delete-product/:pid', deleteProductController)

//filter product
router.post('/proudct-filters', productFilterController)

//product count
router.get('/product-count', productCountController)

//product per page
router.get('/product-list/:page', productListController);

//search product
router.get('/search/:keyword', searchProductController);

//similar product
router.get('/related-product/:pid/:cid', realtedProductController)

//category wise product
router.get(`/product-category/:slug`, productCategoryController)

//Payment routes
//token
router.get('/braintree/token', braintreeTokenController);

//payments
router.post('/braintree/payment',requireSignIn, braintreeTokenController);


module.exports = router;