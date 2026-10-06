const express = require("express");
const router = express.Router();

const transactionController = require("../controller/transcation.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post(
    "/",
    authMiddleware,
    transactionController.createTransaction
);

router.post(
    "/initial-transcation-funds",
    authMiddleware,
    transactionController.createInitialFundsTranscation
);

module.exports = router;