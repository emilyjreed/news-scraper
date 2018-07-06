const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NoteSchema = new Schema({
    content: {
        type: String,
        trim: true
    }

}, { timestamps: true })

const Note = mongoose.model("Note", NoteSchema);
module.exports = Note;