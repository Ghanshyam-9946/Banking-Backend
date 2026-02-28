const express = require('express');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/auth.route');
const accountRouter = require('./routes/account.routes');
const transactionRouter = require('./routes/transaction.routes');
const { sendRegistrationEmail } = require('./services/email.service');
const app = express();

app.get('/send', async  (req, res) => {
    await sendRegistrationEmail("ddhote780@gmail.com", "bhai", "hdfghdf")
    res.send("Hello World");
})


app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/accounts', accountRouter);
app.use('/api/transactions', transactionRouter);

module.exports = app;


