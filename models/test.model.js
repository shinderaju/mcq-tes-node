const mongoose = require('mongoose');

const testSchema = mongoose.Schema({
    questions:[
        {
            question: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'QuestionSchema'
            },
        }
    ]
})
const Test = mongoose.model('Test', testSchema);

module.exports = Test;
