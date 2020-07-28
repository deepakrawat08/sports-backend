const Individual = require("../models/individual");
const individual = require("../models/individual");
const User = require("../models/user");

exports.individualRegistration = (req, res) => {
	const { userId, rollNumber, game } = req.body;
	console.log(req.body);

	let regNo = "";
	Individual.find({}, (err, players) => {
		if (err) {
			return res.json({
				error:
					"Something went wrong. Try again later(generating regNo failed)",
			});
		}
		let maxRegNo = 0;
		players.forEach((player, i) => {
			if (maxRegNo < player.regNo.slice(1)) {
				maxRegNo = Number(player.regNo.slice(1));
			}
		});
		regNo = "I" + Number(maxRegNo + 1);

		const individualReg = new Individual();
		individualReg.regNo = regNo;
		individualReg.userId = userId;
		individualReg.rollNumber = rollNumber;
		individualReg.game = game;

		Individual.findOne(
			{ userId: userId, rollNumber: rollNumber, game: game },
			(err, playerIReg) => {
				if (err || !playerIReg) {
					individualReg.save((error, player) => {
						if (error) {
							return res.json({
								error: "Not able to save registration:" + error,
							});
						}

						User.findOne(
							{ rollNumber: rollNumber },
							(err, user) => {
								user.participate.push({
									regNo: player.regNo,
									game: player.game,
								});
								User.updateOne(
									{ rollNumber: user.rollNumber },
									{ $set: user },
									(error, response) => {
										console.log(response);
										console.log(error);
										return res.json({
											regNo: player.regNo,
											userId:
												user.firstName +
												" " +
												user.lastName,
											rollNumber: player.rollNumber,
											game: player.game,
										});
									}
								);
							}
						);
					});
				} else {
					return res.json({
						error: `${rollNumber} is already registered in ${getGameName(
							game
						)}`,
					});
				}
			}
		);
	});
};
const getGameName = (game) => {
	switch (game) {
		case "CR": {
			return "Cricket";
		}
		case "FB": {
			return "Foot Ball";
		}
		case "VB": {
			return "Volley Ball";
		}
		case "BD": {
			return "Badminton";
		}
		case "TT": {
			return "Table Tennis";
		}
		case "CH": {
			return "Chess";
		}
	}
};

//TODO: get individual registration
exports.getIndividualPlayerByRollNo = (req, res) => {
	const { rollNo } = req.body;
	Individual.aggregate([
		{
			$lookup: {
				from: "users",
				localField: "rollNumber",
				foreignField: "rollNumber",
				as: "player",
			},
		},
	]).exec((error, individuals) => {
		if (error || !individuals) {
			return res.json({
				error: "Something went wrong. Please try again later!",
			});
		}
		if (individuals.length === 0) {
			return res.json({
				error: "No Record found",
			});
		}
		let individualsArray = individuals.filter((individual) => {
			return individual.rollNumber === rollNo;
		});

		console.log(individualsArray.length);
		if (individualsArray.length === 0) {
			return res.json({
				error: "No Record Found",
			});
		}
		// console.log(individualsArray);
		let allIndividual = [];
		individualsArray.forEach((individual) => {
			// console.log(individual);
			User.findOne(
				{ rollNumber: individual.approvedBy },
				(err, profile) => {
					if (err) {
						return res.json({
							error:
								"Something went wrong. Please try again later!",
						});
					}
					let temp = {
						regNo: individual.regNo,
						fullName:
							individual.player[0].firstName +
							" " +
							individual.player[0].lastName,
						branch: individual.player[0].branch,
						year: individual.player[0].year,
						rollNo: individual.rollNumber,
						game: individual.game,
						status: individual.approved,
					};
					// console.log(temp);
					// console.log(temp);

					if (profile) {
						temp.approvedByName =
							profile.firstName + " " + profile.lastName;
						temp.approvedByRollNo = profile.rollNumber;
					}
					allIndividual.push(temp);

					if (allIndividual.length === individualsArray.length) {
						console.log(allIndividual);

						return res.json(allIndividual);
					}
				}
			);
		});
	});
};

