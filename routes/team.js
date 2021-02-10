const express = require('express')
const router = express.Router()

const {isSignedIn,isAuthenticated, isAdmin} = require('../controllers/auth')
const {getUserById} = require('../controllers/user')
const {addTeam,getTeamByPlayer, getAllTeam, getAllApprovedTeam,getAllTeamByStatus, updateTeamStatus,getAllTeamByStatusForCoordinator} = require('../controllers/team')

router.param('userId',getUserById)
router.post('/addteam/:userId',isSignedIn, isAuthenticated, addTeam)

router.post('/getTeamByPlayer/:userId', isSignedIn, isAuthenticated, getTeamByPlayer)
router.get('/getAllTeams', getAllTeam)
router.get('/getAllApprovedTeams/', getAllApprovedTeam)
router.post('/getAllTeamsByStatus/:userId',isSignedIn,isAuthenticated,isAdmin,getAllTeamByStatus)
router.post('/getAllTeamsByStatusa/:userId',isSignedIn,isAuthenticated,isAdmin,getAllTeamByStatusForCoordinator)
router.put('/updateStatus/team/:userId', isSignedIn, isAuthenticated, isAdmin, updateTeamStatus)


module.exports = router