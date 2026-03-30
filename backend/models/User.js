import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  profilePicture: {
    type: String
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  registerNumber: { type: String },
  department: { type: String },
  year: { type: String },
  section: { type: String },
  mobile: { type: String },
  alternateEmail: { type: String },
  role: {
    type: String,
    enum: ['user', 'admin', 'coordinator'],
    default: 'user'
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
