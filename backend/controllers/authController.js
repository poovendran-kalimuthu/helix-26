import User from '../models/User.js';

export const loginSuccess = (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: 'Successfully logged in',
      user: req.user
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not Authorized'
    });
  }
};

export const loginFailed = (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Log in failure'
  });
};

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out', error: err });
    }
    // Destroy the session and clear the cookie
    req.session.destroy();
    res.clearCookie('token');
    // Redirect user back to the login page on the frontend
    res.redirect(process.env.FRONTEND_URL);
  });
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not Authorized' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: req.body.name,
        registerNumber: req.body.registerNumber,
        department: req.body.department,
        year: req.body.year,
        section: req.body.section,
        mobile: req.body.mobile,
        alternateEmail: req.body.alternateEmail || '',
        isProfileComplete: true
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
