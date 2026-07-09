const mongoose = require('mongoose');

module.exports = mongoose.model(
  'AuditLog',
  new mongoose.Schema({
    orgId:{
      type:mongoose.Schema.Types.ObjectId,
      index:true
    },
    userId:mongoose.Schema.Types.ObjectId,
    action:String,
    method:String,
    path:String,
    body:Object
  },{
    timestamps:true,
    collection:'audit_logs'
  })
);
