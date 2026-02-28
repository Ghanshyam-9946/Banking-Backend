const express = require('express');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/auth.route');
const accountRouter = require('./routes/account.routes');
const transactionRouter = require('./routes/transaction.routes');
const { sendRegistrationEmail } = require('./services/email.service');
const app = express();




app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Welcome to the Banking API");
})

app.use('/api/auth', authRouter);
app.use('/api/accounts', accountRouter);
app.use('/api/transactions', transactionRouter);

module.exports = app;


