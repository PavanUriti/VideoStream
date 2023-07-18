# Video Streaming and Subscription Platform Backend

This repository contains the backend implementation of a video streaming and subscription platform using Node.js, Express.js, MongoDB and Multer. The platform allows administrators to manage user registration, video uploading, subscription plans, and customer purchases. It also provides APIs for customer registration, login, and accessing videos based on their purchased plans.

API Endpoints:

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

// CURD for Admin
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

// Friends Group
publicRouter.post('/group', authenticateCustomer, groupController.createGroup);
publicRouter.put('/group/:groupId', authenticateCustomer, groupController.addMemberToFriendGroup);


Multer Integration:
The backend uses Multer, a middleware for handling file uploads in Node.js, to enable the `Upload Video API`.

Attaching Postman Collection APIs.

