const express = require('express');
const router = express.Router();
const db = require("../models");

// Get specific article by id with populated notes
router.get("/articles/:id", (req, res) => {
    db.Article.findById(req.params.id)
        .then(data => {
            if (data) {
                res.json(data);
            }
        }).catch(err => {
        res.status(500).send(err);
    });
});

// Update specific article by id.  Used primarily for setting saved value on the Article
router.patch("/articles/:id", (req, res) => {
    db.Article.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true}).then((data) => {
        if (data) {
            res.json(data);
        } else {
            res.status(404).send({error: "No article found for this id"});
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

// Get list of notes for a specific article
router.get("/articles/:id/notes", (req, res) => {
    db.Article.findById(req.params.id).populate("notes")
        .then(data => {
            if (data) {
                res.json(data);
            }
        }).catch(err => {
        res.status(500).send(err);
    });
});

// Create a note for to a specific article
router.post("/articles/:id/notes", (req, res) => {

    db.Note.create(req.body)
        .then((note) => {
            // If the note was created, add it to the selected Article
            return db.Article.findOneAndUpdate({_id: req.params.id}, {$push: {notes: note._id}}, {new: true}).populate("notes");
        })
        .then(article => res.json(article))
        .catch(err => res.json(err));
});

// Delete note from article
router.delete("/articles/:articleId/notes/:noteId", (req, res) => {

    db.Note.remove({_id: req.params.noteId})
        .then(() => {
            // Remove note from the referencing article
            return db.Article.findOneAndUpdate({_id: req.params.articleId}, {$pull: {notes: {_id: req.params.noteId}}}, {new: true}).populate("notes");
        })
        .then(article => res.json(article))
        .catch(err => res.json(err));
});


module.exports = router;