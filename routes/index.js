var express = require('express');
var router = express.Router();

var fs = require('fs');

    //Posts Module
const postModel = require('../modules/postModule');
const queryPosts = postModel.find().sort({_id: -1});

    //Users Module
const userModel = require('../modules/usersModule');
const queryUsers = userModel.find({});

    //Users Module
const nahModel = require('../modules/nahModule');
// const queryUsers = userModel.find({});
    
    // bcryptjs
const bcrypt = require('bcryptjs');

    //Multer & Path
var multer = require('multer');
var path = require('path');

router.use(express.static(__dirname+"./public/"));


    // Session
var session = require('express-session');
    // for Session
router.use(session({
  secret: 'codingposts_N',
  resave: false,
  saveUninitialized: true
}));


      //Index File
router.get('/', function(req, res, next) {
  cp_email = '';
  if(req.session.cp_email){
    cp_email = req.session.cp_email;
  }

    queryPosts.exec(function(err, data){
      if(err) throw err;
      else{
        res.render('index', {records: data, success: '', cp_email: cp_email}); 
      }
    });
  // else{
  //   res.render('login', {success: 'LogIn First', cp_email: ''});
  // }
});

          // Save Posts
var Storage = multer.diskStorage({
  destination: "./public/post_pic/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname+"_"+Date.now()+path.extname(file.originalname));
  }
});

router.post('/savepost', function(req, res, next){
  var upload = multer({
    storage: Storage,
    fileFilter: function (req, file, callback) {
      var ext = path.extname(file.originalname);
      if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        res.render('wrong_file_upload', {error: 'Only images are allowed [png, jpg, jpeg, gif]', cp_email: ''});   
        // console.log('Only images are allowed');
        return callback(new Error('Only images are allowed'))
      }
      callback(null, true)
    }
  }).single('post_pic');
  
    upload(req,res,function(err) {
        if(err){
          res.render('wrong_file_upload', {error: 'Only images are allowed [png, jpg, jpeg, gif]', cp_email: ''});
        }else{
          if(req.file){
            var imageFile = req.file.filename;
            var postInputData = new postModel({
              topic: req.body.topic,
              post_pic: imageFile,
              summary: req.body.summary,
              description: req.body.description,
              category: req.body.category,
              postsBy: cp_email.name,
              postsByEmail: cp_email.email
            });
          }else{
            var postInputData = new postModel({
              topic: req.body.topic,
              summary: req.body.summary,
              description: req.body.description,
              category: req.body.category,
              postsBy: cp_email.name,
              postsByEmail: cp_email.email
            });
          }

          postInputData.save(function(err, data){
            if (err) throw err;
            else{
              queryPosts.exec(function(err, data){
                if(err) throw err;
                else{
                  res.render('index', {records: data, success: 'Post Uploaded'}); 
                }
              });
            }
          });
        }
    });

  
});


router.get('/register', (req, res, next)=>{
  if(req.session.cp_email){
    cp_email = req.session.cp_email;
    queryPosts.exec(function(err, data){
      if(err) throw err;
      else{
        res.render('index', {records: data, success: '', cp_email: cp_email}); 
      }
    });
  }else{
    res.render('register', {success: '', cp_email: ''});
  }
    // res.render('register', {success: '', cp_email: ''});
});

function checkEmail(req, res, next){
  var email = req.body.email;
  var checkExistEmail = userModel.findOne({email:email});
  checkExistEmail.exec((err, data)=>{
    if(err) throw err;
    else{
      if(data){
        return res.render('register', {success: 'Email alredy Exists, Please LogIn or use another Email', cp_email: ''});
      }else{
        next();
      }
    }
  });
}

router.post('/register', checkEmail, (req, res, next)=>{
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var confpassword = req.body.confpassword;

  if(password == confpassword){
    password = bcrypt.hashSync(password,10);
    const registerUserDetails = new userModel({
      name: name,
      email: email,
      password: password
    });

    registerUserDetails.save((err, data)=>{
      if(err) throw err;
      res.render('login', {success: 'Registration Successfull, Now you can LogIn', cp_email: ''});
    });
  }else{
    res.render('register', {success: 'Password missmatch', cp_email: ''});
  }
});


router.get('/login', (req, res, next)=>{
  if(req.session.cp_email){
    cp_email = req.session.cp_email;
    queryPosts.exec(function(err, data){
      if(err) throw err;
      else{
        res.render('index', {records: data, success: '', cp_email: cp_email}); 
      }
    });
  }else{
    res.render('login', {success: '', cp_email: ''});
  }
});


    // Post Login
