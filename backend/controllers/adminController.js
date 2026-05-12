import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';
import Evaluator from '../models/Evaluator.js';
import Score from '../models/Score.js';
import AuditLog from '../models/AuditLog.js';
import { logAudit } from '../utils/auditLogger.js';

// @desc    Get dashboard analytics (counts)
export const getAdminAnalytics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalUsers = await User.countDocuments();
    
    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        totalRegistrations,
        totalUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a new event
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, teamSizeLimit, rounds, roundConfig, imageUrl, isPublished, isRegistrationOpen, isTeamChangeAllowed, numberOfWinners } = req.body;
    
    const event = await Event.create({
      title,
      description,
      date,
      location,
      teamSizeLimit: teamSizeLimit || 4,
      rounds: rounds || 1,
      roundConfig: roundConfig || [],
      imageUrl: imageUrl || '',
      isPublished: isPublished || false,
      isRegistrationOpen: isRegistrationOpen !== undefined ? isRegistrationOpen : true,
      isTeamChangeAllowed: isTeamChangeAllowed !== undefined ? isTeamChangeAllowed : true,
      numberOfWinners: numberOfWinners || 3,
      createdBy: req.user._id
    });
    
    await logAudit('CREATE_EVENT', `Created event: ${title}`, req.user._id, 'Event', event._id, req.body, req.ip, title);
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Update an event 
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    await logAudit('UPDATE_EVENT', `Updated event: ${event.title}`, req.user._id, 'Event', event._id, req.body, req.ip, event.title);
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all events (Admin view)
export const getAdminEvents = async (req, res) => {
  try {
    const events = await Event.find().sort('-createdAt').populate('createdBy', 'name');
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    await logAudit('DELETE_EVENT', `Deleted event: ${event.title}`, req.user._id, 'Event', req.params.id, { eventId: req.params.id, eventTitle: event.title }, req.ip, event.title);
    res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all registrations for an event (Admin view)
export const getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.id })
      .populate('teamLeader', 'name email registerNumber department year section mobile')
      .populate('members.user', 'name email registerNumber department year section mobile')
      .sort('createdAt');
    
    // Also fetch scores for this event to allow admin review
    const scores = await Score.find({ event: req.params.id })
      .populate('evaluator', 'name email')
      .sort('-submittedAt');

    res.status(200).json({ success: true, registrations, scores });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Toggle shortlist status of one registration
