import mongoose from 'mongoose';

const PartnerCommissionSchema =
new mongoose.Schema({

 partnerId:{type:String,index:true},

 subscriptionId:String,

 invoiceId:String,

 customerName:String,

 monthlyRevenue:Number,

 commissionPercent:Number,

 commissionAmount:Number,

 status:{
  type:String,
  enum:[
   'GENERATED',
   'APPROVED',
   'SCHEDULED',
   'PAID',
   'REJECTED'
  ],
  default:'GENERATED'
 }

},{timestamps:true});

export default
mongoose.models.PartnerCommission ||
mongoose.model(
'PartnerCommission',
PartnerCommissionSchema
);