//returns all teams
exports.getAllIndividualReg = (req, res) => {
	Individual.aggregate([
		{
			$lookup: {
				from: "users",
				localField: "rollNumber",
				foreignField: "rollNumber",
				as: "player",
			},
		},
	]).exec((error, individuals) => {
		if (error || !individuals) {
			return res.json({
				error: "Something went wrong. Please try again later!",
			});
		}

		// console.log(individualsArray);
		let allIndividual = [];
		individuals.forEach((individual) => {
			// console.log(individual);
			User.findOne(
				{ rollNumber: individual.approvedBy },
				(err, profile) => {
					if (err) {
						return res.json({
							error:
								"Something went wrong. Please try again later!",
						});
					}
					let temp = {
						regNo: individual.regNo,
						fullName:
							individual.player[0].firstName +
							" " +
							individual.player[0].lastName,
						year: individual.player[0].year,
						rollNo: individual.rollNumber,
						game: individual.game,
						status: individual.approved,

						playerRegNo: individual.regNo,
						playerName:
							individual.player[0].firstName +
							" " +
							individual.player[0].lastName,
						playerRollNo: individual.player[0].rollNumber,
						playeryear: individual.player[0].year,
						playerBranch: individual.player[0].branch,
						playerGame: individual.game,
						approved: individual.approved,
						createdAt: individual.createdAt,
					};

					if (profile) {
						temp.approvedByName =
							profile.firstName + " " + profile.lastName;
						temp.approvedByRollNo = profile.rollNumber;
					}
					allIndividual.push(temp);

					if (allIndividual.length === individuals.length) {
						console.log(allIndividual);
						return res.json({
							individualRegs: allIndividual,
						});
					}
				}
			);
		});
	});
};

//used as public controller and gives reutrns  all approved individual's
exports.getAllApprovedIndividualReg = (req, res) => {
	Individual.aggregate([
		{
			$lookup: {
				from: "users",
				localField: "rollNumber",
				foreignField: "rollNumber",
				as: "player",
			},
		},
	]).exec((error, individuals) => {
		if (error || !individuals) {
			return res.json({
				error: "Something went wrong. Please try again later!",
			});
		}
		let individualsArray = individuals.filter((individual) => {
			return individual.approved === "a";
		});

		// console.log(individualsArray);
		let allIndividual = [];
		individualsArray.forEach((individual) => {
			// console.log(individual);
			User.findOne(
				{ rollNumber: individual.approvedBy },
				(err, profile) => {
					if (err) {
						return res.json({
							error:
								"Something went wrong. Please try again later!",
						});
					}
					let temp = {
						playerRegNo: individual.regNo,
						playerName:
							individual.player[0].firstName +
							" " +
							individual.player[0].lastName,
						playerRollNo: individual.rollNumber,
						playeryear: individual.player[0].year,
						playerBranch: individual.player[0].branch,
						playerGame: individual.game,
						approved: individual.approved,
						createdAt: individual.createdAt,
					};
					// console.log(temp);
					// console.log(temp);

					if (profile) {
						temp.approvedByName =
							profile.firstName + " " + profile.lastName;
						temp.approvedByRollNo = profile.rollNumber;
					}
					allIndividual.push(temp);

					if (allIndividual.length === individualsArray.length) {
						console.log(allIndividual);
						return res.json({ individualRegs: allIndividual });
					}
				}
			);
		});
	});
};

//Only for admin and gives result on basis of status
exports.getAllIndividualByStatus = (req, res) => {
	const { status } = req.body;
	Individual.aggregate([
		{
			$lookup: {
				from: "users",
				localField: "rollNumber",
				foreignField: "rollNumber",
				as: "player",
			},
		},
	]).exec((error, individuals) => {
		if (error || !individuals) {
			return res.json({
				error: "Something went wrong. Please try again later!",
			});
		}
		let individualsArray = individuals.filter((individual) => {
			return individual.approved === status;
		});

		// console.log(individualsArray);
		let allIndividual = [];
		individualsArray.forEach((individual) => {
			// console.log(individual);
			User.findOne(
				{ rollNumber: individual.approvedBy },
				(err, profile) => {
					if (err) {
						return res.json({
							error:
								"Something went wrong. Please try again later!",
						});
					}
					let temp = {
						playerRegNo: individual.regNo,
						playerName:
							individual.player[0].firstName +
							" " +
							individual.player[0].lastName,
						playerRollNo: individual.rollNumber,
						playeryear: individual.player[0].year,
						playerBranch: individual.player[0].branch,
						playerGame: individual.game,
						approved: individual.approved,
						createdAt: individual.createdAt,
					};

					if (profile) {
						temp.approvedByName =
							profile.firstName + " " + profile.lastName;
						temp.approvedByRollNo = profile.rollNumber;
					}
					allIndividual.push(temp);

					if (allIndividual.length === individualsArray.length) {
						console.log(allIndividual);
						return res.json(allIndividual);
					}
				}
			);
		});
	});
	// Individual.find({ approved: status }).exec((error, individualRegs) => {
	// 	if (error || !individualRegs) {
	// 		return res.json({
	// 			error: error,
	// 		});
	// 	}

	// 	if (individualRegs.length === 0) {
	// 		return res.json([]);
	// 	}
	// 	let players = [];
	// 	individualRegs.forEach((player, iPlayer) => {
	// 		User.findOne({ _id: player.userId }).exec((err, user) => {
	// 			let customPlayer = {
	// 				playerRegNo: player.regNo,
	// 				playerName: user.firstName + " " + user.lastName,
	// 				playerRollNo: player.rollNumber,
	// 				playeryear: user.year,
	// 				playerBranch: user.branch,
	// 				playerGame: player.game,
	// 				approved: player.approved,
	// 				createdAt: player.createdAt,
	// 			};

	// 			players.push(customPlayer);

	// 			if (iPlayer == individualRegs.length - 1) {
	// 				return res.json(players);
	// 			}
	// 		});
	// 	});
	// });
};

