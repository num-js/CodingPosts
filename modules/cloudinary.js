const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    cloud_key: process.env.API_KEY,
    cloud_secret: process.env.API_SECRET

});