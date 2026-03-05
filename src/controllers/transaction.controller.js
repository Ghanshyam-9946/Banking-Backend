const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const mongoose = require('mongoose');
const emailService = require('../services/email.service'); // ✅ IMPORT ADDED



async function createTransaction(req, res) {

  try {

    const { fromAccount, toAccount, idempotencyKey } = req.body;
    const amount = Number(req.body.amount);

    if (!fromAccount || !toAccount || !amount) {
      return res.status(400).json({
        message: "fromAccount, toAccount and amount required"
      });
    }

    const sender = await accountModel.findById(fromAccount);
    const receiver = await accountModel.findById(toAccount);

    if (!sender || !receiver) {
      return res.status(400).json({
        message: "Invalid account IDs"
      });
    }

    // ✅ Create transaction
    const transaction = await transactionModel.create({
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status: "COMPLETED"
    });

    // ✅ Ledger entries
    await ledgerModel.insertMany([
      {
        account: fromAccount,
        amount,
        transaction: transaction._id,
        type: "DEBIT"
      },
      {
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "CREDIT"
      }
    ]);

    // ✅ Send email async (non blocking)
    if (req.user && req.user.email) {

      emailService
        .sendTransactionEmail(
          req.user.email,
          req.user.name,
          amount,
          toAccount
        )
        .catch(err => console.log("Email error:", err.message));

    }

    return res.status(201).json({
      message: "Transaction successful",
      transaction
    });

  } catch (error) {

    console.log("FULL ERROR:", error);

    return res.status(500).json({
      message: error.message
    });

  }
}



async function createInitialFundsTransaction(req,res){

  try {

    const {toAccount, amount, idempotencyKey} = req.body;

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
          message: "To account, amount and idempotency key are required"
        });
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    });

    if(!toUserAccount){
        return res.status(400).json({
            message: "Invalid toAccount"
        });
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    });

    console.log("Logged user id:", req.user._id);

    if(!fromUserAccount){
        return res.status(400).json({
            message: "System account not found for the user"
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    });

    await ledgerModel.create([{
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], {session});

    await ledgerModel.create([{
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], {session});

    transaction.status = "COMPLETED";

    await transaction.save({session});
    await session.commitTransaction();
    session.endSession();

    if (req.user && req.user.email) {

      emailService
        .sendTransactionEmail(
          req.user.email,
          req.user.name,
          amount,
          toAccount
        )
        .catch(err => console.log("Email error:", err.message));

    }

    return res.status(201).json({
        message: "Initial funds transaction successful",
        transaction
    });

  } catch (error) {

    console.log("FULL ERROR:", error);

    return res.status(500).json({
      message: error.message
    });

  }

}



module.exports = {
  createTransaction,
  createInitialFundsTransaction
};