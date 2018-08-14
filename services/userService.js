var User = require('../models/userModel');


// save users to the database
module.exports.createUser = function(data) {
	var newUser = new User(data).save();

	return newUser;
};

// List the users
module.exports.getUsers = function(query = {}, project = {}) {
	 return User.find(query, project).lean().exec();
};

// show user to the edit form
module.exports.getUser = function(query = {}) {
	 return User.findOne(query).lean().exec();// .lean will return the document as a plain JavaScript object rather than a mongoose document improve the perfomance for find query
};
//for checking the email
// module.exports.getUseremail = function(query = {}) {
// 	 return User.find(query).lean().exec();
// };

//post edit form
module.exports.updateUser = function(query = {}, data = {}) {
	 return User.update(query, data).exec();
};


module.exports.paginateUser = function(query = {}, options= {}) {
	return User.paginate(query, options);
};

module.exports.getFiles = (query, project = {filesUploaded: 1, _id:0}) => {
    return User.findOne(query, project).lean().exec();
}