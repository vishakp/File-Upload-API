var express = require('express');
var router = express.Router();
var userService = require('../services/userService');

var jwt = require('jsonwebtoken');
var config = require('../config');
var bcrypt = require('bcrypt');
var saltRounds = 10;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//for password bcrypt


router.post('/register',  async function(req, res, next) {
    
    console.log(req.body.password);
    console.log(req.body.cpassword);
try{
  var check = await userService.getUser({ email: req.body.email });
  if(check){
    res.json({"Status": "Failed", "Error": "email already exist"})
  } else if(req.body.uname === ' ') res.json({"Status": "Failed", "Error": "uname cannot be empty"})
  else{

    req.body.password = req.body.password.trim();
    req.body.cpassword = req.body.cpassword.trim();

    if(req.body.password && (req.body.password === req.body.cpassword)){
      //for save the password in db save the hash value only
      var hash = await bcrypt.hash(req.body.password, saltRounds);
        let usr = {
          uname: req.body.uname,
          email: req.body.email,
          password:hash,
          date: req.body.date
        };

        var createUser = await userService.createUser(usr)
        if(createUser) {
          res.json({"Status": "ok", "UserAdded": createUser.uname })
        } 
       
         }
      }
     
  } catch(e) {
  
    console.log(e);
    res.json({"Error": e})
  }
});


router.post('/login',async function(req, res, next){
  try{
    
    var userEmail = req.body.email;
    var userPassword = req.body.password;
  
    var user = await userService.getUser({ email: userEmail });
    console.log("aaa",user)
    if(user){
        var oldPassword = user.password;
       
            var result = await bcrypt.compare(userPassword, oldPassword);
            // console.log(res);
            if(result){
            console.log("bbb",result);
            var token = jwt.sign({ name: user.uname , email:user.email}, config.secret);
            console.log(token);
            res.cookie('token', token, { signed: true });
            res.json({"Status": "OK"});
           } else{ 
            res.json({"Error": "Wrong Password"})
             }
      } else{
        res.json({"Error": "User not found"})
      }
  } catch(e){
    console.log(e)
    res.json({"Error": e})
  }

});

router.get('/logout',function(req, res, next){
  try{
    res.clearCookie('token');
    res.json({"Status": "ok"})
  } catch(e){
    console.log(e);
  }
  
});


module.exports = router;
