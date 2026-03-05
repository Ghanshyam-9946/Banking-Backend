const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRouter = require('./routes/auth.route');
const accountRouter = require('./routes/account.routes');
const transactionRouter = require('./routes/transaction.routes');

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://banking-frontend-green.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the Banking API");
});

app.use('/api/auth', authRouter);
app.use('/api/accounts', accountRouter);
app.use('/api/transactions', transactionRouter);

module.exports = app;