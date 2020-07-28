const Team = require("../models/team");
const User = require("../models/user");
const { resolve } = require("path");
const { DH_CHECK_P_NOT_SAFE_PRIME } = require("constants");
const { triggerAsyncId } = require("async_hooks");

exports.addTeam = (req, res) => {
	const { teamCaptain, year, game, teamPlayers } = req.body;
	Team.find({ year: year, game: game }, (err, teams) => {
		let maxTeamCount = 0;
		teams.forEach((team, index) => {
			let teamIndex = Number(team.teamCode.slice(4));
			if (teamIndex > maxTeamCount) {
				maxTeamCount = teamIndex;
			}
		});

		const team = new Team(req.body);
		let newTeamIndex = String(maxTeamCount + 1);
		team.teamCode = game + year + newTeamIndex;

		let regNo = "";

		Team.find({}, (err, teams) => {
			if (err) {
				return res.json({
					error:
						"Something went wrong. Try again later(generating regNo failed)",
				});
			}
			let maxRegNo = 0;
			teams.forEach((team, i) => {
				if (maxRegNo < team.regNo.slice(1)) {
					maxRegNo = Number(team.regNo.slice(1));
				}
			});
			regNo = "T" + Number(maxRegNo + 1);

			team.regNo = regNo;
			console.log(team);

			team.save((err, team) => {
				if (err) {
					return res.json({ error: err._message });
				}
				User.find(
					{ rollNumber: { $in: team.teamPlayers } },
					(err, teamMember) => {
						let teamPlayersArray = [];
						teamMember.forEach((userVal) => {
							userVal.participate.push({
								teamCode: team.teamCode,
								game: team.game,
							});
							User.updateOne(
								{ rollNumber: userVal.rollNumber },
								{ $set: userVal },
								(err, user) => {
									console.log(err);
									console.log(user);
								}
							);
							let user = {
								name:
									userVal.firstName + " " + userVal.lastName,
								rollNo: userVal.rollNumber,
								branch: userVal.branch,
								year: userVal.year,
							};

							teamPlayersArray.push(user);
						});
						User.findOne(
							{ rollNumber: teamCaptain },
							(error, user) => {
								user.participate.push({
									teamCode: team.teamCode,
									game: team.game,
								});
								User.updateOne(
									{ rollNumber: user.rollNumber },
									{ $set: user },
									(error, response) => {
										console.log(response);
										console.log(error);
									}
								);
								let captainFullName =
									user.firstName + " " + user.lastName;

								return res.json({
									regNo: team.regNo,
									teamCode: team.teamCode,
									teamCaptain: captainFullName,
									year: team.year,
									game: team.game,
									teamPlayers: teamPlayersArray,
								});
							}
						);
					}
				);
			});
		});
	});
};
// needs to fix bugs here ::::: done but need checks
exports.getTeamByPlayer = (req, res) => {
	const { teamCodes } = req.body;
	
	Team.aggregate([
		{
			$lookup: {
				from: "users",
				localField: "teamPlayers",
				foreignField: "rollNumber",
				as: "players",
			},
		},
	]).exec((err, result) => {
		let teams = result.filter((team) => {
			return teamCodes.includes(team.teamCode);
		});
		
		let allDbTeam = [];
		teams.forEach((val, i) => {
			let temp = [];
			val.players.forEach((user) => {
				let teamPlayer = {
					playerName: user.firstName + " " + user.lastName,
					playerRollNo: user.rollNumber,
					playerBranch: user.branch,
					playerYear: user.year,
				};
				temp.push(teamPlayer);
			});

			User.findOne({ rollNumber: val.teamCaptain }).exec(
				(err, captain) => {
					User.findOne({ rollNumber: val.approvedBy }).exec(
						(err, profile) => {
							let customTeam = {
								teamRegNo: val.regNo,
								teamCode: val.teamCode,
								teamPlayer: temp,
								captainFullName:
									captain.firstName + " " + captain.lastName,
								captainRollNo: captain.rollNumber,
								captainBranch: captain.branch,
								captainYear: captain.year,
								teamYear: val.year,
								teamGame: val.game,
								teamCreatedAt: val.createdAt,
							};
							if (profile) {
								customTeam.approvedByName =
									profile.firstName + " " + profile.lastName;
								customTeam.approvedByRollNo =
									profile.rollNumber;
							}

							allDbTeam.push(customTeam);

							if (allDbTeam.length === teams.length) {
								return res.json(allDbTeam);
							}
						}
					);
				}
			);
		});
	});
	// Team.findOne({ teamCode: { $in: teamCode } }).exec((error, team) => {
	// 	if (error || !team) {
	// 		return res.json({
	// 			error: error,
	// 		});
	// 	}
	// 	console.log(team)
	// 	const {
	// 		teamPlayers,
	// 		approved,
	// 		approvedBy,
	// 		teamCaptain,
	// 		year,
	// 		game,
	// 		teamCode,
	// 		regNo,
	// 	} = team;
	// 	console.log(team);
	// 	let allDbTeam = [];
	// 	User.findOne({ _id: team.teamCaptain }, (error, captain) => {
	// 		let temp = [];
	// 		User.findOne({ rollNumber: team.approvedBy }).exec(
	// 			(err, profile) => {
	// 				team.teamPlayers.forEach((playerId, iPlayer) => {
	// 					User.findOne({ rollNumber: playerId }).exec(
	// 						(error, user) => {
	// 							let teamPlayer = {
	// 								playerName:
	// 									user.firstName + " " + user.lastName,
	// 								playerRollNo: user.rollNumber,
	// 								playerBranch: user.branch,
	// 								playerYear: user.year,
	// 							};
	// 							temp.push(teamPlayer);

	// 							if (iPlayer === team.teamPlayers.length - 1) {
	// 								let customTeam = {
	// 									teamRegNo: team.regNo,
	// 									teamCode: team.teamCode,
	// 									teamPlayer: temp,
	// 									captainFullName:
	// 										captain.firstName +
	// 										" " +
	// 										captain.lastName,
	// 									captainRollNo: captain.rollNumber,
	// 									captainBranch: captain.branch,
	// 									captainYear: captain.year,
	// 									teamYear: team.year,
	// 									teamGame: team.game,
	// 									teamCreatedAt: team.createdAt,
	// 								};
	// 								if (profile) {
	// 									customTeam.approvedByName =
	// 										profile.firstName +
	// 										" " +
	// 										profile.lastName;
	// 									customTeam.approvedByRollNo =
	// 										profile.rollNumber;
	// 								}
	// 								allDbTeam.push(customTeam);
	// 							}

	// 							if (iPlayer === team.teamPlayers.length - 1) {
	// 								console.log(allDbTeam);
	// 								return res.json(allDbTeam);
	// 							}
	// 						}
	// 					);
	// 				});
	// 			}
	// 		);
	// 	});
	// });
};

