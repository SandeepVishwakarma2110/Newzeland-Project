 
// const Comment = require('./models/Comment');
 
// const Topic = require('./models/Topic');
// const multer = require('multer');
// const path = require('path');
// const auth = require('./middleware/auth');

//  const sendEmail = require('./utils/sendEmail');
 
 

// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');

 
// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const RegisterRequest = require('./models/RegisterRequest');

// const app = express();
// // In-memory store for refresh tokens (for demo; use DB/Redis in production)
// const refreshTokens = new Set();
// const PORT = process.env.PORT || 5000;

// app.use(cors({
//   origin: true,
//   credentials: true
// }));
// app.use(cookieParser());
// app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nzproject', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => console.log('MongoDB connected'))
//   .catch(err => console.log('MongoDB error:', err));


 

 
// // Register request route

// app.post('/api/register-request', async (req, res) => {
//   const { name, email, password, role } = req.body;
//   try {
//     const existing = await RegisterRequest.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'Request already exists for this email' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const request = new RegisterRequest({ name, email, password: hashedPassword, role: role || 2 });
//     await request.save();

//      await sendEmail({
//     to: req.body.email,
//     subject: 'Registration Received',
//     text: 'Thank you for registering. Please wait for approval from the admin.'
//   });
//     res.status(201).json({ message: 'Registration request submitted. Wait for approval.' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
  
// });

// // Login route
// app.post('/api/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const request = await RegisterRequest.findOne({ email });
//     if (!request) return res.status(400).json({ message: 'No registration request found' });
//     if (request.status !== 'approved') return res.status(403).json({ message: 'Request not approved yet' });

//     const valid = await bcrypt.compare(password, request.password);
//     if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

//     // Update lastLogin
//     request.lastLogin = new Date();
//     await request.save();
//     // Issue JWT (access token)
//     const accessToken = jwt.sign(
//       { id: request._id, email: request.email, role: request.role },
//       process.env.JWT_SECRET || 'your_jwt_secret',
//       { expiresIn: '2d' } // short-lived access token
//     );
//     // Issue refresh token
//     const refreshToken = jwt.sign(
//       { id: request._id, email: request.email, role: request.role },
//       process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
//       { expiresIn: '7d' }
//     );
//     refreshTokens.add(refreshToken);
//     // Send refresh token as httpOnly cookie
//     res.cookie('refreshToken', refreshToken, {
//       httpOnly: true,
//       secure: false, // set true in production with HTTPS
//       sameSite: 'lax',
//       maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
//     });
//     res.json({
//       message: 'Login successful',
//       accessToken,
//       user: { _id: request._id, name: request.name, email: request.email, role: request.role, lastLogin: request.lastLogin }
//     });
//   // Endpoint to refresh access token
//   app.post('/api/refresh-token', (req, res) => {
//     const token = req.cookies.refreshToken;
//     if (!token || !refreshTokens.has(token)) {
//       return res.status(401).json({ message: 'Refresh token missing or invalid' });
//     }
//     try {
//       const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your_refresh_secret');
//       const newAccessToken = jwt.sign(
//         { id: payload.id, email: payload.email, role: payload.role },
//         process.env.JWT_SECRET || 'your_jwt_secret',
//         { expiresIn: '15m' }
//       );
//       res.json({ accessToken: newAccessToken });
//     } catch (err) {
//       return res.status(403).json({ message: 'Invalid refresh token' });
//     }
//   });

//   // Endpoint to logout (invalidate refresh token)
//   app.post('/api/logout', (req, res) => {
//     const token = req.cookies.refreshToken;
//     if (token) refreshTokens.delete(token);
//     res.clearCookie('refreshToken');
//     res.json({ message: 'Logged out' });
//   });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Update user role (promote/demote)
// app.post('/api/register-requests/:id/role', auth([0, 1]), async (req, res) => {
//   const { role } = req.body;
//   if (![0, 1, 2].includes(role)) return res.status(400).json({ message: 'Invalid role' });
//   try {
//     const request = await RegisterRequest.findByIdAndUpdate(req.params.id, { role }, { new: true });
//     if (!request) return res.status(404).json({ message: 'Request not found' });
//     res.json({ message: `Role updated to level ${role}` });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// // List all registration requests (for admin dashboard)
// app.get('/api/register-requests', auth([0, 1]), async (req, res) => {
//   try {
//     const requests = await RegisterRequest.find();
//     res.json({ requests });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Approve a registration request
// app.post('/api/register-requests/:id/approve', auth([0, 1]), async (req, res) => {
//   try {
//     const request = await RegisterRequest.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    
//     if (!request) return res.status(404).json({ message: 'Request not found' });
//      const user = await RegisterRequest.findById(req.params.id);
//   if (user?.email) {
//     await sendEmail({
//       to: user.email,
//       subject: 'Your Registration is Approved',
//       text: 'Congratulations! Your registration has been approved. You can now log in.'
//     });
//   }
//     res.json({ message: 'Request approved' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
  
