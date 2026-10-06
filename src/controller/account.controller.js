const accountModel = require("../models/account.model");


async function createAccountController(req, res) {
    try {
        const user = req.user;

        const account = await accountModel.create({
            userId: user.userId
        });

        res.status(201).json({
            account
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}
const getAccountController = async (req, res) => {
    try {
        const accounts = await accountModel.find({
            userId: req.user.userId
        });

        return res.status(200).json({
            message: "Accounts fetched successfully",
            accounts
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch accounts",
            error: error.message
        });
    }
};
async function getAccountBalanceController(req, res) {
    try {
        const { accountId } = req.params;

        const account = await accountModel.findOne({
            _id: accountId,
            userId: req.user.userId
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        const balance = await account.getBalance();

        return res.status(200).json({
            accountId: account._id,
            balance: balance,
            currency: account.currency
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch balance",
            error: error.message
        });
    }
}

module.exports = {
    createAccountController,
    getAccountController,
    getAccountBalanceController
};