//Only for coordinators, and gives result on basis of status and coordinator's game
exports.getAllIndividualByStatusAndCoord = (req, res) => {
	const { status, game } = req.body;
	console.log(req.body);
	Individual.aggregate([
		{
			$lookup: {
				from: "users",
				localField: "rollNumber",
				foreignField: "rollNumber",
				as: "player",
			},
		},
	]).exec((error, individuals) => {
		if (error || !individuals) {
			return res.json({
				error: "Something went wrong. Please try again later!",
			});
		}
		let individualsArray = individuals.filter((individual) => {
			return individual.approved === status && individual.game === game;
		});

		// console.log(individualsArray);
		let allIndividual = [];
		individualsArray.forEach((individual) => {
			// console.log(individual);
			User.findOne(
				{ rollNumber: individual.approvedBy },
				(err, profile) => {
					if (err) {
						return res.json({
							error:
								"Something went wrong. Please try again later!",
						});
					}
					let temp = {
						playerRegNo: individual.regNo,
						playerName:
							individual.player[0].firstName +
							" " +
							individual.player[0].lastName,
						playerRollNo: individual.rollNumber,
						playeryear: individual.player[0].year,
						playerBranch: individual.player[0].branch,
						playerGame: individual.game,
						approved: individual.approved,
						createdAt: individual.createdAt,
					};

					if (profile) {
						temp.approvedByName =
							profile.firstName + " " + profile.lastName;
						temp.approvedByRollNo = profile.rollNumber;
					}
					allIndividual.push(temp);

					if (allIndividual.length === individualsArray.length) {
						console.log(allIndividual);
						return res.json(allIndividual);
					}
				}
			);
		});
	});
	// Individual.find({ approved: status, game: game }).exec(
	// 	(error, individualRegs) => {
	// 		if (error || !individualRegs) {
	// 			return res.json({
	// 				error: error,
	// 			});
	// 		}
	// 		console.log(individualRegs);
	// 		if (individualRegs.length === 0) {
	// 			return res.json([]);
	// 		}
	// 		let players = [];
	// 		individualRegs.forEach((player, iPlayer) => {
	// 			User.findOne({ _id: player.userId }).exec((err, user) => {
	// 				let customPlayer = {
	// 					playerRegNo: player.regNo,
	// 					playerName: user.firstName + " " + user.lastName,
	// 					playerRollNo: player.rollNumber,
	// 					playeryear: user.year,
	// 					playerBranch: user.branch,
	// 					playerGame: player.game,
	// 					approved: player.approved,
	// 					createdAt: player.createdAt,
	// 				};

	// 				players.push(customPlayer);

	// 				if (iPlayer == individualRegs.length - 1) {
	// 					return res.json(players);
	// 				}
	// 			});
	// 		});
	// 	}
	// );
};

//for both admin and coordinator and used to update status of individual registration
exports.updateIndividualStatus = (req, res) => {
	console.log(req.body);
	const { status, regNo, coordinator } = req.body;

	Individual.updateOne(
		{ regNo: regNo },
		{ $set: { approved: status, approvedBy: coordinator } }
	).exec((error, response) => {
		console.log(error);
		console.log(response);
		if (error) {
			return res.json({
				error: error,
			});
		}
		if (status === "a") {
			return res.json({
				accept: `${regNo} is  ACCEPTED`,
			});
		} else if (status === "r") {
			return res.json({
				reject: `${regNo} is  REJECTED`,
			});
		}
	});
};
