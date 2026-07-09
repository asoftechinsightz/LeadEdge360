const Task = require('../models/LeadTask');
const Timeline = require('../models/LeadTimeline');

exports.list = async (req,res)=>{
  const rows = await Task.find({
    orgId:req.user.orgId,
    leadId:req.params.id
  }).sort({createdAt:-1});

  res.json(rows);
};

exports.create = async (req,res)=>{
  const row = await Task.create({
    ...req.body,
    orgId:req.user.orgId,
    leadId:req.params.id,
    createdBy:req.user._id
  });

  await Timeline.create({
orgId:req.user.orgId,
leadId:req.params.id,
type:'task_created',
userId:req.user._id,
payload:{taskId:row._id,title:row.title}
});

res.status(201).json(row);
};

exports.update = async (req,res)=>{
  const row = await Task.findOneAndUpdate(
    {
      _id:req.params.taskId,
      orgId:req.user.orgId,
      leadId:req.params.id
    },
    req.body,
    { new:true }
  );

  res.json(row);
};

exports.remove = async (req,res)=>{
  await Task.deleteOne({
    _id:req.params.taskId,
    orgId:req.user.orgId,
    leadId:req.params.id
  });

  res.json({
    success:true
  });
};
