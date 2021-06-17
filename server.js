const express = require('express');
const dotenv = require('dotenv');
const UserSession = require('./UserSession');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const validator = require('validator');
const userRoutes = express.Router();
const PORT = 4000;
dotenv.config();
let User = require("./user.model")

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function () {
    console.log("MongoDB database connection established successfully!");
})

// Route Imports
const signupRoutes = require('./routes/signup.js')
const campaignRoutes = require('./routes/campaign.js')
const emailRoutes = require('./routes/email.js')

userRoutes.route('/').get(function (req, res) {
    User.find(function (err, users) {
        if (err) {
            console.log(err);
        } else {
            res.json(users);
        }
    });
});

userRoutes.route('/:id').get(function (req, res) {
    let id = req.params.id;
    User.findById(id, function (err, user) {
        if (!user) {
            res.status(404).send('Users is not found');

        } else {
            res.json(user);
        }
    });
});

userRoutes.route('/add').post(function (req, res) {
    let user = new User(req.body);
    user.save()
        .then(user => {
            res.status(200).json({ 'user': 'user added successfully' });
        })
        .catch(err => {
            res.status(400).send('adding new user failed');
        });
});

userRoutes.route('/verify/:id').post(function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (!user) {
            res.status(404).send('data is not found');
        }
        else {
            user.verified = true;
            user.save().then(user => {
                res.json('User updated');
            }).catch(err => {
                res.status(400).send("Update not possible");
            });
        }
    });
});

userRoutes.route('/update/:id').post(function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (!user) {
            res.status(404).send('data is not found');
        }
        else {
            user.user_onBoarded = req.body.user_onBoarded;
            user.user_signUpInfo = req.body.user_signUpInfo;
            user.user_type = req.body.user_type;

            user.save().then(user => {
                res.json('User updated');
            }).catch(err => {
                res.status(400).send("Update not possible");
            });
        }
    });
});

userRoutes.route('/updateSignUpInfo/:id').post(function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (!user) {
            res.status(404).send('data is not found');
        }
        else {
            user.user_signUpInfo = req.body.user_signUpInfo;
            user.user_onBoarded = req.body.user_onBoarded;

            user.save().then(user => {
                let resBody = {
                    success: true
                }

                res.json(resBody);
            }).catch(err => {
                res.status(400).send("Update not possible");
            });
        }
    });
});

app.use('/users', userRoutes);
app.use('/users', signupRoutes);
app.use('/users', campaignRoutes)
app.use('/users', emailRoutes)

app.listen(process.env.PORT || PORT, function () {
    console.log("Server is running on Port: " + PORT);
});