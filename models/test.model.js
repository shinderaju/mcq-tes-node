const mongoose = require('mongoose');

const testSchema = mongoose.Schema({
    questions:[
        {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'QuestionSchema'
        }
    ]
});
const Test = mongoose.model('Test', testSchema);

module.exports = Test;
