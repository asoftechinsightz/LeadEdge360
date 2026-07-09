import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  orgId:{type:String,index:true},
  tenantId:{type:String,index:true},

  planCode:{
    type:String,
    enum:['STARTER','BUSINESS_GROWTH','ENTERPRISE'],
    required:true
  },

  status:{
    type:String,
    enum:[
      'TRIAL',
      'ACTIVE',
      'GRACE_PERIOD',
      'PAST_DUE',
      'SUSPENDED',
      'CANCELLED'
    ],
    default:'ACTIVE'
  },

  startDate:Date,
  renewalDate:Date,
  expiryDate:Date,

  setupFee:Number,
  monthlyAmount:Number,

  razorpaySubscriptionId:String,

  createdBy:String,
  updatedBy:String

},{timestamps:true});

export default mongoose.models.Subscription ||
mongoose.model('Subscription',SubscriptionSchema);
