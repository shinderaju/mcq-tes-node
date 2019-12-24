const express = require('express');
const User = require('../models/user.model');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body);
        console.log('user1');
        // await user.save();
        console.log('user2', user);
        const token = await user.generateAuthToken();
        user.tokens = token;
        await user.save();
        res.status(201).send({ token })
    } catch (error) {
        console.log('respond with a resourceadasdsda', error)
        res.status(422).send('Email is invalid or already taken');
    }
})

router.post('/login', async(req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body;
        console.log('req.body', email, password);
        const user = await User.findByCredentials(email, password);
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken();
        user.save();
        console.log('user', user);
        console.log('token', token);
        res.send({ token })
    } catch (error) {
        res.status(401).send({error: 'Login failed! Check authentication credentials'})
    }

})

router.get('/users/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})

router.post('/users/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/getAllCanditates',auth, async(req, res) => {
    const user = req.user;
    console.log('admin', user);
    if (user.role.toLowerCase() == 'admin') {
        const allCandidate = await User.find({role: 'student'}, {name:1,email:1,userTest:1});
        res.send(allCandidate);
    } else {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }
})
module.exports = router
