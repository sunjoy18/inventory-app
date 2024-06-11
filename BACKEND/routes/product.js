// const express = require('express');
// const mongoose = require('mongoose');
// const Product = require('../models/Product');
// const Sales = require('../models/Sales');
// const router = express.Router();
// const QRCode = require('qrcode');
// const { GridFSBucket } = require("mongodb");
// const multer = require("multer");
// const stream = require("stream");

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// // Add product route
// router.post('/add', upload.single('image'), async (req, res) => {
//     const { name, description, price, quantity, discountPercentage, discountDays } = req.body;
//     const discount = discountPercentage && discountDays ? {
//         percentage: discountPercentage,
//         expiresAt: new Date(Date.now() + discountDays * 24 * 60 * 60 * 1000)
//     } : {};

//     // Check if a product with the same name already exists
//     const existingProduct = await Product.findOne({ name });
//     if (existingProduct) {
//         return res.status(400).json({ message: 'A product with the same name already exists' });
//     }

//     let imageUrl = null;

//     if (req.file) {
//         try {
//             const filename = name;
//             const fileBuffer = req.file.buffer;

//             const fileId = await uploadFileToGridFS(filename, fileBuffer);
//             imageUrl = `/uploads/${fileId}`;
//         } catch (error) {
//             return res.status(500).json({ message: 'Error uploading image' });
//         }
//     }

//     try {
//         const newProduct = new Product({
//             name,
//             description,
//             price,
//             quantity,
//             imageUrl,
//             discount
//         });
//         await newProduct.save();

//         // Generate QR code
//         const qrCodeBuffer = await QRCode.toBuffer(`${newProduct._id}`);

//         res.writeHead(200, {
//             'Content-Type': 'image/png',
//             'Content-Length': qrCodeBuffer.length
//         });
//         res.end(qrCodeBuffer);
//     } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// const uploadFileToGridFS = async (filename, fileBuffer) => {
//     try {
//         const db = mongoose.connection.db;
//         const bucket = new GridFSBucket(db, { bucketName: "fs" });

//         const uploadStream = bucket.openUploadStream(filename);
//         const readableStream = stream.Readable.from([fileBuffer]);

//         readableStream.pipe(uploadStream);

//         await new Promise((resolve, reject) => {
//             uploadStream.on("finish", () => {
//                 resolve(uploadStream.id);
//             });
//             uploadStream.on("error", reject);
//         });

//         console.log("Image uploaded to GridFS");
//         return uploadStream.id;
//     } catch (error) {
//         console.error("Error uploading image to GridFS:", error);
//         throw error;
//     }
// };

// // Endpoint to get QR code as an image
// router.get('/qr/:id', async (req, res) => {
//     const { id } = req.params;

//     try {
//         const qrCodeBuffer = await QRCode.toBuffer(`${id}`);
//         res.writeHead(200, {
//             'Content-Type': 'image/png',
//             'Content-Length': qrCodeBuffer.length
//         });
//         res.end(qrCodeBuffer);
//     } catch (err) {
//         res.status(500).json({ message: 'Error generating QR code' });
//     }
// });

// // Get all products
// router.get('/allProducts', async (req, res) => {
//     try {
//         const products = await Product.find();
//         res.status(200).json(products);
//     } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // Get a specific product by ID
// router.get('/product/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const product = await Product.findById(id);
//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }
//         res.status(200).json(product);
//     } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// router.get('/images/:filename', async (req, res) => {
//     console.log("fetching image")
//     const { filename } = req.params;

//     try {
//         const db = mongoose.connection.db;
//         const bucket = new GridFSBucket(db, { bucketName: 'fs' });

//         const downloadStream = bucket.openDownloadStreamByName(filename);

//         downloadStream.on('data', (chunk) => {
//             res.write(chunk);
//         });

//         downloadStream.on('error', () => {
//             res.sendStatus(404);
//         });

//         downloadStream.on('end', () => {
//             res.end();
//         });

//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // Edit product price and discount
// router.put('/edit/:id', async (req, res) => {
//     const { id } = req.params;
//     const { price, discountPercentage, discountDays } = req.body;

//     try {
//         const discount = discountPercentage && discountDays ? {
//             percentage: discountPercentage,
//             expiresAt: new Date(Date.now() + discountDays * 24 * 60 * 60 * 1000)
//         } : {};

//         const updatedFields = { price };
//         if (discountPercentage && discountDays) {
//             updatedFields.discount = discount;
//         }

//         const updatedProduct = await Product.findByIdAndUpdate(
//             id,
//             { $set: updatedFields },
//             { new: true }
//         );

//         if (!updatedProduct) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         res.status(200).json(updatedProduct);
//     } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // Update product quantity
// router.put('/update-quantity/:id', async (req, res) => {
//     const { id } = req.params;
//     const { quantity } = req.body;

//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(
//             id,
//             { $set: { quantity } },
//             { new: true }
//         );