// });

// // Reject a registration request
// app.post('/api/register-requests/:id/reject', auth([0, 1]), async (req, res) => {
//   try {
//     const request = await RegisterRequest.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
//     if (!request) return res.status(404).json({ message: 'Request not found' });
//     res.json({ message: 'Request rejected' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // File upload setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, 'uploads'));
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });
// const upload = multer({ storage });

// // Create topic
// app.post('/api/topics', auth([0]), upload.single('notes'), async (req, res) => {
//   try {
//     const { title, key, background } = req.body;
//     const notes = req.file ? req.file.filename : '';
//     const createdBy = req.user.id;
//     const topic = new Topic({ title, key, background, notes, createdBy });
//     await topic.save();

    
//   const level2Users = await RegisterRequest.find({ role: 2, status: 'approved' });
//   const emails = level2Users.map(u => u.email);
//   await sendEmail({
//     to: emails,
//     subject: 'New Document Added',
//     text: `A new document "${req.body.title}" has been added to the website.`
//   });
//     res.status(201).json({ message: 'Topic created', topic });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }

   

// });

// // Get all topics
// app.get('/api/topics', auth([0, 1, 2]), async (req, res) => {
//   try {
//     const topics = await Topic.find().sort({ createdAt: -1 });
//     res.json({ topics });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get single topic (increment views)
// app.get('/api/topics/:id', auth([0,1,2]), async (req, res) => {
//   try {
//     const topic = await Topic.findById(req.params.id).populate('createdBy updatedBy', 'name');
//     if (!topic) return res.status(404).json({ message: 'Topic not found' });
//     topic.views = (topic.views || 0) + 1;
//     await topic.save();
//     res.json({ topic });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Edit topic
// app.put('/api/topics/:id', auth([0]), upload.single('notes'), async (req, res) => {
//   try {
//     const { title, key, background } = req.body;
//     const update = { title, key, background, updatedAt: new Date(), updatedBy: req.user.id };
//     if (req.file) update.notes = req.file.filename;
//     const topic = await Topic.findByIdAndUpdate(req.params.id, update, { new: true });
    
//     if (!topic) return res.status(404).json({ message: 'Topic not found' });

//     // Send email BEFORE sending response
//     const populatedTopic = await Topic.findById(req.params.id).populate('createdBy');
//     if (populatedTopic?.createdBy?.email) {
//       await sendEmail({
//         to: populatedTopic.createdBy.email,
//         subject: 'Your Document Has Been Updated',
//         text: `Your document "${populatedTopic.title}" has been updated.`
//       });
//     }

//     res.json({ message: 'Topic updated', topic });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Delete topic
// app.delete('/api/topics/:id', auth([0]), async (req, res) => {
//   try {
//     const topic = await Topic.findByIdAndDelete(req.params.id);
//     if (!topic) return res.status(404).json({ message: 'Topic not found' });
//     res.json({ message: 'Topic deleted' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get comments for a topic
// app.get('/api/topics/:id/comments', auth([0,1,2]), async (req, res) => {
//   const comments = await Comment.find({ topicId: req.params.id })
//     .populate('userId', 'name')
//     .lean();
//   // Populate userId for each reply
//   for (const comment of comments) {
//     if (comment.replies && comment.replies.length) {
//       for (const reply of comment.replies) {
//         if (reply.userId) {
//           const user = await RegisterRequest.findById(reply.userId).select('name');
//           reply.userId = user ? { _id: user._id, name: user.name } : null;
//         }
//       }
//     }
//   }
//   res.json({ comments });
  
// });

// // Add comment
// app.post('/api/topics/:id/comments', auth([0,1]), async (req, res) => {
//   const comment = new Comment({
//     topicId: req.params.id,
//     userId: req.user.id,
//     text: req.body.text
//   });
//   await comment.save();

//    const topic = await Topic.findById(req.params.id).populate('createdBy');
//   if (topic?.createdBy?.email) {
//     await sendEmail({
//       to: topic.createdBy.email,
//       subject: 'New Comment on Your Document',
//       text: `A new comment was added to your document "${topic.title}".`
//     });
//   }

