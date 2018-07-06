const request = require("request");
const cheerio = require("cheerio");
const db = require("../models");

module.exports = function (app) {

    app.get("/", (req, res) => {
        db.News.find({
            saved: false
        }).sort({ "time": -1 }).exec((err, unsavedNews) => {
            if (err) throw err
            res.render("index", {
                unsavedNews
            });
        })
    });

    app.get("/saved", (req, res) => {
        db.News.find({
            saved: true
        }).sort({ "time": -1 }).exec((err, savedNews) => {
            if (err) throw err
            res.render("saved", {
                savedNews
            });
        })
    });
}