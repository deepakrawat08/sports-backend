const mongoose = require("mongoose");
const User = require("./user");

const { ObjectId } = mongoose.Schema.Types;
const individual = new mongoose.Schema(
	{
		regNo: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		userId: {
			type: ObjectId,
			ref: User,
			trim: true,
		},
		rollNumber: {
			type: String,
			required: true,
			maxlength: 10,
			minlength: 10,
			trim: true,
		},
		game: {
			type: String,
			required: true,
			enum: ["BD", "TT", "CH"],
		},
		approved: {
			type: String,
			enum: ["p", "a", "r"], //p:Pending, a:accepted,r:rejected
			default: "p",
		},
		approvedBy: {
			type: String,
			default: "",
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Individual", individual);
