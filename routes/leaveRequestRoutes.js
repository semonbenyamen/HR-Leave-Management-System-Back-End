const express = require('express');
const router = express.Router();

const {
  createLeaveRequest,
  updateLeaveStatus,
  getMyLeaves,
  getAllLeaves,
  getprofiledata,
  gettotalleaves
} = require('../Controllers/leaveRequestController');

const {
  verifyTocken,
  verifyHR
} = require('../middleware/verifyToken_role');

// user routes
router.get('/my', verifyTocken, getMyLeaves);


router.post('/', createLeaveRequest);



router.get('/', verifyHR, getAllLeaves);
router.put('/:id/status', verifyHR, updateLeaveStatus);

/*

router.get('/profiledata', verifyTocken, getprofiledata);*/

router.get('/profiledata/:userId', getprofiledata);

module.exports = router;