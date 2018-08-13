var express = require('express');
var router = express.Router();
var multer = require('multer');
var fileService = require('../services/fileService') 
var fs = require('fs')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/uploads');
  },
  filename:  (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname.replace(/ \s+/g,''))
  }
});

var upload = multer({storage: storage});

router.post('/upload', upload.any(), (req, res) => {
  
 var recurUpload = (files, result, cb)=>{
  if(files.length > 0){
    let file = files.shift()
    var data = {
      fileName : file.originalname,
      title: file.fieldname,
      type: file.mimetype,
      path: file.path,
      size: file.size
    };
    fileService.addFile(data).then((_res)=>{
      
      let obj ={
        name: _res.fileName,
        title: _res.title
      }
      result.push(obj)
      recurUpload(files, result, cb)
      
    });
  }
  else cb(result)
 } 
  

  recurUpload(req.files, [], (_result)=>{
    console.log(_result)
    res.json({'Status': 'OK', 'Files Uploaded': _result})
  })
  

 
});

router.get('/download/:name?', (req,res) => {
  
  console.log(req.params);  
  if(!req.params.name) {
  var query = {}
}else {
  var query = {
    title: req.params.name 
  };
}
  fileService.listFiles(query).then((result)=>{
    // console.log(result);
    let list = [];
    result.forEach((file) => {
      list.push({
          "title" : file.title,
          "file_name": file.fileName,
          "url": file.path
      })
    } );
    res.json(list);
  });
  


});

router.delete('/filedelete/:fileName', (req, res) => {
  console.log(req.params.fileName)
  let query = {
    fileName: req.params.fileName
  }
  fileService.removeFile(query).then((_result) => {
    if(!_result){
      res.json({"status": "Cannot Delete"});
    }else
    fs.unlink(_result.path, () => {
      res.json({"Status": "File deleted", "file_name" : _result.fileName });
    })
    
  })
})

module.exports = router;
