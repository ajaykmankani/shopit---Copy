const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter price'],
        maxLength: [5, 'Product price cannot exceed 5 characters'],
        default: 0.0
    },
    description:{
        type: String,
        required: [true, 'Please enter description'],
    },
    rating: {
        type: Number,
        default: 0
    },
    images: [
        {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }
    ],
    category: {
        type: String,
        required: [true, 'Please enter category'],
        enum: {
            values: [
                'Electronics',
                'Cameras',
                'Laptop',
                'Accessories'
            ],
            message: 'Please enter correct catorery'
        }
    },
    seller: {
        type: String,
        required: [true, 'Please enter seller'],
    },
    stock: {
        type: Number,
        required: [true, 'Please enter Product stock'],
        maxLength: [5, 'Seller name cannot exceed 5 characters'],
        degault: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
    }
],
user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
},
createdAt: {
    type: Date,
    default: Date.now
}

})

module.exports = mongoose.model ('Product', productSchema)