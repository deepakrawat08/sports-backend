const express = require("express");
const router = express.Router();

const { getByRollNo, getUserById } = require("../controllers/user");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const {
	individualRegistration,
	getAllIndividualByStatus,
	getIndividualPlayerByRollNo,
	getAllIndividualReg,
	updateIndividualStatus,getAllApprovedIndividualReg,
	getAllIndividualByStatusAndCoord,
} = require("../controllers/individual");

router.param("userId", getUserById);
router.post(
	"/addIndividualReg/:userId",
	isSignedIn,
	isAuthenticated,
	individualRegistration
);

router.post(
	"/getIndividualRegistration/:userId",
	isSignedIn,
	isAuthenticated,
	getIndividualPlayerByRollNo
);
router.get("/getAllIndividualReg", getAllIndividualReg);
router.get("/getAllApprovedIndividualReg", getAllApprovedIndividualReg);
router.post(
	"/getAllIndividual/ByStatus/admin/:userId",
	isSignedIn,
	isAuthenticated,
	isAdmin,
	getAllIndividualByStatus
);
router.post(
	"/getAllIndividual/ByStatus/coordinator/:userId",
	isSignedIn,
	isAuthenticated,
	isAdmin,
	getAllIndividualByStatusAndCoord
);
router.put(
	"/updateStatus/individual/:userId",
	isSignedIn,
	isAuthenticated,
	isAdmin,
	updateIndividualStatus
);
module.exports = router;
