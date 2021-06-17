let User = require("../user.model")
const express = require('express');
const nodemailer = require('nodemailer')

// Reset Token Creator
const randomString = length => {
    let text = "";
    const possible = "abscdefghijklmnopqrstuvwxyz1234567890";
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

const router = express.Router()

router.route('/forgotpassword/:email').post(function (req, res) {
    const token = randomString(40);

    User.find({ email: req.params.email }, function (err, users) {
        const user = users[0];
        if (!user) {
            res.json("No user found with that email")
        } else {
            // TODO SET TOKEN EXPIRATION

            // Encrypt reset token in db
            user.resetToken = user.generateHash(token)

            user.save().then(user => {
                // To data
                const emailData = {
                    to: user.email,
                    subject: "Magneta Password Reset",
                    text: `Link: www.magneta.xyz/resetpass/${token}/${user._id}`,
                    html: `<p>Vist this link to reset your password: www.magneta.xyz/resetpass/${token}/${user._id}. Do not share this link, anyone with this link can reset your password</p>`
                }
                // From data
                var transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    socketTimeout: 5000,
                    logger: true,
                    debug: true,
                    auth: {
                        user: "taqu1725@colorado.edu",
                        pass: "Ol!ver1996"
                    }
                });

                // Use nodemailer to send email
                transporter
                    .sendMail(emailData)
                    .then(info => {
                        res.json('Reset link sent!')
                    })
                    .catch(err => res.json(err))

            }).catch(err => {
                res.status(400).send("Update not possible" + err);
            });
        }
    })
})

router.route('/resetPassword/:id').post(function (req, res) {
    User.find({
        _id: req.params.id
    }, (err, users) => {
        const user = users[0];
        if (!user) {
            res.json("No user found")
        } else {
            // Decrypt reset token
            if (!user.validResetToken(req.body.resetToken)) {
                res.json("Reset token incorrect or expired")
            }

            // Hash the new password
            user.password = user.generateHash(req.body.newPassword)

            // Reset the token
            user.resetToken = ''

            user.save().then(user => {
                res.json("Password Reset")
            }).catch(err => {
                res.status(400).send("Update not possible");
            });
        }
    });
})

module.exports = router