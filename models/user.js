const mongoose = require("mongoose");
const { v1 } = require("uuid");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		maxlength: 32,
		required: true,
		trim: true,
	},
	lastName: {
		type: String,
		maxlength: 32,
		required: true,
		trim: true,
	},
	rollNumber: {
		type: String,
		unique: true,
		required: true,
		maxlength: 10,
		minlength: 10,
		trim: true,
	},
	year: {
		type: String,
		enum: ["1Y", "2Y", "3Y", "4Y"],
	},
	branch: {
		type: String,
		enum: ["CSE", "TT", "TC"],
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	mobileNo: {
		type: String,
		required: true,
		unique:false,
		maxlength: 10,
		minlength: 10,
		trim: true,
	},

	salt: String,
	encrypt_pass: {
		type: String,
		trim: true,
	},
	participate: {
		type: Array,
		default: [],
	},
	role: {
		type: String,
		default: 'u',
		enum:['a','c','u']
	},
	approved: {
		type: Boolean,
	},
},{timestamps:true});

userSchema
	.virtual("password")
	.set(function (password) {
		this._password = password;
		this.salt = v1();
		console.log(this.salt);
		console.log(this._password);
		this.encrypt_pass = this.securePass(password);
	})
	.get(function () {
		return this.password;
	});

userSchema.methods = {
	authenticate: function (password) {
		return this.securePass(password) == this.encrypt_pass	
	},
	securePass: function (password) {
		if (!password) return "";
		try {
			return crypto
				.createHmac("sha256", this.salt)
				.update(password)
				.digest("hex");
		} catch (error) {
			console.log(error);
		}
	},
};

module.exports = mongoose.model("User", userSchema);

