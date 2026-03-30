import mongoose from 'mongoose';

const criteriaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  maxScore: { type: Number, required: true, default: 10 }
}, { _id: false });

const roundConfigSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  name: { type: String, default: '' },
  evaluationType: { type: String, enum: ['admin', 'jury'], default: 'admin' },
  criteria: [criteriaSchema],
  maxAdvance: { type: Number, default: 0 } // 0 means no limit
}, { _id: false });

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  teamSizeLimit: { type: Number, default: 4 },
  rounds: { type: Number, default: 1 },           // total number of rounds (for backward compat)
  roundConfig: [roundConfigSchema],               // per-round evaluation config
  maxShortlisted: { type: Number, default: 0 },   // 0 means no limit
  session: { type: String, enum: ['none', 'day1_morning', 'day1_afternoon', 'day2_morning'], default: 'none' },
  imageUrl: { type: String },
  isPublished: { type: Boolean, default: false },
  isRegistrationOpen: { type: Boolean, default: true },
  isTeamChangeAllowed: { type: Boolean, default: true },
  activeAttendance: {
    round: { type: Number, default: 0 },
    sessionToken: { type: String, default: '' },
    createdAt: { type: Date }
  },
  attendanceMode: { 
    type: String, 
    enum: ['student_scan', 'admin_scan', 'both'], 
    default: 'student_scan' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;
