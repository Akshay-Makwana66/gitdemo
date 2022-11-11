const userModel=require('../model/userModel');
const jwt =require('jsonwebtoken');
const studentModel = require('../model/studentModel');
const bcrypt=require('bcrypt')
const mongoose= require('mongoose');
const saltRounds = 10;
// ### User API 
const createUser = async function (req, res) {                   
  try {
    let data= req.body;    
    if (Object.keys(data).length == 0)return res.status(400).send({ status: false, msg: "Body cannot be empty" });
 // Creating the user document in DB
 let {name,email,password}=data;

 if (!name) return res.status(400).send({ status: false, msg: "Please enter  Name" });
 if (typeof name !== "string")return res.status(400).send({ status: false, msg: " Please enter  name as a String" });
 if(!/^\w[a-zA-Z.]*$/.test(name)) return res.status(400).send({ status: false, msg: "The  name may contain only letters" });
 name = name.trim();

 if (!password)return res.status(400).send({ status: false, msg: "Please enter Password" });
 if (typeof password !== "string")return res.status(400).send({ status: false, msg: " Please enter password as a String" });
 if (!/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/.test(password))return res.status(400).send({status: false,msg: "Please enter min 8 letter password, with at least a symbol, upper and lower case letters and a number"});
 password = password.trim();

 if (!email) return res.status(400).send({ status: false, msg: "Please enter E-mail" });
 if (typeof email !== "string") return res.status(400).send({ status: false, msg: "Please enter email as a String" });
 if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) return res.status(400).send({ status: false, msg: "Entered email is invalid" });
  let duplicateEmail = await userModel.find({ email: email });
 if (duplicateEmail.length !== 0) return res.status(400).send({ status: false, msg: `${email} already exists` });

     data.password = await bcrypt.hash(data.password, saltRounds);
    let save = await userModel.create(data);  

    res.status(201).send({ status: true, data: save });  

  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

const loginStudent= async function(req,res){
  try{
    let data = req.body

    // Checks whether body is empty or not
    if (Object.keys(data).length == 0)return res.status(400).send({ status: false, msg: "Body cannot be empty"});

    // Checks whether email is entered or not
    if (!data.email) return res.status(400).send({ status: false, msg: "Please enter E-mail"});
    let userEmail= data.email

     // Checks whether password is entered or not
    if (!data.password) return res.status(400).send({ status: false, msg: "Please enter Password" }); 
   
    let userPassword= data.password

    let checkCred= await userModel.findOne({email: userEmail})
    if(!checkCred) return res.status(401).send({status:false, msg:"Email is incorrect"})
    let decryptPassword =  bcrypt.compare(userPassword, checkCred.password);

    if (!decryptPassword) {  
      return res
        .status(401)
        .send({ status: false, message: "Password is not correct" });
    }

    //Creating token if e-mail and password is correct
    let token= jwt.sign({
      userId: checkCred._id.toString(),
    }, "Assignment");
    //Setting token in response header
    res.setHeader("x-api-key",token)
    res.status(201).send({status:true,data: token})
  }catch (error) {
  res.status(500).send({ status: false, msg: error.message});
  }
}

const createStudentData = async function(req,res){
  try{
      let data = req.body;
      if (Object.keys(data).length == 0)return res.status(400).send({ status: false, msg: "Body cannot be empty" });
    let mark=data.marks
      let {name,subject,marks}=data;
      if (!name) return res.status(400).send({ status: false, msg: "Please enter  Name" });
      if (typeof name !== "string")return res.status(400).send({ status: false, msg: " Please enter  name as a String" });
      if(!/^\w[a-zA-Z.]*$/.test(name)) return res.status(400).send({ status: false, msg: "The  name may contain only letters" });
      name = name.trim();

      if (!subject) return res.status(400).send({ status: false, msg: "Please enter  subject" });
      if (typeof subject !== "string")return res.status(400).send({ status: false, msg: " Please enter  subject as a String" });
      if(!/^\w[a-zA-Z.]*$/.test(subject)) return res.status(400).send({ status: false, msg: "The  subject may contain only letters" });
      subject = subject.trim();

      if (!marks) return res.status(400).send({ status: false, msg: "Please enter  Marks" });
      if (typeof marks !== "number")return res.status(400).send({ status: false, msg: " Please enter  marks as a Number" });
      if(!/^\[0-9]*$/.test(marks)) return res.status(400).send({ status: false, msg: "The  marks may contain only numbers" });
      marks = marks.trim();
      
       let studentDataPresent = await studentModel.findOne({name:name ,subject: subject}) //_id:studentId
       console.log(studentDataPresent)
       if(studentDataPresent){    
          let addmarks = studentDataPresent.marks +mark  
          let addmarks1= await studentModel.findOneAndUpdate({name:name,subject:subject},{marks:addmarks},{new:true}) 
          res.status(200).send({status:true, data:addmarks1})
       }else{
         let saveData = await studentModel.create(data)
         res.status(201).send({status:true, data:saveData})
       }
  }catch(err){
    res.status(500).send({status: false, msg:err.message})
  }
};

const getStudentData = async function (req, res) {
  try {
    let conditions = req.query; 
    // Checks whether studentId isa valid ObjectId
      if(conditions.studentId) {
        if (!mongoose.isValidObjectId(conditions.studentId))return res.status(400).send({ status: false, msg: "Please Enter studentID as a valid ObjectId" })}

    // Fetching the Students  
    let students = await studentModel.find({$and: [conditions, { isDeleted: false }]});

    if (students.length == 0)return res.status(404).send({ status: false, msg: "No Students found" });

    res.status(200).send({ status: true, data: students });   

  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};


const updateStudentData = async function (req, res) {
  try {
    let studentId = req.params.studentId;
    if (!mongoose.isValidObjectId(studentId))return res.status(400).send({ status: false, msg: "Please Enter studentID as a valid ObjectId" })

    let studentData = req.body;
    if (Object.keys(studentData).length == 0)return res.status(400).send({ status: false, msg: "Body cannot be empty" });
   let {name,subject,mark} = studentData
    //Updating the studentData
    let updatedStudent = await studentModel.findOneAndUpdate(
      { _id: studentId, isDeleted: false }, studentData, { new: true } );

    if(!updatedStudent) return res.status(404).send({status:false,msg:"No students found"})

    res.status(200).send({ status: true, data: updatedStudent });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, msg: error.message });
  }
};

const deleteStudentData = async function (req, res) {
  try {
    let studentId = req.params.studentId;
    if (!mongoose.isValidObjectId(studentId))return res.status(400).send({ status: false, msg: "Please Enter studentId as a valid ObjectId" })

    let student = await studentModel.findOneAndUpdate(
      { _id: studentId, isDeleted: false },{ $set: { isDeleted: true } });
    if (!student) {
      return res.status(404).send({ status: false, msg: "Student Not Found" });
    }
    res.status(200).send({ status: true, msg: "Document is deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports = { createUser,loginStudent , createStudentData,getStudentData,updateStudentData,deleteStudentData};
