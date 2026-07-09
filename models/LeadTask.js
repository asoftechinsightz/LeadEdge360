const mongoose = require('mongoose');

module.exports = mongoose.model(
  'LeadTask',
  new mongoose.Schema({
    orgId:{
      type:mongoose.Schema.Types.ObjectId,
      required:true,
      index:true
    },
    leadId:{
      type:mongoose.Schema.Types.ObjectId,
      required:true,
      index:true
    },
    title:{
      type:String,
      required:true
    },
    description:String,
    dueDate:Date,
    priority:{
      type:String,
      default:'medium'
    },
    status:{
      type:String,
      default:'open'
    },
    createdBy:{
      type:mongoose.Schema.Types.ObjectId
    }
  },{
    timestamps:true,
    collection:'lead_tasks'
  })
);