router.post('/', (req, res, next)=>{
  var email = req.body.email;
  var password = req.body.password;
  var checkUser = userModel.findOne({email:email});
  checkUser.exec((err, data)=>{
    if(err){
      res.render('login', {success: 'Wrong Email or Password', cp_email: ''});
    }else{
      // console.log(data);
      // console.log(data.password);
      if(data.password == null){
        res.render('login', {success: 'Wrong Email or Password', cp_email: ''});
      }else{
        var getPassword = data.password;
      }
      if(bcrypt.compareSync(password, getPassword)){
        
        req.session.cp_email = data;
        // req.session.cp_name = data.name;

        queryPosts.exec(function(err, data){
          if(err) throw err;
          else{
            cp_email = req.session.cp_email;
            res.render('index', {records: data, success: '', cp_email: cp_email}); 
          }
        });
      }else{
        res.render('login', {success: 'Wrong Email & Password', cp_email: cp_email});
      }
    }
  });
});


    //Logout
router.get('/logout', (req, res, next)=>{
  if(req.session.cp_email){
    delete req.session.cp_email;
    queryPosts.exec(function(err, data){
      if(err) throw err;
      else{
        res.render('index', {records: data, success: '', cp_email: ''});
      }
    });
  }else{
    queryPosts.exec(function(err, data){
      if(err) throw err;
      else{
        res.render('index', {records: data, success: '', cp_email: ''});
      }
    });
  }
});

    //Search
router.post('/search', (req, res, next)=>{
  var postName = req.body.postName;
  
  // querySerch = postModel.find({ topic: postName, summary: postName, description: postName, category: postName });
  querySerch = postModel.find({ $or:[{topic:{$regex: postName, $options: 'i'}}, {summary:{$regex: postName, $options: 'i'}}, {description:{$regex: postName, $options: 'i'}}, {category:{$regex: postName, $options: 'i'}} ] }).sort({_id: -1});
    querySerch.exec(function(err, data){
      if(err) throw err;
      else{
        res.render('index', {records: data, success: '', cp_email: cp_email}); 
      }
    });
    
});


    // View Post
router.get('/viewpost/:postId', (req, res, next)=>{
  cp_email = '';
  if(req.session.cp_email){
    cp_email = req.session.cp_email;
  }
    var postId = req.params.postId;
    var queryPostData = postModel.findById(postId)
    queryPostData.exec(function(err, data){
      if(err) throw err;
      else{
        res.render('viewpost', {row: data}); 
      }
    });
  // }else{
  //   res.render('login', {success: 'LogIn First', cp_email: ''});
  // }
});


    // Edit Posts
router.get('/edit/:postId', (req, res, next)=>{
  if(req.session.cp_email){
    // cp_email = req.session.cp_email;
    var postId = req.params.postId;
    var queryPostData = postModel.findById(postId)
    queryPostData.exec(function(err, data){
      if(err) throw err;
      else{
        res.render('editpost', {row: data}); 
      }
    });
  }else{
    res.render('login', {success: 'LogIn First', cp_email: ''});
  }
});


    // Update Posts
router.post('/updatePost', function(req, res, next){
  var upload = multer({
    storage: Storage,
    fileFilter: function (req, file, callback) {
      var ext = path.extname(file.originalname);
      if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        res.render('wrong_file_upload', {success: 'Only images are allowed [png, jpg, jpeg, gif]'});   
        // console.log('Only images are allowed');
        return callback(new Error('Only images are allowed'))
      }
      callback(null, true)
    }
  }).single('post_pic');
  
    upload(req,res,function(err) {
        if(err) throw err;
        else{
          if(req.file){
            var imageFile = req.file.filename;
            var postUpdate = postModel.findByIdAndUpdate(req.body.postId, {
              topic: req.body.topic,
              post_pic: imageFile,
              summary: req.body.summary,
              description: req.body.description,
              category: req.body.category,
              postsBy: cp_email.name,
              postsByEmail: cp_email.email
            });
          }else{
            var postId = req.body.postId;
            var postUpdate = postModel.findByIdAndUpdate(postId, {
              topic: req.body.topic,
              summary: req.body.summary,
              description: req.body.description,
              category: req.body.category,
              postsBy: cp_email.name,
              postsByEmail: cp_email.email
            });
          }

          postUpdate.exec(function(err, data){
            if(err) throw err;
            else{
              queryPosts.exec(function(err, data){
                if(err) throw err;
                else{
                  res.render('index', {records: data, success: '', cp_email: cp_email}); 
                }
              });
            }
          });
        }
    });
});


  // Delete records
router.post('/deletePost', function(req, res, next){
  var postId = req.body.postId;
  var imgPath = req.body.imgPath;
  var delete_data = postModel.findByIdAndDelete(postId);
  delete_data.exec(function(err, data){
    if(err){
      queryPosts.exec(function(err, data){
        if(err) throw err;
        else{
          res.render('index', {records: data, success: 'Cannot Delete Post...', cp_email: cp_email}); 
        }
      });
    }else if(imgPath != ''){
      queryPosts.exec(function(err, data){
        if(err) throw err;
        else{
          fs.unlink('./public/post_pic/'+imgPath, function(err) { //where path is the path of the image and fs is fs-extra
            if(err) throw err;
            else{
                res.render('index', {records: data, success: 'Post Deleted Successfully', cp_email: cp_email});
            }
          });
        }
      });
    }else{
      queryPosts.exec(function(err, data){
        if(err) throw err;
        else{
            res.render('index', {records: data, success: 'Post Deleted Successfully', cp_email: cp_email});
        }
      });
    }
  });
});


  // Open Editor in New Window
