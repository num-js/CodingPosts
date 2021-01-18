const mongoose = require('mongoose');

moment = require('moment');

// mongoose.connect('mongodb://localhost:27017/posts_db', {
mongoose.connect('mongodb+srv://na4085494:nah123MLAB@codingposts-o9kjj.mongodb.net/posts_db?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const conn = mongoose.Connection;

    //Schema
const postsSchema = mongoose.Schema({
    topic: {
        type:String,
        required: true
    },
    post_pic: String,
    summary: String,
    description: {
        type:String,
        required: true
    },
    category: String,
    date: {
        type: String,
        // default: Date.now
        default: moment().format('MMMM Do YYYY, h:mm:ss a')
    },
    postsBy: {
        type: String,
        default: 'Unknown User'
    },
    postsByEmail: {
        type: String,
        default: 'user@gmail.com'
    }
});

    //Model
const postModel = mongoose.model('posts', postsSchema);

module.exports = postModel;
