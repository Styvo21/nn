const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const Application = require('../models/Application');
const authMiddleware = require('../middleware/authMiddleware');

// POST: Admin Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const admin = await AdminUser.findOne({ username });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: admin._id, username: admin.username, role: admin.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});

// GET: All applications (protected)
router.get('/applications', authMiddleware, async (req, res) => {
  try {
    const { status, job, country, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.status = status;
    if (job) filter.selectedJob = job;
    if (country) filter.country = country;

    const applications = await Application.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      applications
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// GET: Single application (protected)
router.get('/applications/:id', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application', error: error.message });
  }
});

// PUT: Update application status (protected)
router.put('/applications/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Under Review', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({
      message: 'Application status updated',
      application
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application', error: error.message });
  }
});

// DELETE: Delete application (protected)
router.delete('/applications/:id', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting application', error: error.message });
  }
});

// GET: Dashboard statistics (protected)
router.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const total = await Application.countDocuments();
    const approved = await Application.countDocuments({ status: 'Approved' });
    const rejected = await Application.countDocuments({ status: 'Rejected' });
    const underReview = await Application.countDocuments({ status: 'Under Review' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayApplications = await Application.countDocuments({
      createdAt: { $gte: today }
    });

    res.status(200).json({
      total,
      approved,
      rejected,
      underReview,
      todayApplications
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router;
