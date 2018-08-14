var express = require('express');
var router = express.Router();
var multer = require('multer');
var fileService = require('../services/fileService')
var userService = require('../services/userService')
var fs = require('fs')
var jwtDecode = require('jwt-decode');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('Users');
});

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/uploads');
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname.replace(/ \s+/g, ''))
  }
});

var upload = multer({ storage: storage });

router.post('/upload', upload.any(), (req, res) => {
  var token = req.signedCookies.token;
  console.log(token);
  var dtoken = jwtDecode(token);

  var recurUpload = (files, result, cb) => {
    if (files.length > 0) {
      let file = files.shift()
      var data = {
        fileName: file.originalname,
        title: file.fieldname,
        type: file.mimetype,
        path: file.path,
        size: file.size,
        owner: dtoken.name
      };
      var query = { uname: dtoken.name }
      var update = { $push: { filesUploaded: file.originalname } }

      userService.updateUser(query, update)
      fileService.addFile(data).then((_res) => {

        let obj = {
          name: _res.fileName,
          title: _res.title
        }
        result.push(obj)
        recurUpload(files, result, cb)

      });

    }
    else cb(result)
  }


  recurUpload(req.files, [], (_result) => {
    console.log(_result)
    res.json({ 'Status': 'OK', 'Files Uploaded': _result })
  })



});

router.get('/download/:name?', (req, res) => {
  var token = req.signedCookies.token;
  console.log(token);
  var dtoken = jwtDecode(token);
  console.log(dtoken);


  // console.log(req.params);  
  if (!req.params.name) {
    var query = {}
  } else {
    var query = {
      title: req.params.name
    };
  }
  userService.getFiles({ uname: dtoken.name }, { filesUploaded: 1, _id: 0 }).then((_res) => {
    var files = _res.filesUploaded;
    const fileRec =(files, result, cb)=>{
      if (files.length > 0) {
        let file = files.shift();

        fileService.listFiles({ fileName: file, owner:dtoken.name }).then((_res) => {
          // console.log(result);

          _res.forEach((_file) => {
            var obj = {
              "title": _file.title,
              "file_name": _file.fileName,
              "url": _file.path
            }
            result.push(obj);
          });
          fileRec(files, result, cb);
        });
      } else {
        cb(result)
      }
    }
    console.log(files)

    fileRec(files, [], (_result) => {
      res.json(_result);
    });

  });
});



router.delete('/filedelete/:fileName', (req, res) => {
  console.log(req.params.fileName)
  let query = {
    fileName: req.params.fileName
  }
  fileService.removeFile(query).then((_result) => {
    if (!_result) {
      res.json({ "status": "Cannot Delete", "error": _result });
    } else
      fs.unlink(_result.path, () => {
        res.json({ "Status": "File deleted", "file_name": _result.fileName });
      })

  })
})

router.post('/update', (req, res) => {
  var query = { fileName: req.body.fileName, title: req.body.title }
  var update = { title: req.body.newTitle }
  console.log("Update query", query);
  console.log("Update", update);
  fileService.updateTitle(query, update).then((_result) => {
    console.log(_result);
    res.json(_result);
  })
})

module.exports = router;
