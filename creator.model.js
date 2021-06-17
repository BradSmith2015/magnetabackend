const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User = mongoose.model('User', )
User = require("./user.model")

let Creator = User.discriminator('Creator', new mongoose.Schema({ medium: String }, options));

module.exports = mongoose.model('Creator', Creator);