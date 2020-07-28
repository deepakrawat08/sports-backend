const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressjwt = require("express-jwt");
const { check, validationResult } = require("express-validator");
// const redi  = require('jwt-redis')

//Sign Up controller
exports.signUp = (req, res) => {
	//for checking validation result form request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);
		return res.status(422).json({
			error: errors.array()[0].msg,
		});
	}

	//creating user object with information provided by request body
	const user = new User(req.body);
	user.save((err, user) => {
		console.log(user);
		console.log(err);

		if (err) {
			console.log(err);
			return res.status(400).json({
				error:
					"Used information are already saved in database. Please enter correct information",
			});
		}
		console.log(user);

		res.json({
			_id: user._id,
			firstName: user.firstName,
			lastName: user.lastName,
			rollNumber: user.rollNumber,
			year: user.year,
			branch: user.branch,
			mobile: user.mobile,
			email: user.email,
		});
	});
};
//Sign In controller
exports.signin = (req, res) => {
	const { email, password } = req.body;

	//for checking validation result form request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);
		return res.status(422).json({
			error: errors.array()[0].msg,
		});
	}

	//checking the user information in db
	User.findOne({ email }, (error, user) => {
		if (error || !user) {
			return res.json({
				error: `${email} is not registered.`,
			});
		}
		//check passowrd matched or not
		if (!user.authenticate(password)) {
			return res.json({
				error: "password did not match",
			});
		}
		//creating token using jwt(jsonwebtoken)
		var token = jwt.sign({ _id: user._id }, process.env.SECRET);
		//saving token in cookie
		res.cookie("token", token, { expire: new Date(Date.now() + 99999) });
		return res.json({
			token: token,
			user: {
				_id: user._id,
				name: user.firstName + " " + user.lastName,
				rollNo: user.rollNumber,
				branch: user.branch,
				year: user.year,
				email: user.email,
				mobileNo: user.mobileNo,
				role: user.role
			},
		});
	});
};

exports.signOut = (req, res) => {
	//clear token form cookie for signout
	console.log(res.cookies);
	res.clearCookie("token");
	res.json({
		message: "Signed out successfully",
	});
};

//middlewares
//isSignedIn middleware to check user is signed in or not
//expressjwt parse the token generated by jsonwebtoken
//the decoded JWT payload is available on the request object
exports.isSignedIn = expressjwt({
	secret: process.env.SECRET,
	userProperty: "auth",
});
//isAdmin middleware
//check if user role is 0, if yes, send "not admin", else procced next()
exports.isAdmin = (req, res, next) => {
	if (req.profile.role === 0) {
		return res.status(403).json({
			error: "Not Admin",
		});
	}
	next();
};
//isAuthenticated middleware
//by checking current logged in user to req.auth(payload provided by express-jwt)
exports.isAuthenticated = (req, res, next) => {
	const check = req.profile && req.auth && req.profile._id && req.auth._id;
	if (!check) {
		return res.status(403).json({
			error: "Access Denied",
		});
	}
	next();
};
