const express = require("express");
const router = express.Router();
const { authentication, authorization} = require('./middleware/auth')
const { createUser,loginStudent , createStudentData,getStudentData,updateStudentData,deleteStudentData} = require('./controller/studentController')

router.post('/createUser',createUser)
router.post('/login',loginStudent)
router.post('/addStudentData',createStudentData)
router.get('/getStudentData',authentication,authorization,getStudentData)
router.put('/updateStudentData/:studentId',authentication,authorization,updateStudentData)
router.delete('/deleteStudentData/:studentId',authentication,authorization,deleteStudentData)

module.exports=router;