//returns all teams
exports.getAllTeam = (req, res) => {
	Team.find().exec((error, teams) => {
		console.log(teams);
		console.log(error);
		if (error || !teams) {
			return res.json({
				error: error,
			});
		}
		let allDbTeam = [];
		teams.forEach((team, iTeam) => {
			User.findOne({ _id: team.teamCaptain }, (error, captain) => {
				let temp = [];
				team.teamPlayers.forEach((playerId, iPlayer) => {
					User.findOne({ _id: playerId }).exec((error, user) => {
						let teamPlayer = {
							playerName: user.firstName + " " + user.lastName,
							playerRollNo: user.rollNumber,
							playerBranch: user.branch,
							playerYear: user.year,
						};
						temp.push(teamPlayer);

						if (iPlayer === team.teamPlayers.length - 1) {
							let customTeam = {
								teamRegNo: team.regNo,
								teamCode: team.teamCode,
								teamPlayer: temp,
								captainFullName:
									captain.firstName + " " + captain.lastName,
								captainRollNo: captain.rollNumber,
								captainBranch: captain.branch,
								captainYear: captain.year,
								teamYear: team.year,
								teamGame: team.game,
								teamCreatedAt: team.createdAt,
							};

							allDbTeam.push(customTeam);
						}

						if (
							iTeam === teams.length - 1 &&
							iPlayer === team.teamPlayers.length - 1
						) {
							return res.json({ teams: allDbTeam });
						}
					});
				});
			});
		});
	});
};

//used as public controller and gives reutrns  all approved team's
exports.getAllApprovedTeam = (req, res) => {
	Team.aggregate([
		{
			$lookup: {
				from: "users",
				localField: "teamPlayers",
				foreignField: "rollNumber",
				as: "players",
			},
		},
	]).exec((err, result) => {
		let teams = result.filter((team) => {
			return team.approved === "a";
		});
		let allDbTeam = [];
		teams.forEach((val) => {
			let temp = [];
			val.players.forEach((user) => {
				let teamPlayer = {
					playerName: user.firstName + " " + user.lastName,
					playerRollNo: user.rollNumber,
					playerBranch: user.branch,
					playerYear: user.year,
				};
				temp.push(teamPlayer);
			});

			User.findOne({ rollNumber: val.teamCaptain }).exec(
				(err, captain) => {
					User.findOne({ rollNumber: val.approvedBy }).exec(
						(err, profile) => {
							let customTeam = {
								teamRegNo: val.regNo,
								teamCode: val.teamCode,
								teamPlayer: temp,
								captainFullName:
									captain.firstName + " " + captain.lastName,
								captainRollNo: captain.rollNumber,
								captainBranch: captain.branch,
								captainYear: captain.year,
								teamYear: val.year,
								teamGame: val.game,
								teamCreatedAt: val.createdAt,
							};
							if (profile) {
								customTeam.approvedByName =
									profile.firstName + " " + profile.lastName;
								customTeam.approvedByRollNo =
									profile.rollNumber;
							}

							allDbTeam.push(customTeam);
							if (allDbTeam.length === teams.length) {
								console.log(allDbTeam);
								return res.json({ teams: allDbTeam });
							}
						}
					);
				}
			);
		});
	});
};

