const express = require("express");

const {
    registerUser,
    userLoginController
} = require("../controller/auth.controller");

const router = express.Router();

/* POST /api/auth/register */
router.post("/register", registerUser);

/* POST /api/auth/login */
router.post("/login", userLoginController);

module.exports = router;