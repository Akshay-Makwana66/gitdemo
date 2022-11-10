const mongoose = require('mongoose');
 const ObjectId = mongoose.Schema.Types.ObjectId
const studentSchema = new mongoose.Schema({
    name:{
        type: String
    },
    userId: {
         type: ObjectId, 
        required: true, 
        ref: 'User' },
    subject:{
        type: String
    },
    marks:{
        type: Number
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});
module.exports = mongoose.model("Student", studentSchema)