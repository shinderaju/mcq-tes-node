const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const auth = require('../middleware/auth');
const Test = require('../models/test.model');
const Question = require('../models/question.model');

const router = express.Router();

router.get('/createTest',auth, createNewTest);
router.post('/updateResult',auth, updateResult);
router.get('/getCurrentTest',auth, getCurrentTest);

async function createNewTest(req, res){
    try {
        Question.aggregate( [{ $sample: {size: 10} } ] ).then(async (questions) => {
            const questionsArray = questions.map((question)=>{
                return question._id;
            });
            Test.collection.insert({questions : questionsArray},async function (err, docs) {
                if (err){
                    return console.error(err);
                } else {
                    console.log("Multiple documents inserted to Collection", docs);
                    // const { email, password } = req.body;
                    // const user = await User.findByCredentials(email, password);
                    const user = req.user;
                    console.log('findByCredentials', user);
                    User.collection.update(
                        { _id: user._id },
                        { $push: { userTest: { testId : mongoose.Types.ObjectId(docs.insertedIds[0]) } },
                            $set: {currentTest: mongoose.Types.ObjectId(docs.insertedIds[0])} }
                    ).then((userUpdated) =>{
                        console.log("Multiple userUpdated to Collection", userUpdated);
                        const testObject = {
                            testId : docs.insertedIds[0],
                            questions : questions.map((question)=>{
                                return {
                                    options : question.choices,
                                    question : question.question
                                };
                            })
                        };
                        res.send(testObject);
                    })
                }
            });
        });
    } catch (error) {
        console.log('respond with a resourceadasdsda');
        res.status(400).send(error)
    }
}
async function updateResult(req,res){
    const ansObj = await checkUserAns(req,res);
    // const { email, password } = req.body;
    // const user = await User.findByCredentials(email, password);
    const user = req.user;
    User.collection.update(
        { _id: user._id, "userTest.testId": mongoose.Types.ObjectId(user.currentTest)  },
        { $set: { "userTest.$.userAns" : ansObj.userAns, "userTest.$.obtainedMarks": ansObj.obtainedMarks, "userTest.$.wrong": ansObj.wrongAns, "userTest.$.correct": ansObj.correct, "userTest.$.totalMarks": ansObj.totalMarks  } }
    ).then((userUpdated) =>{
        console.log("Multiple userUpdated to Collection", userUpdated);
        res.send(ansObj);
    }).catch((err)=>{
        console.log(err);
    })
}
async function checkUserAns(req,res){
    const givenTest = await getTest(req.user.currentTest);
    let correct = 0;
    console.log('givenTest', givenTest);
    const userAns = givenTest.questions.map((que,index) => {
        if(que.answer == req.body.userAns[index]) {
            correct++;
            return {
                result: true,
                ansOption: req.body.userAns[index]
            }
        } else {
            return {
                result: false,
                ansOption: req.body.userAns[index]
            }
        }
    });
    const wrongAns = givenTest.questions.length - correct;
    const obtainedMarks = correct;
    const totalMarks = givenTest.questions.length;
    return {userAns, wrongAns, obtainedMarks, totalMarks, correct, questions:givenTest.questions};
}
async function getTest(currentTestId){
    return new Promise(async (resolve,reject)=>{
        // const { email, password } = req.body;
        // const user = await User.findByCredentials(email, password);
        // req.user = user;
        // console.log('user ', user.userTest);
        Test.findOne({_id: mongoose.Types.ObjectId(currentTestId)}).populate('questions').
        exec(function (err, test) {
            if (err) return console.error(err);
            console.log('The author', test);
            resolve(test);
        });
    })
}
async function getCurrentTest(req,res){
    const givenTest = await getTest(req.user.currentTest);
    console.log('givenTest', givenTest);
    const testObject = {
        testId : givenTest._id,
        questions : givenTest.questions.map((question)=>{
            return {
                options : question.choices,
                question : question.question
            };
        })
    };
    res.send(testObject);
}

module.exports = router
