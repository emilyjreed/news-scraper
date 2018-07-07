const request = require("request");
const cheerio = require("cheerio");
const db = require("../models");

module.exports = function (app) {
    app.get("/scrape", (req, res) => {
        request("https://www.nytimes.com", function (err, response, html) {
            const $ = cheerio.load(html);
            let results = [];
            $(".initial-set").next().find("li").each((i, element) => {
                if (/story-id-.*/i.test($(element).attr("id"))) {
                    const newArticle = {};
                    newArticle.title = $(element).find(".story-meta").find(".headline").text().trim();
                    if (results.find( item => item.title === newArticle.title )) {
                        return;
                    }
                    newArticle.author = $(element).find(".story-meta").find(".byline").text().trim();
                    newArticle.time = $(element).find(".dateline").attr("datetime");
                    newArticle.summary = $(element).find(".story-meta").find(".summary").text().trim();
                    newArticle.link = $(element).find(".story-link").attr("href");
                    newArticle.photoURL = $(element).find("img").attr("src");
                    results.push(new db.News(newArticle));
                }
            });
            db.News.find({}, "_id title", (err, existingNews) => {
                if (err) throw err;
                const existingTitles = new Set(existingNews.map(a => a.title));
                const newResults = results.filter(b => {
                    return !existingTitles.has(b.title)
                });
                const numOfnewItems = newResults.length;
                db.News.create(newResults, function (err, data) {
                    if (err) throw err;
                    res.json({
                        numOfnewItems
                    })
                })
            })
        });
    });

    app.put("/news/save/:id", (req, res) => {
        db.News.findOneAndUpdate({
            _id: req.params.id
        }, {
                $set: {
                    saved: true
                }
            }, {
                new: true
            }).then(
                (docs) => {
                    if (docs) {
                        res.json("article saved")
                    } else {
                        res.json("article doesn't exist")
                    }
                }
            ).catch(err => res.json(err))
    })

    app.put("/news/unsave/:id", (req, res) => {
        db.News.findOneAndUpdate({
            _id: req.params.id
        }, {
                $set: {
                    saved: false
                }
            }, {
                new: true
            }).then(
                (docs) => {
                    console.log("docs     " + docs)
                    if (docs) {
                        res.json("article unsaved")
                    } else {
                        res.json("article doesn't exist")
                    }
                }
            ).catch(err => res.json(err))
    })

    app.post("/comments/save/:id", (req, res) => {
        db.Note.create(req.body).then(dbNote => {
            return db.News.findOneAndUpdate({
                _id: req.params.id
            }, {
                    $push: {
                        notes: dbNote._id
                    }
                }, {
                    new: true
                });

        }).then(dbArticle => {
            res.json(dbArticle)
        }).catch(err => res.json(err))
    })

    app.get("/comments/read/:id", (req, res) => {
        db.News.findOne({
            _id: req.params.id
        })
            .populate("notes")
            .then(function (dbNews) {
                res.json(dbNews)
            })
            .catch(err => res.json(err))

    })

    app.delete("/comments/delete/:id", (req, res) => {
        db.Note.findOneAndRemove({
            _id: req.params.id
        }).then(dbNote => {
            return db.News.findOneAndUpdate({
                notes: req.params.id
            }, {
                    $pull: {
                        notes: dbNote._id
                    }
                }, {
                    new: true
                });
        }).then(dbAriticle => {
            res.json(dbArticle)
        }).catch(err => res.json(err))
    });
};