const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/user.model');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            provider: 'google',
          });
        }

        // Generate access and refresh tokens
        const generatedAccessToken = generateAccessToken(user._id);
        const generatedRefreshToken = generateRefreshToken(user._id);

        // Store refresh token in the user model
        user.setRefreshToken(generatedRefreshToken);

        // Pass both tokens to the user object (for the callback)
        return done(null, {
          user,
          accessToken: generatedAccessToken,
          refreshToken: generatedRefreshToken,
        });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// LinkedIn OAuth Strategy
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL,
      scope: ['r_emailaddress', 'r_liteprofile'],
      state: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            provider: 'linkedin',
          });
        }

        // Generate access and refresh tokens
        const generatedAccessToken = generateAccessToken(user._id);
        const generatedRefreshToken = generateRefreshToken(user._id);

        // Store refresh token in the user model
        user.setRefreshToken(generatedRefreshToken);

        // Pass both tokens to the user object (for the callback)
        return done(null, {
          user,
          accessToken: generatedAccessToken,
          refreshToken: generatedRefreshToken,
        });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize & Deserialize User
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = passport;
