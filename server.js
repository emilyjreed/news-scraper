const mongoose = require("mongoose");
const request = require("request");
const express = require("express");
const cheerio = require("cheerio");
const app = express();
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");


const PORT = process.env.PORT || 8080;

// const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/articlescraperdb";

// mongoose.Promise = Promise;
// mongoose.connect(MONGODB_URI);

const databaseURI = 'mongodb://localhost:27017/articlescraperdb';

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI);
} else {
    mongoose.connect(databaseURI);
}

var db = mongoose.connection;

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require("./routes/htmlRoutes.js")(app);
require("./routes/apiRoutes.js")(app);

app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});