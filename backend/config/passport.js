import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BACKEND_URL 
      ? `${process.env.BACKEND_URL.replace(/\/$/, '')}/api/auth/google/callback` 
      : '/api/auth/google/callback',
    proxy: true,
    state: true,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log("Google profile received:", profile.id, profile.emails[0]?.value);
      // Check if user already exists in our db
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        const coordinators = [
          'sksanjay06052005@gmail.com',
          'mukesh.adcbe@gmail.com',
          'arssiva35@gmail.com'
        ];
        if (coordinators.includes(user.email) && user.role === 'user') {
          user.role = 'coordinator';
          await user.save();
        }
        return done(null, user);
      } else {
        const coordinators = [
          'sksanjay06052005@gmail.com',
          'mukesh.adcbe@gmail.com',
          'arssiva35@gmail.com'
        ];
        const assignedRole = coordinators.includes(profile.emails[0]?.value) ? 'coordinator' : 'user';

        // If not, create a new user in our db
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0]?.value,
          profilePicture: profile.photos[0]?.value,
          role: assignedRole
        });
        return done(null, user);
      }
    } catch (error) {
      console.error("Passport verify callback error:", error);
      return done(error, null);
    }
  }
));

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
