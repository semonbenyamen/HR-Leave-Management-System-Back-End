const LeaveRequest = require('../Models/LeaveRequest');
const User = require('../Models/User');
const mongoose = require('mongoose');

const createLeaveRequest = async (req, res) => {
    try {
        const vaccance = await LeaveRequest.create({
            type: req.body.type,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            duration: req.body.duration,
            userId: req.body.userId
        });
        if (vaccance) {
            return res.status(201).json({ msg: 'Leave request submitted successfully', data: vaccance });
        }

    } catch (error) {
        console.error('createLeaveRequest Error:', error);
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

/*
const createLeaveRequest = async (req, res) => {
  try {

    if (req.body.userId || req.body.UserId) {
      return res.status(403).json({
        msg: 'Security Violation: userId cannot be provided by the client'
      });
    }

    const { type, startDate, endDate } = req.body;
    const userId = req.user.id;

    if (!type || !startDate || !endDate) {
      return res.status(400).json({
        msg: 'Missing required fields: type, startDate, endDate'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ msg: 'Invalid date format' });
    }

    if (start < now) {
      return res.status(400).json({ msg: 'startDate cannot be in the past' });
    }

    if (start > end) {
      return res.status(400).json({
        msg: 'startDate must be before or equal to endDate'
      });
    }

    // 🔥 NEW: check overlapping leaves
    const overlappingLeave = await LeaveRequest.findOne({
      userId,
      status: { $ne: "Rejected" }, // ignore rejected
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({
        msg: "You already have a leave request that overlaps with these dates"
      });
    }

    const durationInDays =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (durationInDays > user.leaveBalance) {
      return res.status(400).json({
        msg: `Requested ${durationInDays} days exceeds your available balance of ${user.leaveBalance} days`
      });
    }

    const leaveRequest = await LeaveRequest.create({
      type,
      startDate: start,
      endDate: end,
      duration: durationInDays,
      userId
    });

    return res.status(201).json({
      msg: 'Leave request submitted successfully',
      data: leaveRequest
    });

  } catch (error) {
    console.error('createLeaveRequest Error:', error);
    return res.status(500).json({
      msg: 'Server error',
      error: error.message
    });
  }
};
*/
const updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const hrId = req.user.id;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ msg: 'status must be either "Approved" or "Rejected"' });
        }

        const leaveRequest = await LeaveRequest.findOneAndUpdate(
            { _id: req.params.id, status: 'Pending' },
            { status, approvedBy: hrId, processedAt: new Date() },
            { new: true }
        );

        if (!leaveRequest) {
            const existing = await LeaveRequest.findById(req.params.id);
            if (!existing) return res.status(404).json({ msg: 'Leave request not found' });
            return res.status(400).json({ msg: `Request is already ${existing.status.toLowerCase()}` });
        }

        if (status === 'Approved') {
            const user = await User.findById(leaveRequest.userId);

            if (!user || leaveRequest.duration > user.leaveBalance) {
                await LeaveRequest.findByIdAndUpdate(leaveRequest._id, {
                    status: 'Pending',
                    approvedBy: null,
                    processedAt: null
                });

                if (!user) {
                    return res.status(404).json({ msg: 'Associated user not found — request rolled back to Pending' });
                }
                return res.status(400).json({
                    msg: `Insufficient balance (${user.leaveBalance} days available, ${leaveRequest.duration} requested) — request rolled back to Pending`
                });
            }

            await User.findByIdAndUpdate(user._id, {
                $inc: { leaveBalance: -leaveRequest.duration, usedLeave: leaveRequest.duration }
            });
        }

        return res.status(200).json({
            msg: `Leave request ${status.toLowerCase()} successfully`,
            data: leaveRequest
        });

    } catch (error) {
        console.error('updateLeaveStatus Error:', error);
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

const getMyLeaves = async (req, res) => {
    try {
        const leaves = await LeaveRequest.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        return res.status(200).json({ count: leaves.length, data: leaves });
    } catch (error) {
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

const getAllLeaves = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const leaves = await LeaveRequest.find(filter)
            .populate('userId', 'name email')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({ count: leaves.length, data: leaves });
    } catch (error) {
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
};
/////////////////////////////



const getprofiledata = async (req, res) => {
    try {
        const userId = req.params.userId; //|| req.user.id;
        // console.log("user id" + userId);

        const leaves = await LeaveRequest.find({ userId: userId, status: "Approved" });
        console.log("leaves" + leaves.length);
        if (leaves.length === 0) {
            return res.status(404).json({
                msg: "No approved leaves found for this user"
            });
        }

        const categorizey = await LeaveRequest.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.params.userId)
                }
            },
            {
                $group: {
                    _id: "$type",
                    totalDuration: { $sum: "$duration" }
                }
            }
        ]);



        // console.log("category" + categorizey.length);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

       const upcomingLeaves = await LeaveRequest.find({
            userId,
            status: { $in: ["Approved", "Pending"] },
            startDate: { $gte: new Date() }
        })
            .sort({ startDate: 1 })
            .limit(5);
        console.log("upcoming" + upcomingLeaves.length);
        upcomingLeaves.forEach(leave => {
            console.log("start" + leave.startDate + "end  " + leave.endDate + "status " + leave.status);

        });
        let totalUsedLeave = 0;
        for (let i = 0; i < leaves.length; i++) {
            totalUsedLeave += leaves[i].duration;
        }

        return res.status(200).json({
            data: categorizey, totalAvailable: user.leaveBalance,
            totalUsed: totalUsedLeave, remaining: user.leaveBalance - totalUsedLeave
            ,
            upcomingLeaves: upcomingLeaves
        });

    }
    catch (error) {
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
}

module.exports = { createLeaveRequest, updateLeaveStatus, getMyLeaves, getAllLeaves, getprofiledata };