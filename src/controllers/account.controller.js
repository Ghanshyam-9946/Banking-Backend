const accountModel = require('../models/account.model');

/**
 * CREATE ACCOUNT
 */
async function createAccountController(req, res) {
    try {
        const user = req.user;

        const account = await accountModel.create({
            user: user._id,
        });

        return res.status(201).json({
            message: "Account created successfully",
            account
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Account creation failed"
        });
    }
}


/**
 * GET LOGGED-IN USER ACCOUNTS
 */
async function getUserAccountsController(req, res) {
    try {
        const accounts = await accountModel.find({
            user: req.user._id
        });

        return res.status(200).json({
            totalAccounts: accounts.length,
            accounts
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Failed to fetch accounts"
        });
    }
}


/**
 * GET ACCOUNT BALANCE
 */
async function getAccountBalanceController(req, res) {
    try {
        const { accountId } = req.params;

        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user._id
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        // assuming schema method exists
        const balance = await account.getBalance();

      

        return res.status(200).json({
            accountId: account._id,
            balance: balance
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Failed to fetch balance"
        });
    }
}

module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController
};