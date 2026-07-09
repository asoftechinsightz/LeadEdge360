const Audit = require('../models/AuditLog');

module.exports = (action)=>async(req,res,next)=>{

  const originalJson = res.json.bind(res);

  res.json = async(payload)=>{
    try{
      await Audit.create({
        orgId:req.user?.orgId,
        userId:req.user?._id,
        action,
        method:req.method,
        path:req.originalUrl,
        body:req.body
      });
    }catch(err){}

    return originalJson(payload);
  };

  next();
};
