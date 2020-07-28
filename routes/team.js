const express = require('express')
const router = express.Router()

const {isSignedIn,isAuthenticated, isAdmin} = require('../controllers/auth')
const {getUserById, getUserByRollNo} = require('../controllers/user')
const {addTeam,getTeamByPlayer, getAllTeam, getAllApprovedTeam,getAllTeamByStatus, updateTeamStatus,getAllTeamByStatusa} = require('../controllers/team')

router.param('userId',getUserById)
router.param('rollNumber',getUserByRollNo)
router.post('/addteam/:userId',isSignedIn, isAuthenticated, addTeam)

router.post('/getTeamByPlayer/:userId', isSignedIn, isAuthenticated, getTeamByPlayer)
router.get('/getAllTeams', getAllTeam)
router.get('/getAllApprovedTeams/', getAllApprovedTeam)
router.post('/getAllTeamsByStatus/:userId',isSignedIn,isAuthenticated,isAdmin,getAllTeamByStatus)
router.post('/getAllTeamsByStatusa/:userId',isSignedIn,isAuthenticated,isAdmin,getAllTeamByStatusa)
router.put('/updateStatus/team/:userId', isSignedIn, isAuthenticated, isAdmin, updateTeamStatus)


module.exports = router