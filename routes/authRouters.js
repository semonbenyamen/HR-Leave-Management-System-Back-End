const express = require("express");

const router= express.Router();

const  { register,login ,forgetpwd,resetpwd} = require("../Controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword",forgetpwd);
router.post("/resetpassword/:token", resetpwd);

module.exports = router;