var mongoose = require('mongoose');

var fileSchema = mongoose.Schema({
    fileName : { type: String, default: ' '},
    title: { type: String, default: ' '},
    type: { type: String, default: ' '},
    path: {type: String, default: ' '},
    Created: {type: Date, default: new Date()},
    size: {type: Number, default: '0'}
},
{
    timestamps: true
});

module.exports = mongoose.model('file', fileSchema);