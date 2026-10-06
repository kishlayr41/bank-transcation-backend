const Transaction = require("../models/transcation.model");
const LedgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.services");
const mongoose = require("mongoose");
const UserModel = require("../models/user.model");

const createTransaction = async (req, res) => {
    try {
        const {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey
        } = req.body;

        if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "FromAccount, toAccount, amount and idempotencyKey are required"
            });
        }

        const fromUserAccount = await accountModel.findOne({
            _id: fromAccount
        });

        const toUserAccount = await accountModel.findOne({
            _id: toAccount
        });

        if (!fromUserAccount || !toUserAccount) {
            return res.status(400).json({
                message: "Invalid fromAccount or toAccount"
            });
        }

        const isTransactionAlreadyExists = await Transaction.findOne({
            idempotencyKey: idempotencyKey
        });

        if (isTransactionAlreadyExists) {
            if (isTransactionAlreadyExists.status === "COMPLETE") {
                return res.status(200).json({
                    message: "Transaction already processed",
                    transaction: isTransactionAlreadyExists
                });
            }

            if (isTransactionAlreadyExists.status === "PENDING") {
                return res.status(200).json({
                    message: "Transaction is still processing"
                });
            }

            if (isTransactionAlreadyExists.status === "FAILED") {
                return res.status(500).json({
                    message: "Transaction processing failed"
                });
            }

            if (isTransactionAlreadyExists.status === "REVERSED") {
                return res.status(500).json({
                    message: "Transaction was reversed, please retry"
                });
            }
        }

        
            if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE")
         {
            return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
            });
        }

        const balance = await fromUserAccount.getBalance();

        if (balance < amount) {
            return res.status(400).json({
                message: 'Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}'
            });
        }

        const session = await mongoose.startSession();

        session.startTransaction();

        const transcation = await Transaction.create({
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,  
            status: "PENDING"
        },
         { session });

        const debitLedgerEntry = await LedgerModel.create({
            account: fromAccount,
            amount: amount,
            transcation: transcation._id,
            type: "DEBIT"
        },
         { session });

        const creditLedgerEntry = await LedgerModel.create({
            account: toAccount,
            amount: amount,
            transcation: transcation._id,
            type: "CREDIT"
        },
         { session });

        transcation.status = "COMPLETE";

        await transcation.save({ session });

        await session.commitTransaction();
        session.endSession();

        await emailService.sendTrancationEmail(
            req.user.email,
            req.user.name,
            amount,
            toAccount,
            fromAccount
        );

        return res.status(201).json({
            message: "Transcation completed successfully",
            transcation: transcation
        });

    } catch (error) {
        return res.status(500).json({
            message: "Transaction failed",
            error: error.message
        });
    }
};

async function createInitialFundsTranscation(req, res) {
    try {
        const {
            toAccount,
            amount,
            idempotencyKey
        } = req.body;

        if (!toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "toAccount, amount and idempotencyKey are required"
            });
        }

        const toUserAccount = await accountModel.findOne({
            _id: toAccount
        });

        if (!toUserAccount) {
            return res.status(400).json({
                message: "Invalid toAccount"
            });
        }

        const systemUser = await UserModel.findOne({
            systemUser: true
        }).select("+systemUser");

        if (!systemUser) {
            return res.status(400).json({
                message: "System user cannot be found"
            });
        }

        const fromAccountUserAccount = await accountModel.findOne({
            userId: systemUser._id
        });

        if (!fromAccountUserAccount) {
            return res.status(400).json({
                message: "System user account cannot be found"
            });
        }

        const fromAccount = fromAccountUserAccount._id;

        const session = await mongoose.startSession();

        session.startTransaction();

        const [createdTransaction] = await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session });

        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAccount,
            amount: amount,
            transaction: createdTransaction._id,
            type: "DEBIT"
        }], { session });

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            transaction: createdTransaction._id,
            type: "CREDIT"
        }], { session });

        createdTransaction.status = "COMPLETED";

        await createdTransaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: "Initial funds transaction completed successfully",
            transaction: createdTransaction
        });

    } catch (error) {
        return res.status(500).json({
            message: "Initial funds transaction failed",
            error: error.message
        });
    }
}

module.exports = {
    createTransaction,
    createInitialFundsTranscation
};