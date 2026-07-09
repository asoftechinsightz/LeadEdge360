const express = require('express');
const router = express.Router({ mergeParams:true });

const c = require('../controllers/leadTasks.controller');
const audit = require('../middleware/auditLog');

router.get('/', c.list);

router.post(
  '/',
  audit('task_create'),
  c.create
);

router.patch(
  '/:taskId',
  audit('task_update'),
  c.update
);

router.delete(
  '/:taskId',
  audit('task_delete'),
  c.remove
);

module.exports = router;
