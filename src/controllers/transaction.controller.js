const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service');
const { default: mongoose } = require('mongoose');



async function createTransaction(req,res){
    
    const {fromAccount, toAccount, amount, idempotencyKey} = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json(
            {message: "From account, to account, amount and idempotency key are required"});
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }


    const isTransactionExist = await transactionModel.findOne({
        idempotencyKey: idempotencyKey,
    })

    if(isTransactionExist){
        if(isTransactionExist.status === "COMPLETED"){
            return res.status(200).json({
                message: "Transaction already proccessed",
            })
        }

        if(isTransactionExist.status === "PENDING"){
            return res.status(200).json({
                message: "Transaction is pending",
            })
        }

        if(isTransactionExist.status === "FAILED"){
            return res.status(500).json({
                message: "Transaction failed",
            })
        }

        if(isTransactionExist.status === "REVERSED"){
            return res.status(500).json({
                message: "Transaction is reversed",
            })
        }
    }

    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message: "Both accounts must be active",
        })
    }

    const balance = await fromUserAccount.getBalance(); 

    if(balance < amount){
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`,
        })
    }
let transaction;
try{
    const session = await mongoose.startSession();
    session.startTransaction();

     transaction = (await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING",
    }], {session}))[0]  ;
   await new Promise(resolve => setTimeout(resolve, 2000));
    const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
    }], {session})

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
    }], {session})

await transactionModel.findOneAndUpdate(
    {_id: transaction._id},
    {status: "COMPLETED"},
    {session}
)
   
   await session.commitTransaction();
session.endSession(); 
} catch(err){
    return res.status(400).json({
        message: "Transaction is Pending due to some issue retry after sometime",
    })
}

    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);

    return res.status(201).json({
        message: "Transaction successful",
        transaction: transaction,
    })

}

async function createInitialFundsTransaction(req,res){
    const {toAccount, amount, idempotencyKey} = req.body;

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json(
            {message: "To account, amount and idempotency key are required"});
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if(!toUserAccount){
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
         
        user: req.user._id, 
        
    })

    console.log("Logged user id:", req.user._id);




    if(!fromUserAccount){
            return res.status(400).json({
                message: "System account not found for the user",
            })
    }

    const session = await transactionModel.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING",
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
    }], {session})

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
    }], {session})

    transaction.status = "COMPLETED";

    await transaction.save({session});
    await session.commitTransaction();
    session.endSession(); 

return res.status(201).json({
    message: "Initial funds transaction successful",
    transaction: transaction,
})

}



module.exports = {
    createTransaction,
    createInitialFundsTransaction
}