//   res.status(201).json({ comment });

   
// });

// // Delete own comment
// app.delete('/api/comments/:id', auth([0,1]), async (req, res) => {
//   const comment = await Comment.findById(req.params.id);
//   if (!comment || comment.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
//   await comment.deleteOne();
//   res.json({ message: 'Comment deleted' });
// });

// // Add reply
// app.post('/api/comments/:id/replies', auth([0,1]), async (req, res) => {
//   const comment = await Comment.findById(req.params.id);
//   if (!comment) return res.status(404).json({ message: 'Comment not found' });
//   comment.replies.push({ userId: req.user.id, text: req.body.text });
//   await comment.save();
//   res.json({ comment });
// });

// // API: Get total topics count
// app.get('/api/stats/topics-count', async (req, res) => {
//   const count = await Topic.countDocuments();
//   res.json({ count });
// });

// // API: Get total users count
// app.get('/api/stats/users-count', async (req, res) => {
//   const count = await RegisterRequest.countDocuments({ status: 'approved' });
//   res.json({ count });
// });

// // API: Get user contributions (comments + topics created)
// app.get('/api/stats/user-contributions/:userId', async (req, res) => {
//   const userId = req.params.userId;
//   const topics = await Topic.countDocuments({ createdBy: userId });
//   const comments = await Comment.countDocuments({ userId });
//   res.json({ topics, comments, total: topics + comments });
// });

// // Admin dashboard: stats and user management
// // Get admin stats: total users, total topics, topics this month, comments today
// app.get('/api/admin/stats', auth([0, 1]), async (req, res) => {
//   try {
//     const totalUsers = await RegisterRequest.countDocuments({ status: 'approved' });
//     const totalTopics = await Topic.countDocuments();
//     // Topics created this month
//     const startOfMonth = new Date();
//     startOfMonth.setDate(1);
//     startOfMonth.setHours(0, 0, 0, 0);
//     const topicsMonth = await Topic.countDocuments({ createdAt: { $gte: startOfMonth } });
//     // Comments created today
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);
//     const commentsToday = await Comment.countDocuments({ createdAt: { $gte: startOfDay } });
//     res.json({ users: totalUsers, topics: totalTopics, topicsMonth, commentsToday });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get all users for admin management
// app.get('/api/admin/users', auth([0, 1]), async (req, res) => {
//   try {
//     const users = await RegisterRequest.find({}, 'name email role status lastLogin createdAt').lean();
//     res.json({ users });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Add a new user (admin only)
// app.post('/api/admin/users', auth([0, 1]), async (req, res) => {
//   const { name, email, password, role } = req.body;
//   try {
//     const existing = await RegisterRequest.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'User already exists' });
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new RegisterRequest({ name, email, password: hashedPassword, role, status: 'approved' });
//     await user.save();
//     res.status(201).json({ message: 'User created', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
 
// // ---------------- PROFILE ENDPOINTS ----------------
// const requireAuth = auth([0, 1, 2]);

// // Get profile
// app.get('/api/profile', requireAuth, async (req, res) => {
//   const user = await RegisterRequest.findById(req.user.id).lean();
//   if (!user) return res.status(404).json({ message: 'User not found' });
//   res.json({ profile: user });
// });

// // Update profile (name, email, role)
// app.put('/api/profile', requireAuth, async (req, res) => {
//   const { name, email, role } = req.body;
//   const user = await RegisterRequest.findById(req.user.id);
//   if (!user) return res.status(404).json({ message: 'User not found' });
//   if (name) user.name = name;
//   if (email) user.email = email;
//   if (role !== undefined && [0, 1, 2].includes(role)) user.role = role;
//   await user.save();
//   res.json({ message: 'Profile updated' });
// });

// // Update contact info
// app.put('/api/profile/contact', requireAuth, async (req, res) => {
//   const { phone, address } = req.body;
//   const user = await RegisterRequest.findById(req.user.id);
//   if (!user) return res.status(404).json({ message: 'User not found' });
//   if (phone !== undefined) user.phone = phone;
//   if (address !== undefined) user.address = address;
//   await user.save();
//   res.json({ message: 'Contact info updated' });
// });

