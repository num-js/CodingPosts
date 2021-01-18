const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost:27017/posts_db', {
mongoose.connect('mongodb+srv://na4085494:nah123MLAB@codingposts-o9kjj.mongodb.net/posts_db?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const conn = mongoose.Connection;

    //Schema
const nahSchema = mongoose.Schema({
    name: {
        type:String,
        required: true,
    },
    email: {
        type:String,
        required: true, 
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

    //Model
const nahModel = mongoose.model('nah',nahSchema);

module.exports = nahModel;
