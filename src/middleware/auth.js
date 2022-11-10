const jwt = require("jsonwebtoken");
const studentModel = require('../model/studentModel')
const mongoose = require("mongoose");

const authentication = async function (req, res, next) {
  try {

    let token = req.headers["x-api-key"];

    if (!token) return res.status(400).send({ status: false, msg: "Enter token in header" });

    jwt.verify(token,"Assignment",function(error,decoded){

      if(error)return res.status(401).send({ status: false, msg: "Invalid Token" });

      else 
      req.userId = decoded.userId;
      next()
   });   
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

const authorization = async function (req, res, next) {
  try {

    let studentId = req.params.studentId;
    
    if(studentId){

    if (!mongoose.isValidObjectId(studentId))return res.status(400).send({ status: false, msg: "Please enter studentId as a valid ObjectId"});

      let findStudent = await studentModel.findById(studentId);
      if (findStudent) {
        if (req.userId != findStudent.userId)return res.status(403).send({ status: false, msg:"Author is not authorized to access this data"});
      }
    }
    next();  

  } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports = { authentication, authorization};