// // Get profile stats (admin)
// app.get('/api/profile/stats', requireAuth, async (req, res) => {
//   const userId = req.user.id;
//   const user = await RegisterRequest.findById(userId);
//   let documents = 0, users = 0, contributions = 0;
//   if (user.role === 0 || user.role === 1) {
//     documents = await Topic.countDocuments({ createdBy: userId });
//     users = await RegisterRequest.countDocuments({});
//     const comments = await Comment.countDocuments({ userId });
//     contributions = documents + comments;
//   }
//   res.json({ documents, users, contributions });
// });
 

// app.get('/', (req, res) => {
//   res.send('Backend API is running!');
// });

// app.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`);
// });
// server/index.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Models and Middleware/Utilities
const Comment = require('./models/Comment');
const Topic = require('./models/Topic');
const RegisterRequest = require('./models/RegisterRequest');
const auth = require('./middleware/auth');
const sendEmail = require('./utils/sendEmail');

// In-memory store for refresh tokens (for demo; use DB/Redis in production)
const refreshTokens = new Set();

// Connect to MongoDB function
const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI || 'localhost', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => console.log('MongoDB connected'))
      .catch(err => console.log('MongoDB error:', err));
};

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure this path is correct relative to the executed file (index.js) or its parent
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// The main function to create and configure the Express app/router
exports.createApp = () => {
    const app = express.Router(); // Using Router to make it a modular sub-application

    // Connect to the database when the app is created
    connectDB();

    // Middleware setup
    app.use(cors({
        origin: true,
        credentials: true
    }));
    app.use(cookieParser());
    app.use(express.json());
    // Static file serving (e.g., for uploaded notes)
    app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

    // Authentication Middleware alias
    const requireAuth = auth([0, 1, 2]);

    // --- Authentication Routes ---

    // Register request route
    app.post('/api/register-request', async (req, res) => {
        const { name, email, password, role } = req.body;
        try {
            const existing = await RegisterRequest.findOne({ email });
            if (existing) return res.status(400).json({ message: 'Request already exists for this email' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const request = new RegisterRequest({ name, email, password: hashedPassword, role: role || 2 });
            await request.save();

            await sendEmail({
                to: req.body.email,
                subject: 'Registration Received',
                text: 'Thank you for registering. Please wait for approval from the admin.'
            });
            res.status(201).json({ message: 'Registration request submitted. Wait for approval.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Login route
    app.post('/api/login', async (req, res) => {
        const { email, password } = req.body;
        try {
            const request = await RegisterRequest.findOne({ email });
            if (!request) return res.status(400).json({ message: 'No registration request found' });
            if (request.status !== 'approved') return res.status(403).json({ message: 'Request not approved yet' });

            const valid = await bcrypt.compare(password, request.password);
            if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

            // Update lastLogin
            request.lastLogin = new Date();
            await request.save();

            // Issue JWT (access token)
            const accessToken = jwt.sign(
                { id: request._id, email: request.email, role: request.role },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '2d' }
            );

            // Issue refresh token
            const refreshToken = jwt.sign(
                { id: request._id, email: request.email, role: request.role },
                process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
                { expiresIn: '7d' }
            );
            refreshTokens.add(refreshToken);

            // Send refresh token as httpOnly cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // set true in production with HTTPS
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({
                message: 'Login successful',
                accessToken,
                user: { _id: request._id, name: request.name, email: request.email, role: request.role, lastLogin: request.lastLogin }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Endpoint to refresh access token
    app.post('/api/refresh-token', (req, res) => {
        const token = req.cookies.refreshToken;
        if (!token || !refreshTokens.has(token)) {
            return res.status(401).json({ message: 'Refresh token missing or invalid' });
        }
        try {
            const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your_refresh_secret');
            const newAccessToken = jwt.sign(
                { id: payload.id, email: payload.email, role: payload.role },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '15m' }
            );
            res.json({ accessToken: newAccessToken });
        } catch (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
    });

    // Endpoint to logout (invalidate refresh token)
    app.post('/api/logout', (req, res) => {
        const token = req.cookies.refreshToken;
        if (token) refreshTokens.delete(token);
        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out' });
    });

    // --- Admin/User Management Routes ---

    // Update user role (promote/demote)
    app.post('/api/register-requests/:id/role', auth([0, 1]), async (req, res) => {
        const { role } = req.body;
        if (![0, 1, 2].includes(role)) return res.status(400).json({ message: 'Invalid role' });
        try {
            const request = await RegisterRequest.findByIdAndUpdate(req.params.id, { role }, { new: true });
            if (!request) return res.status(404).json({ message: 'Request not found' });
            res.json({ message: `Role updated to level ${role}` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // List all registration requests (for admin dashboard)
    app.get('/api/register-requests', auth([0, 1]), async (req, res) => {
        try {
            const requests = await RegisterRequest.find();
            res.json({ requests });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Approve a registration request
    app.post('/api/register-requests/:id/approve', auth([0, 1]), async (req, res) => {
        try {
            const request = await RegisterRequest.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });

            if (!request) return res.status(404).json({ message: 'Request not found' });
            // Retrieve the updated user data to get the email
            const user = await RegisterRequest.findById(req.params.id);
            if (user?.email) {
                await sendEmail({
                    to: user.email,
                    subject: 'Your Registration is Approved',
                    text: 'Congratulations! Your registration has been approved. You can now log in.'
                });
            }
            res.json({ message: 'Request approved' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }

    });

    // Reject a registration request
    app.post('/api/register-requests/:id/reject', auth([0, 1]), async (req, res) => {
        try {
            const request = await RegisterRequest.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
            if (!request) return res.status(404).json({ message: 'Request not found' });
            res.json({ message: 'Request rejected' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Add a new user (admin only)
    app.post('/api/admin/users', auth([0, 1]), async (req, res) => {
        const { name, email, password, role } = req.body;
        try {
            const existing = await RegisterRequest.findOne({ email });
            if (existing) return res.status(400).json({ message: 'User already exists' });
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new RegisterRequest({ name, email, password: hashedPassword, role, status: 'approved' });
            await user.save();
            res.status(201).json({ message: 'User created', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });


    // Get all users for admin management
    app.get('/api/admin/users', auth([0, 1]), async (req, res) => {
        try {
            const users = await RegisterRequest.find({}, 'name email role status lastLogin createdAt').lean();
            res.json({ users });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // --- Topic/Document Routes ---

    // Create topic
    app.post('/api/topics', auth([0]), upload.single('notes'), async (req, res) => {
        try {
            const { title, key, background } = req.body;
            const notes = req.file ? req.file.filename : '';
            const createdBy = req.user.id;
            const topic = new Topic({ title, key, background, notes, createdBy });
            await topic.save();

            const level2Users = await RegisterRequest.find({ role: 2, status: 'approved' });
            const emails = level2Users.map(u => u.email);
            await sendEmail({
                to: emails,
                subject: 'New Document Added',
                text: `A new document "${req.body.title}" has been added to the website.`
            });
            res.status(201).json({ message: 'Topic created', topic });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Get all topics
    app.get('/api/topics', auth([0, 1, 2]), async (req, res) => {
        try {
            const topics = await Topic.find().sort({ createdAt: -1 });
            res.json({ topics });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Get single topic (increment views)
    app.get('/api/topics/:id', auth([0, 1, 2]), async (req, res) => {
        try {
            const topic = await Topic.findById(req.params.id).populate('createdBy updatedBy', 'name');
            if (!topic) return res.status(404).json({ message: 'Topic not found' });
            topic.views = (topic.views || 0) + 1;
            await topic.save();
            res.json({ topic });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Edit topic
    app.put('/api/topics/:id', auth([0]), upload.single('notes'), async (req, res) => {
        try {
            const { title, key, background } = req.body;
            const update = { title, key, background, updatedAt: new Date(), updatedBy: req.user.id };
            if (req.file) update.notes = req.file.filename;

            const topic = await Topic.findByIdAndUpdate(req.params.id, update, { new: true });

            if (!topic) return res.status(404).json({ message: 'Topic not found' });

            // Send email to the creator
            const populatedTopic = await Topic.findById(req.params.id).populate('createdBy');
            if (populatedTopic?.createdBy?.email) {
                await sendEmail({
                    to: populatedTopic.createdBy.email,
                    subject: 'Your Document Has Been Updated',
                    text: `Your document "${populatedTopic.title}" has been updated.`
                });
            }

            res.json({ message: 'Topic updated', topic });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Delete topic
    app.delete('/api/topics/:id', auth([0]), async (req, res) => {
        try {
            const topic = await Topic.findByIdAndDelete(req.params.id);
            if (!topic) return res.status(404).json({ message: 'Topic not found' });
            res.json({ message: 'Topic deleted' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // --- Comment/Reply Routes ---

    // Get comments for a topic
    app.get('/api/topics/:id/comments', auth([0, 1, 2]), async (req, res) => {
        const comments = await Comment.find({ topicId: req.params.id })
            .populate('userId', 'name')
            .lean();

        // Populate userId for each reply manually
        for (const comment of comments) {
            if (comment.replies && comment.replies.length) {
                for (const reply of comment.replies) {
                    if (reply.userId) {
                        const user = await RegisterRequest.findById(reply.userId).select('name');
                        reply.userId = user ? { _id: user._id, name: user.name } : null;
                    }
                }
            }
        }
        res.json({ comments });
    });

    // Add comment
    app.post('/api/topics/:id/comments', auth([0, 1]), async (req, res) => {
        try {
            const comment = new Comment({
                topicId: req.params.id,
                userId: req.user.id,
                text: req.body.text
            });
            await comment.save();

            const topic = await Topic.findById(req.params.id).populate('createdBy');
            if (topic?.createdBy?.email) {
                await sendEmail({
                    to: topic.createdBy.email,
                    subject: 'New Comment on Your Document',
                    text: `A new comment was added to your document "${topic.title}".`
                });
            }

            res.status(201).json({ comment });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Delete own comment
    app.delete('/api/comments/:id', auth([0, 1]), async (req, res) => {
        try {
            const comment = await Comment.findById(req.params.id);
            if (!comment || comment.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
            await comment.deleteOne();
            res.json({ message: 'Comment deleted' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Add reply
    app.post('/api/comments/:id/replies', auth([0, 1]), async (req, res) => {
        try {
            const comment = await Comment.findById(req.params.id);
            if (!comment) return res.status(404).json({ message: 'Comment not found' });
            comment.replies.push({ userId: req.user.id, text: req.body.text });
            await comment.save();
            res.json({ comment });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // --- Stats/Dashboard Routes ---

    // API: Get total topics count
    app.get('/api/stats/topics-count', async (req, res) => {
        try {
            const count = await Topic.countDocuments();
            res.json({ count });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // API: Get total users count
    app.get('/api/stats/users-count', async (req, res) => {
        try {
            const count = await RegisterRequest.countDocuments({ status: 'approved' });
            res.json({ count });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // API: Get user contributions (comments + topics created)
    app.get('/api/stats/user-contributions/:userId', async (req, res) => {
        try {
            const userId = req.params.userId;
            const topics = await Topic.countDocuments({ createdBy: userId });
            const comments = await Comment.countDocuments({ userId });
            res.json({ topics, comments, total: topics + comments });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Admin dashboard: stats
    app.get('/api/admin/stats', auth([0, 1]), async (req, res) => {
        try {
            const totalUsers = await RegisterRequest.countDocuments({ status: 'approved' });
            const totalTopics = await Topic.countDocuments();
            // Topics created this month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const topicsMonth = await Topic.countDocuments({ createdAt: { $gte: startOfMonth } });
            // Comments created today
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const commentsToday = await Comment.countDocuments({ createdAt: { $gte: startOfDay } });
            res.json({ users: totalUsers, topics: totalTopics, topicsMonth, commentsToday });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // --- Profile Endpoints ---

    // Get profile
    app.get('/api/profile', requireAuth, async (req, res) => {
        try {
            // req.user.id is set by the auth middleware
            const user = await RegisterRequest.findById(req.user.id).lean();
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json({ profile: user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Update profile (name, email, role)
    app.put('/api/profile', requireAuth, async (req, res) => {
        const { name, email, role } = req.body;
        try {
            const user = await RegisterRequest.findById(req.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            if (name) user.name = name;
            if (email) user.email = email;
            // Only allow role update if a valid role is provided and is one of the accepted values
            if (role !== undefined && [0, 1, 2].includes(role)) user.role = role;
            await user.save();
            res.json({ message: 'Profile updated' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Update contact info
    app.put('/api/profile/contact', requireAuth, async (req, res) => {
        const { phone, address } = req.body;
        try {
            const user = await RegisterRequest.findById(req.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            if (phone !== undefined) user.phone = phone;
            if (address !== undefined) user.address = address;
            await user.save();
            res.json({ message: 'Contact info updated' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Get profile stats (admin)
    app.get('/api/profile/stats', requireAuth, async (req, res) => {
        const userId = req.user.id;
        try {
            const user = await RegisterRequest.findById(userId);
            let documents = 0, users = 0, contributions = 0;
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Stats relevant to admin/manager (role 0 or 1)
            if (user.role === 0 || user.role === 1) {
                documents = await Topic.countDocuments({ createdBy: userId });
                users = await RegisterRequest.countDocuments({});
                const comments = await Comment.countDocuments({ userId });
                contributions = documents + comments;
            }
            res.json({ documents, users, contributions });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });


    // Default route
    // app.get('/', (req, res) => {
    //     res.send('Backend API is running!');
    // });

    return app;
};