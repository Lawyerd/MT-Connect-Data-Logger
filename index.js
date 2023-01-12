const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

const server = http.createServer(app);
const PORT = 8080;

const accountRouter = require("./router/account");
const helloworldRouter = require("./router/helloworld");

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.use("/account", accountRouter);
app.use("/helloworld", helloworldRouter);