const express = require("express");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transcationRoutes = require("./routes/transcation.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transcations", transcationRoutes);

console.log("ACCOUNT ROUTER LOADED");

module.exports = app;