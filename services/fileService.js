var file = require('../models/fileModel')

module.exports.addFile = (data) => {
    var newFile = new file(data).save();
    
    return newFile;
};

module.exports.listFiles = (query = {}, project = {}) => {
    return file.find(query, project).lean().exec();
};

module.exports.removeFile = (query = {}) => {
   return file.findOneAndRemove(query).lean().exec()
};

module.exports.updateTitle = (query = {}, update = {}) => {
    return file.update(query, update).lean().exec();
}