//         if (!updatedProduct) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         res.status(200).json(updatedProduct);
//     } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // Add sales info
// router.post('/add-sale', async (req, res) => {
//     const { productId, quantity, totalPrice } = req.body;

//     try {
//         const newSale = new Sales({
//             productId,
//             quantity,
//             totalPrice
//         });
//         await newSale.save();

//         res.status(201).json(newSale);
//     } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });



// module.exports = router;




const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Sale = require('../models/Sales'); // Import the new Sale model
const router = express.Router();
const QRCode = require('qrcode');
const { GridFSBucket } = require("mongodb");
const multer = require("multer");
const stream = require("stream");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Add product route
router.post('/add', upload.single('image'), async (req, res) => {
    const { name, description, price, quantity, discountPercentage, discountDays } = req.body;
    const discount = discountPercentage && discountDays ? {
        percentage: discountPercentage,
        expiresAt: new Date(Date.now() + discountDays * 24 * 60 * 60 * 1000)
    } : {};

    // Check if a product with the same name already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
        return res.status(400).json({ message: 'A product with the same name already exists' });
    }

    if (req.file) {
        try {
            const filename = name;
            const fileBuffer = req.file.buffer;

            const fileId = await uploadFileToGridFS(filename, fileBuffer);
        } catch (error) {
            return res.status(500).json({ message: 'Error uploading image' });
        }
    }

    try {
        const newProduct = new Product({
            name,
            description,
            price,
            quantity,
            discount
        });
        await newProduct.save();

        // Generate QR code
        const qrCodeBuffer = await QRCode.toBuffer(`${newProduct._id}`);

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': qrCodeBuffer.length
        });
        res.end(qrCodeBuffer);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

const uploadFileToGridFS = async (filename, fileBuffer) => {
    try {
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: "fs" });

        const uploadStream = bucket.openUploadStream(filename);
        const readableStream = stream.Readable.from([fileBuffer]);

        readableStream.pipe(uploadStream);

        await new Promise((resolve, reject) => {
            uploadStream.on("finish", () => {
                resolve(uploadStream.id);
            });
            uploadStream.on("error", reject);
        });

        console.log("Image uploaded to GridFS");
        return uploadStream.id;
    } catch (error) {
        console.error("Error uploading image to GridFS:", error);
        throw error;
    }
};

// Endpoint to get QR code as an image
router.get('/qr/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const qrCodeBuffer = await QRCode.toBuffer(`${id}`);
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': qrCodeBuffer.length
        });
        res.end(qrCodeBuffer);
    } catch (err) {
        res.status(500).json({ message: 'Error generating QR code' });
    }
});

// Get all products
router.get('/allProducts', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a specific product by ID
router.get('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/images/:filename', async (req, res) => {
    const { filename } = req.params;

    try {
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: 'fs' });

        const downloadStream = bucket.openDownloadStreamByName(filename);

        downloadStream.on('data', (chunk) => {
            res.write(chunk);
        });

        downloadStream.on('error', () => {
            res.sendStatus(404);
        });

        downloadStream.on('end', () => {
            res.end();
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Edit product price and discount
router.put('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { price, discountPercentage, discountDays, quantity } = req.body;

    try {
        const discount = discountPercentage && discountDays ? {
            percentage: discountPercentage,
            expiresAt: new Date(Date.now() + discountDays * 24 * 60 * 60 * 1000)
        } : {};

        const updatedFields = { price, quantity };
        if (discountPercentage && discountDays) {
            updatedFields.discount = discount;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updatedFields },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update product quantity
router.put('/update-quantity/:id', async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: { quantity } },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add sale information
router.post('/add-sale', async (req, res) => {
    const { productId, productName, quantity, totalPrice } = req.body;
    try {
        const newSale = new Sale({
            productId,
            productName,
            quantity,
            totalPrice,
            date: new Date()
        });
        await newSale.save();
        res.status(200).json(newSale);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get sales for a specific date
router.get('/sales', async (req, res) => {
    try {
        let query = {};

        // Check if date filter is provided
        if (req.query.date) {
            query.date = {
                $gte: new Date(req.query.date),
                $lt: new Date(req.query.date).setHours(23, 59, 59, 999) // Set end of the day
            };
        }

        // Fetch sales data based on filters
        const sales = await Sale.find(query).sort({ date: -1 });
        res.status(200).json(sales);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get sales for a specific date
router.get('/sale/:date', async (req, res) => {
    try {
        const { date } = req.params;
        console.log("date : ", date);
        
        // Create start and end date for the given day
        const startDate = new Date(date);
        startDate.setDate(startDate.getDate() - 1)
        const endDate = new Date(date);
        // endDate.setDate(endDate.getDate());
        
        console.log("startDate : ", startDate);
        console.log("endDate : ", endDate);
        
        // Fetch sales data based on the date range
        const sales = await Sale.find({
            date: {
                $gte: startDate,
                $lt: endDate
            }
        }).sort({ date: -1 });
        
        console.log("sales : ", sales);
        res.status(200).json(sales);
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
