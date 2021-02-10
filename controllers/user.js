const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { exec } = require("child_process");
const createError = require("http-error");

exports.getUserById = (req, res, next, id) => {
	User.findById(id, (err, user) => {
		if (err || !user) {
			if (!user) {
				return res.json({
					error: new createError.NotFound("User not found"),
				});
			} else {
				return res.json({
					error: new createError.InternalServerError(err),
				});
			}
		}
		req.profile = user;
		next();
	});
};

exports.getUser = (req, res) => {
	return res.json(req.profile);
};

exports.updateUser = (req, res) => {
	const user = req.body;
	User.findByIdAndUpdate(
		{ _id: req.profile._id },
		{ $set: user },
		{ new: true, useFindAndModify: false },
		(err, user) => {
			if (err || !user) {
				if (!user) {
					return res.json({
						error: new createError.NotFound("User not found"),
					});
				} else {
					return res.json({
						error: new createError.InternalServerError(err),
					});
				}
			}
			//creating token using jwt(jsonwebtoken)
			var token = jwt.sign({ _id: user._id }, process.env.SECRET);
			//saving token in cookie
			res.cookie("token", token, {
				expire: new Date(Date.now() + 99999),
			});
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
					role: user.role,
				},
			});
		}
	);
};

exports.getByRollNo = (req, res) => {
	const rollNo = req.body.rollNo;

	User.findOne({ rollNumber: rollNo }, (error, user) => {
		
		if (error || !user) {
			if (!user) {
				return res.json({
					error: new createError.NotFound(
						rollNo + " is not registered"
					),
				});
			} else {
				return res.json({
					error: new createError.InternalServerError(err),
				});
			}
		}
		return res.json({
			_id: user._id,
			name: user.firstName + " " + user.lastName,
			rollNo: user.rollNumber,
			branch: user.branch,
			year: user.year,
			role: user.role,
			participate: user.participate,
			email: user.email,
			mobileNo: user.mobileNo,
		});
	});
};

exports.updateRole = (req, res) => {
	const { rollNumber, role } = req.body;
	User.findOneAndUpdate(
		{ rollNumber: rollNumber },
		{ $set: { role: role } },
		{
			returnNewDocument: true,
			useFindAndModify: false,
		}
	).exec((error, response) => {
		if (error || !response) {
			if (error) {
				return res.json({
					error:new createError.InternalServerError(err)
				});
			} else {
				return res.json({
					error: new createError.NotFound("Roll Number not found"),
				});
			}
		}
		return res.json({
			fullName: response.firstName + " " + response.lastName,
			rollNo: response.rollNumber,
			// year:response.year,
			// role: response.role,
		});
	});
};

exports.getCoordinator = (req, res) => {
	User.find({ role: /^c/ }).exec((error, coordList) => {
		
		if (error || !coordList) {
			if (error) {
				return res.json({
					error:new createError.InternalServerError(err)
				});
			} else {
				return res.json({
					error: new createError.NotFound("No Coordinator found"),
				});
			}
		}
		if (coordList.length === 0) {
			return res.json([])
		}
		let coordinators = [];
		coordList.forEach((user, i) => {
			let coord = {
				fullName: user.firstName + " " + user.lastName,
				year: user.year,
				role: user.role,
				rollNumber: user.rollNumber,
			};
			coordinators.push(coord);
			if (i === coordList.length - 1) {
				return res.json(coordinators);
			}
		});
	});
};