export const toggleShortlist = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.regId);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    
    const willShortlist = !reg.isShortlisted;
    if (willShortlist) {
      const event = await Event.findById(reg.event);
      if (event?.maxShortlisted > 0) {
        const currentShortlisted = await Registration.countDocuments({ event: reg.event, isShortlisted: true, isDisqualified: false });
        if (currentShortlisted >= event.maxShortlisted) {
          return res.status(400).json({ success: false, message: `Shortlist limit reached (Max ${event.maxShortlisted} teams).` });
        }
      }
    }

    reg.isShortlisted = willShortlist;
    await reg.save();
    
    await logAudit('TOGGLE_SHORTLIST', `${willShortlist ? 'Shortlisted' : 'Unshortlisted'} registration ${reg.teamName || reg._id}`, req.user._id, 'Registration', reg._id, { isShortlisted: willShortlist, registrationId: reg._id }, req.ip, reg.teamName || String(reg._id));
    res.status(200).json({ success: true, registration: reg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Bulk shortlist / unshortlist registrations
export const bulkShortlist = async (req, res) => {
  try {
    const { regIds, shortlist } = req.body;
    
    if (shortlist && regIds.length > 0) {
      const firstReg = await Registration.findById(regIds[0]);
      if (firstReg) {
        const event = await Event.findById(firstReg.event);
        if (event?.maxShortlisted > 0) {
          const currentShortlisted = await Registration.countDocuments({ event: firstReg.event, isShortlisted: true, isDisqualified: false, _id: { $nin: regIds } });
          if (currentShortlisted + regIds.length > event.maxShortlisted) {
            return res.status(400).json({ success: false, message: `Shortlisting these teams would exceed limit (Max ${event.maxShortlisted}, currently ${currentShortlisted} shortlisted).` });
          }
        }
      }
    }

    await Registration.updateMany({ _id: { $in: regIds } }, { isShortlisted: shortlist });
    
    await logAudit('BULK_SHORTLIST', `Bulk ${shortlist ? 'shortlisted' : 'unshortlisted'} ${regIds.length} registrations`, req.user._id, 'Registration', null, { regIds, isShortlisted: shortlist }, req.ip, `Bulk (${regIds.length} teams)`);
    res.status(200).json({ success: true, message: `${regIds.length} registration(s) updated.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// @desc    Update registration round
export const updateRegistrationRound = async (req, res) => {
  try {
    const { round } = req.body;
    const reg = await Registration.findById(req.params.regId);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    
    // Validate Round Limit
    if (round > 0) {
      const event = await Event.findById(reg.event);
      const rCfg = event?.roundConfig?.find(r => r.roundNumber === round);
      if (rCfg?.maxAdvance > 0) {
        const currentInRound = await Registration.countDocuments({ event: reg.event, currentRound: round, _id: { $ne: reg._id } });
        if (currentInRound >= rCfg.maxAdvance) {
          return res.status(400).json({ success: false, message: `Round ${round} limit reached (Max ${rCfg.maxAdvance} participants).` });
        }
      }
    }

    reg.currentRound = round;
    await reg.save();
    
    await logAudit('UPDATE_ROUND', `Moved registration ${reg.teamName || reg._id} to Round ${round}`, req.user._id, 'Registration', reg._id, { round, registrationId: reg._id }, req.ip, reg.teamName || String(reg._id));
    res.status(200).json({ success: true, registration: reg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Bulk update registration round
export const bulkUpdateRound = async (req, res) => {
  try {
    const { regIds, round } = req.body;
    
    // Validate Round Limit
    if (round > 0 && regIds.length > 0) {
      const firstReg = await Registration.findById(regIds[0]);
      if (firstReg) {
        const event = await Event.findById(firstReg.event);
        const rCfg = event?.roundConfig?.find(r => r.roundNumber === round);
        if (rCfg?.maxAdvance > 0) {
           const currentInRound = await Registration.countDocuments({ event: firstReg.event, currentRound: round, _id: { $nin: regIds } });
           if (currentInRound + regIds.length > rCfg.maxAdvance) {
              return res.status(400).json({ success: false, message: `Moving ${regIds.length} teams would exceed Round ${round} limit (Max ${rCfg.maxAdvance}, currently ${currentInRound} slots occupied).` });
           }
        }
      }
    }

    await Registration.updateMany({ _id: { $in: regIds } }, { currentRound: round });
    
    await logAudit('BULK_UPDATE_ROUND', `Bulk moved ${regIds.length} registrations to Round ${round}`, req.user._id, 'Registration', null, { regIds, round }, req.ip, `Bulk (${regIds.length} teams)`);
    res.status(200).json({ success: true, message: `${regIds.length} registration(s) updated to Round ${round}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Toggle disqualify status of one registration
export const toggleDisqualify = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.regId);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    reg.isDisqualified = !reg.isDisqualified;
    await reg.save();
    
    await logAudit('TOGGLE_DISQUALIFY', `${reg.isDisqualified ? 'Disqualified' : 'Requalified'} registration ${reg.teamName || reg._id}`, req.user._id, 'Registration', reg._id, { isDisqualified: reg.isDisqualified, registrationId: reg._id }, req.ip, reg.teamName || String(reg._id));
    res.status(200).json({ success: true, registration: reg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Revert registration one round back
export const revertRound = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.regId);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    if (reg.currentRound > 0) {
      reg.currentRound = reg.currentRound - 1;
    } else {
      // Revert shortlist status if already at round 0
      reg.isShortlisted = false;
    }
    await reg.save();
    
    await logAudit('REVERT_ROUND', `Reverted registration ${reg.teamName || reg._id} to Round ${reg.currentRound}`, req.user._id, 'Registration', reg._id, { round: reg.currentRound, isShortlisted: reg.isShortlisted, registrationId: reg._id }, req.ip, reg.teamName || String(reg._id));
    res.status(200).json({ success: true, registration: reg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Toggle winner status of one registration
export const toggleWinner = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.regId);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    
    const willBeWinner = !reg.isWinner;
    
    if (willBeWinner) {
      const event = await Event.findById(reg.event);
      if (event?.numberOfWinners > 0) {
        const currentWinners = await Registration.countDocuments({ event: reg.event, isWinner: true });
        if (currentWinners >= event.numberOfWinners) {
          return res.status(400).json({ success: false, message: `Winner limit reached (Max ${event.numberOfWinners}).` });
        }
      }
    }

    reg.isWinner = willBeWinner;
    await reg.save();
    
    await logAudit('TOGGLE_WINNER', `${willBeWinner ? 'Marked as Winner' : 'Removed Winner status for'} registration ${reg.teamName || reg._id}`, req.user._id, 'Registration', reg._id, { isWinner: willBeWinner, registrationId: reg._id }, req.ip, reg.teamName || String(reg._id));
    res.status(200).json({ success: true, registration: reg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Bulk select winners
export const bulkSelectWinners = async (req, res) => {
  try {
    const { regIds, isWinner, position } = req.body;
    
    if (isWinner && regIds.length > 0) {
      const firstReg = await Registration.findById(regIds[0]);
      if (firstReg) {
        const event = await Event.findById(firstReg.event);
        if (event?.numberOfWinners > 0) {
          const currentWinners = await Registration.countDocuments({ event: firstReg.event, isWinner: true, _id: { $nin: regIds } });
          if (currentWinners + regIds.length > event.numberOfWinners) {
            return res.status(400).json({ success: false, message: `Selecting these teams would exceed winner limit (Max ${event.numberOfWinners}, currently ${currentWinners} winners).` });
          }
        }
      }
    }

    const updateData = { isWinner };
    if (isWinner && position) {
      updateData.winnerPosition = position;
    } else if (!isWinner) {
      updateData.winnerPosition = '';
    }

    await Registration.updateMany({ _id: { $in: regIds } }, updateData);
    
    await logAudit('BULK_WINNERS', `Bulk ${isWinner ? 'marked as winners' : 'removed winner status for'} ${regIds.length} registrations`, req.user._id, 'Registration', null, { regIds, isWinner, position }, req.ip, `Bulk (${regIds.length} teams)`);
    res.status(200).json({ success: true, message: `${regIds.length} registration(s) updated.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/* =========================================
   EVALUATORS MANAGEMENT
   ========================================= */

// @desc    Get all evaluators
export const getEvaluators = async (req, res) => {
  try {
    const evaluators = await Evaluator.find()
      .populate('assignedRounds.event', 'title')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, evaluators });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new evaluator
export const createEvaluator = async (req, res) => {
  try {
    const { name, email, phone, pin, assignedRounds } = req.body;
    
    const existing = await Evaluator.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Evaluator with this email already exists' });
    }

    const evaluator = await Evaluator.create({
      name,
      email,
      phone,
      pin, 
      assignedRounds: assignedRounds || [],
      createdBy: req.user._id
    });

    const populatedEvaluator = await Evaluator.findById(evaluator._id)
      .populate('assignedRounds.event', 'title')
      .populate('createdBy', 'name');

    await logAudit('CREATE_EVALUATOR', `Created evaluator: ${name}`, req.user._id, 'Evaluator', evaluator._id, { email, phone, assignedRounds }, req.ip, name);
    res.status(201).json({ success: true, evaluator: populatedEvaluator });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete an evaluator
export const deleteEvaluator = async (req, res) => {
  try {
    const evaluator = await Evaluator.findByIdAndDelete(req.params.id);
    if (!evaluator) {
      return res.status(404).json({ success: false, message: 'Evaluator not found' });
    }
    
    await logAudit('DELETE_EVALUATOR', `Deleted evaluator: ${evaluator.name}`, req.user._id, 'Evaluator', req.params.id, { evaluatorId: req.params.id, evaluatorName: evaluator.name }, req.ip, evaluator.name);
    res.status(200).json({ success: true, message: 'Evaluator deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/* =========================================
   USER MANAGEMENT & AUDIT LOGS
   ========================================= */

// @desc    Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt').select('-googleId');
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create a user manually
export const createUser = async (req, res) => {
  try {
    const { name, email, role, department, year } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      role: role || 'user',
      department,
      year,
      isProfileComplete: true // Assuming admin creation means basic info is sufficient
    });

    await logAudit('CREATE_USER', `Created new user: ${email} with role ${role}`, req.user._id, 'User', user._id, { email, role, department, year }, req.ip, name || email);
    
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get audit logs
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort('-createdAt')
      .limit(200); // Limit to last 200 logs
      
    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
// @desc    Delete a registration
export const deleteRegistration = async (req, res) => {
  try {
    const reg = await Registration.findByIdAndDelete(req.params.regId);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    
    // Also delete any scores associated with this registration if necessary
    await Score.deleteMany({ registration: req.params.regId });
    
    await logAudit('DELETE_REGISTRATION', `Deleted registration for event`, req.user._id, 'Registration', req.params.regId, { registrationId: req.params.regId }, req.ip, String(req.params.regId));
    res.status(200).json({ success: true, message: 'Registration deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    await logAudit('DELETE_USER', `Deleted user: ${user.name || user.email}`, req.user._id, 'User', req.params.id, { userId: req.params.id, email: user.email }, req.ip, user.name || user.email);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
