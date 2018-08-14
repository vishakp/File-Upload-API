var mongoose = require('mongoose');



var userSchema = mongoose.Schema({
	uname : { type: String, default: "" },
	password : { type: String, default: "" },
	email : { type: String, default: "" },
	filesUploaded: [String]
}, 
{ 
	timestamps: true 
});





module.exports = mongoose.model('User', userSchema);
