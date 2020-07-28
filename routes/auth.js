const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const {
	signUp,
	signin,
	isSignedIn,
	signOut,
	isAdmin,
	isAuthenticated,
} = require("../controllers/auth");

//signup route
router.post(
	"/signup",
	check("email", "enter valid email address").isEmail(),
	check("rollNumber", "Roll Number should consist of 10 digits").isLength({max:10,min:10}),
	check("mobileNo", "Mobile Number should consist of 10 digits").isLength({max:10,min:10}),
	check("password", "password should be at least 4 digits").isLength({
		min: 4,
	}),
	signUp
);
//signin route
router.post(
	"/signin",
	check("email", "enter valid email address").isEmail(),
	check("password", "password should be at least 4 digits").isLength({
		min: 4,
	}),

	signin
);
//signout route
router.get("/signout", isSignedIn, signOut);

//testroute
router.get("/checkAdmin", isSignedIn, isAdmin);
router.get("/isSignedIn", isSignedIn, (req, res) => {
	res.json({
		isSignedIn: "yes signed in",
		auth: req.auth,
	});
});

module.exports = router;

//testroute
router.get("/testroute");
