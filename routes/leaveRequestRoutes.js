const express = require('express');
const router = express.Router();
const { createLeaveRequest, updateLeaveStatus, getMyLeaves, getAllLeaves } = require('../Controllers/leaveRequestController');
const { verifyTocken, verifyHR } = require('../middleware/verifyToken_role');

router.get('/my', verifyTocken, getMyLeaves);

router.post('/', verifyTocken, createLeaveRequest);

router.get('/', verifyHR, getAllLeaves);

router.put('/:id/status', verifyHR, updateLeaveStatus);

module.exports = router;