const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

let CreatorStats = new Schema(
  {
    name: String,
    url: String,
    platform: String,
    clicks: Number,
    conversions: Number,
    start: String,
    end: String,
    completed: Boolean,
    link: String,
    landingInfo: {
      template: String,
      isPrimaryGradient: Boolean,
      isSecondaryGradient: Boolean,
      primaryColor1: {
        r: String,
        g: String,
        b: String,
        a: String
      },
      primaryColor2: {
        r: String,
        g: String,
        b: String,
        a: String
      },
      secondaryColor1: {
        r: String,
        g: String,
        b: String,
        a: String
      },
      secondaryColor2: {
        r: String,
        g: String,
        b: String,
        a: String
      },
      headline: String,
      headlineColor: {
        r: String,
        g: String,
        b: String,
        a: String
      },
      secondaryHeadline: String,
      secondaryHeadlineColor: {
        r: String,
        g: String,
        b: String,
        a: String
      },
      subHeader: String,
      subHeaderColor: {
        r: String,
        g: String,
        b: String,
        a: String
      },
      promoCode: String,
      promoDiscount: String
    },
    profilePicUrl: String,
    posts: [Schema.Types.Mixed],
    hasAuthenticated: Boolean
  },
  { _id: false }
);

let BrandCampaign = new Schema(
  {
    start: String,
    end: String,
    campaignName: String,
    conversionDest: String,
    destCond: Boolean,
    createdAt: String,
    campaignLink: String,
    numProgress: Number,
    numCompleted: Number,
    creators: [CreatorStats],
    emails: [String]
  },
  { _id: false }
);

let User = new Schema({
  user_onBoarded: {
    type: Boolean
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  user_signUpInfo: {
    type: Object
  },
  user_type: {
    type: String
  },
  verified: {
    type: Boolean
  },
  campaigns: [BrandCampaign],
  resetToken: String
});

// Password methods
User.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

User.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

User.methods.validResetToken = function(token) {
  return bcrypt.compareSync(token, this.resetToken);
};

module.exports = mongoose.model("User", User);
