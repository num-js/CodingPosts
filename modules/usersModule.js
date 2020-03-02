const mongoose = require('mongoose');

// mongoose.connect('mongodb+srv://na4085494:nah123MLAB@codingposts-o9kjj.mongodb.net/posts_db?retryWrites=true&w=majority', {
mongoose.connect('mongodb://localhost:27017/posts_db', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const conn = mongoose.Connection;

    //Schema
const userSchema = mongoose.Schema({
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
const userModel = mongoose.model('users',userSchema);

module.exports = userModel;