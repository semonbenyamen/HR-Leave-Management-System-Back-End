const mongoose = require ('mongoose');

const leaveRequestSchema = new mongoose.Schema ({
    
    type: {
        type : String ,
        required : true 
    },
    startDate : {
        type : Date ,
        required :true
    },
    endDate : {
        type : Date ,
        required : true 
    },
    status : {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    // Holiday time
    duration : {
        type: Number,
        required :true 
    },
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    }, 
    // Who agreed
    approvedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Date of reply
    processedAt : {
        type : Date ,
        default: null 
    },

}, { timestamps: true , });

module.exports = mongoose.model ('LeaveRequest' , leaveRequestSchema);
