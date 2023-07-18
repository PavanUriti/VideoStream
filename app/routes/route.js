const express = require('express');
const multer = require('multer');
const path = require('path');
const {authenticateAdmin, authenticateCustomer} = require('../../auth/auth');
const userController = require('../controllers/user.controller');
const videoController = require('../controllers/video.controller');
const planController = require('../controllers/plan.controller');
const purchasePlanController = require('../controllers/purchasePlan.controller');
const favoritesController = require('../controllers/favorites.controller');
const groupController = require('../controllers/group.controller');
const ClientError = require('../../shared/client-error');
const publicRouter = express.Router();
exports.publicRouter = publicRouter;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    },
});

const fileFilter = function (req, file, cb) {
  const allowedMimeTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
  const allowedExtensions = ['.mp4', '.mpeg', '.mov'];

  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new ClientError('Only video files are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Admin Registration API
publicRouter.post('/register/admin', userController.adminRegistration);

// Customer Registration API
publicRouter.post('/register/customer', userController.customerRegistration);

// Common Login API for both users
publicRouter.post('/login', userController.login);

// Upload Video API only for Admin
publicRouter.post('/video/upload', authenticateAdmin, upload.single('video'), videoController.uploadVideo);
// Stream Video API only for Customer
publicRouter.post('/video/stream/:videoId', authenticateCustomer, videoController.streamVideo);
// Fetch Videos API only for Customer
publicRouter.post('/videos', authenticateCustomer, videoController.fetchVideosForCustomer);

//CURD for Admin
publicRouter.post('/plan', authenticateAdmin, planController.createPlan);
publicRouter.get('/plan', planController.getPlans);
publicRouter.put('/plan/:planId', authenticateAdmin, planController.updatePlan);
publicRouter.delete('/plan/:planId', authenticateAdmin, planController.deletePlan);

publicRouter.post('/plan/:planId/video/:videoId', authenticateAdmin, videoController.mapVideoToPlan);
publicRouter.post('/plan/:planId/removevideo/:videoId', authenticateAdmin, videoController.removeVideoFromPlan);

// Buy plan by customer
publicRouter.post('/plan/buy/:planId', authenticateCustomer, purchasePlanController.buyPlan);

// Fetch video's for customers
publicRouter.get('/favorite/gallery', authenticateCustomer, favoritesController.getFavorites);
publicRouter.post('/favorite/:videoId', authenticateCustomer, favoritesController.addToFavorites);

// Create Friends Group
publicRouter.post('/group', authenticateCustomer, groupController.createGroup);
publicRouter.put('/group/:groupId', authenticateCustomer, groupController.addMemberToFriendGroup);