router.get('/openEditorWindow', (req, res, next)=>{
  if(req.session.cp_email){
    res.render('openEditorWindow'); 
  }else{
    res.render('login', {success: 'LogIn First', cp_email: ''});
  }
});









            //******  ADMIN  ******/

router.get('/nah', (req, res, next)=>{
  if(req.session.cp_email_nah){
    // cp_email = req.session.cp_email;
    cp_email_nah = req.session.cp_email_nah;
    queryPosts.exec(function(err, data){
      if(err) throw err;
      else{
        res.render('nahindex', {records: data, success: '', cp_email_nah: cp_email_nah}); 
      }
    });
  }else{
    res.render('nahlogin', {success: '', cp_email_nah: ''});
  }
});


    // Post Admin Login
router.post('/nah', (req, res, next)=>{
  var email = req.body.email;
  var password = req.body.password;
    
  var checkUser = nahModel.findOne({email:email});
  checkUser.exec((err, data)=>{
    if(err){
      res.render('nahlogin', {success: 'Wrong Email or Password', cp_email_nah: ''});
    }else{
      if(data.password == null){
        res.render('nahlogin', {success: 'Wrong Email or Password', cp_email_nah: ''});
      }else{
        var getPassword = data.password;
      }

      if(bcrypt.compareSync(password, getPassword)){
        
        req.session.cp_email_nah = data;
        // req.session.cp_name = data.name;

        queryPosts.exec(function(err, data){
          if(err) throw err;
          else{
            cp_email_nah = req.session.cp_email_nah;
            res.render('nahindex', {records: data, success: '', cp_email_nah: cp_email_nah}); 
          }
        });
      }else{
        res.render('nahlogin', {success: 'Wrong Email & Password', cp_email_nah: cp_email_nah});
      }
    }
  });
});
          


    // View Post
router.get('/nahviewpost/:postId', (req, res, next)=>{
  cp_email_nah = '';
  if(req.session.cp_email_nah){
    cp_email_nah = req.session.cp_email_nah;
  }
    var postId = req.params.postId;
    var queryPostData = postModel.findById(postId)
    queryPostData.exec(function(err, data){
      if(err) throw err;
      else{
        res.render('nahviewpost', {row: data}); 
      }
    });
  // }else{
  //   res.render('login', {success: 'LogIn First', cp_email_nah: ''});
  // }
});



  // Delete records
router.post('/nahdeletePost', function(req, res, next){
  var postId = req.body.postId;
  var imgPath = req.body.imgPath;
  var delete_data = postModel.findByIdAndDelete(postId);
  delete_data.exec(function(err, data){
    if(err){
      queryPosts.exec(function(err, data){
        if(err) throw err;
        else{
          res.render('nahindex', {records: data, success: 'Cannot Delete Post...', cp_email_nah: cp_email_nah}); 
        }
      });
    }else if(imgPath != ''){
      queryPosts.exec(function(err, data){
        if(err) throw err;
        else{
          fs.unlink('./public/post_pic/'+imgPath, function(err) { //where path is the path of the image and fs is fs-extra
            if(err) throw err;
            else{
                res.render('nahindex', {records: data, success: 'Post Deleted Successfully', cp_email_nah: cp_email_nah});
            }
          });
        }
      });
    }else{
      queryPosts.exec(function(err, data){
        if(err) throw err;
        else{
            res.render('nahindex', {records: data, success: 'Post Deleted Successfully', cp_email_nah: cp_email_nah});
        }
      });
    }
  });
});


    //Logout
router.get('/nahlogout', (req, res, next)=>{
  if(req.session.cp_email_nah){
    delete req.session.cp_email_nah;
    queryPosts.exec(function(err, data){
      if(err) throw err;
      else{
        res.render('index', {records: data, success: '', cp_email: ''});
      }
    });
  }else{
    queryPosts.exec(function(err, data){
      if(err) throw err;
      else{
        res.render('index', {records: data, success: '', cp_email: ''});
      }
    });
  }
});


    //Search
router.post('/nahsearch', (req, res, next)=>{
  var postName = req.body.postName;
  
  // querySerch = postModel.find({ topic: postName, summary: postName, description: postName, category: postName });
  querySerch = postModel.find({ $or:[{topic:{$regex: postName, $options: 'i'}}, {summary:{$regex: postName, $options: 'i'}}, {description:{$regex: postName, $options: 'i'}}, {category:{$regex: postName, $options: 'i'}} ] }).sort({_id: -1});
    querySerch.exec(function(err, data){
      if(err) throw err;
      else{
        res.render('nahindex', {records: data, success: '', cp_email_nah: cp_email_nah}); 
      }
    });
    
});




module.exports = router;