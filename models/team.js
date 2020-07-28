const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const teamSchema = new mongoose.Schema({
	regNo: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	teamCode: {
		type: String,
		trim: true,
		required: true,
		unique: true,
	},
	teamCaptain: {
		required:true,
		type: String,
	},
	year: {
		type: String,
		required:true,
		enum: ["1Y", "2Y", "3Y", "4Y"],
	},
	game: {
		type: String,
		required:true,
		enum: ["CR", "VB", "FB"],
	},
	teamPlayers: {
		required:true,
		type: Array,
	},
	approved: {
		type: String,
		enum: ["p", "a", "r"],//p:Pending, a:accepted,r:rejected
		default:"p"
	},
	approvedBy: {
		type: String,
		default: "",
		trim:true
	}
},{timestamps:true});
module.exports = mongoose.model("Team", teamSchema);
