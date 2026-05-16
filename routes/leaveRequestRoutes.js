const express = require("express");
const router = express.Router();

const {
  createLeaveRequest,
  updateLeaveStatus,
  getMyLeaves,
  getAllLeaves,
  getprofiledata,
  gettotalleaves,
} = require("../controllers/leaveRequestController");

const { verifyToken, verifyHR } = require("../middleware/verifyToken_role");

// user routes
router.get("/my", verifyToken, getMyLeaves);

router.post("/", verifyToken, createLeaveRequest);

router.get('/pending', verifyHR, (req, res, next) => {
  req.query.status = 'Pending';
  next();
}, getAllLeaves);

router.get("/", verifyHR, getAllLeaves);
router.put("/:id/status", verifyHR, updateLeaveStatus);

/*

router.get('/profiledata', verifyTocken, getprofiledata);*/

// router.get("/profiledata/:userId", getprofiledata);
router.get("/profiledata/:userId", verifyToken, getprofiledata);

module.exports = router;
