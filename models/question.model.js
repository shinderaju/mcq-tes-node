var mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
    question: String,
    options: Array,
    answer: Number
});

module.exports = mongoose.model('QuestionSchema', QuestionSchema);
