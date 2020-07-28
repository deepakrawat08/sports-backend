const express = require('express')
const router = express.Router()

const {getUserById,getUser,updateUser,getByRollNo,updateRole, getCoordinator} =require('../controllers/user')
const {isSignedIn,isAuthenticated,isAdmin} = require('../controllers/auth')

//getUserById param
router.param('userId',getUserById)

//route for getUser
router.get('/getUser/:userId', isSignedIn, isAuthenticated, getUser)
//route for getUser by rollNo
router.post('/getUserByRollNo/:userId', isSignedIn,isAuthenticated, getByRollNo)

//route for updateUser
router.put('/updateUser/:userId',isSignedIn,isAuthenticated,updateUser)


//route for making coordinator 
router.put('/updateRole/asCoordinator/:userId', isSignedIn, isAuthenticated, isAdmin, updateRole)

router.get('/getCoordinators',getCoordinator)

module.exports = router