//for admin and coordinator , to update status of team registration
exports.updateTeamStatus = (req, res) => {
	console.log(req.body);
	//coordinator is rollNumber
	const { status, teamCode, coordinator } = req.body;
	Team.updateOne(
		{ teamCode: teamCode },
		{ $set: { approved: status, approvedBy: coordinator } },
		(error, response) => {
			console.log(error);
			console.log(response);
			if (error) {
				return res.json({
					error: error,
				});
			}
			if (status === "a") {
				return res.json({
					accept: `${teamCode} is  ACCEPTED by ${coordinator}`,
				});
			} else if (status === "r") {
				return res.json({
					reject: `${teamCode} is  REJECTED by ${coordinator}`,
				});
			}
		}
	);
};
//Only for admin and gives result on basis of status
exports.getAllTeamByStatus = (req, res) => {
	const { status } = req.body;
	Team.aggregate([
		{
			$lookup: {
				from: "users",
				localField: "teamPlayers",
				foreignField: "rollNumber",
				as: "players",
			},
		},
	]).exec((err, result) => {
		let teams = result.filter((team) => {
			return team.approved === status;
		});
		let allDbTeam = [];
		teams.forEach((val, i) => {
			let temp = [];
			val.players.forEach((user) => {
				let teamPlayer = {
					playerName: user.firstName + " " + user.lastName,
					playerRollNo: user.rollNumber,
					playerBranch: user.branch,
					playerYear: user.year,
				};
				temp.push(teamPlayer);
			});

			User.findOne({ rollNumber: val.teamCaptain }).exec(
				(err, captain) => {
					User.findOne({ rollNumber: val.approvedBy }).exec(
						(err, profile) => {
							let customTeam = {
								teamRegNo: val.regNo,
								teamCode: val.teamCode,
								teamPlayer: temp,
								captainFullName:
									captain.firstName + " " + captain.lastName,
								captainRollNo: captain.rollNumber,
								captainBranch: captain.branch,
								captainYear: captain.year,
								teamYear: val.year,
								teamGame: val.game,
								teamCreatedAt: val.createdAt,
							};
							if (profile) {
								customTeam.approvedByName =
									profile.firstName + " " + profile.lastName;
								customTeam.approvedByRollNo =
									profile.rollNumber;
							}

							allDbTeam.push(customTeam);
							if (allDbTeam.length === teams.length) {
								console.log(allDbTeam);
								return res.json(allDbTeam);
							}
						}
					);
				}
			);
		});
	});
};
//Only for coordinators, and gives result on basis of status and coordinator's game
exports.getAllTeamByStatusa = (req, res) => {
	const { status, game } = req.body;
	Team.aggregate([
		{
			$lookup: {
				from: "users",
				localField: "teamPlayers",
				foreignField: "rollNumber",
				as: "players",
			},
		},
	]).exec((err, result) => {
		let teams = result.filter((team) => {
			return team.approved === status && team.game === game;
		});

		if (teams.length === 0) {
			return res.json([]);
		}
		let allDbTeam = [];
		teams.forEach((val, i) => {
			let temp = [];
			val.players.forEach((user) => {
				let teamPlayer = {
					playerName: user.firstName + " " + user.lastName,
					playerRollNo: user.rollNumber,
					playerBranch: user.branch,
					playerYear: user.year,
				};
				temp.push(teamPlayer);
			});

			User.findOne({ rollNumber: val.teamCaptain }).exec(
				(err, captain) => {
					User.findOne({ rollNumber: val.approvedBy }).exec(
						(err, profile) => {
							let customTeam = {
								teamRegNo: val.regNo,
								teamCode: val.teamCode,
								teamPlayer: temp,
								captainFullName:
									captain.firstName + " " + captain.lastName,
								captainRollNo: captain.rollNumber,
								captainBranch: captain.branch,
								captainYear: captain.year,
								teamYear: val.year,
								teamGame: val.game,
								teamCreatedAt: val.createdAt,
							};
							if (profile) {
								customTeam.approvedByName =
									profile.firstName + " " + profile.lastName;
								customTeam.approvedByRollNo =
									profile.rollNumber;
							}

							allDbTeam.push(customTeam);
							if (allDbTeam.length === teams.length) {
								console.log(allDbTeam);
								return res.json(allDbTeam);
							}
						}
					);
				}
			);
		});
	});
};
