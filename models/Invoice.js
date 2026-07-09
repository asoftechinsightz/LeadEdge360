import mongoose from 'mongoose';

const InvoiceSchema=new mongoose.Schema({

 orgId:{type:String,index:true},

 invoiceNumber:{
  type:String,
  unique:true
 },

 customerName:String,
 customerEmail:String,
 customerPhone:String,

 planCode:String,

 amount:Number,
 gst:Number,
 totalAmount:Number,

 status:{
  type:String,
  enum:[
   'PENDING',
   'PAID',
   'FAILED',
   'CANCELLED'
  ],
  default:'PENDING'
 },

 pdfUrl:String,

 sentEmail:Boolean,
 sentWhatsapp:Boolean

},{timestamps:true});

export default mongoose.models.Invoice ||
mongoose.model('Invoice',InvoiceSchema);
