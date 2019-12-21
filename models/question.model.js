var mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
    question: String,
    choices: Array,
    answer: Number
});

module.exports = mongoose.model('QuestionSchema', QuestionSchema);
