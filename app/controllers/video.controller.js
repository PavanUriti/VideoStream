const fs = require('fs');
const path = require('path');
const Video = require('../models/video.model');
const Plan = require('../models/plan.model');
const User = require('../models/user.model');
const PurchasePlan = require('../models/purchasePlan.model');
const mongoose = require('mongoose');
const ClientError = require('../../shared/client-error');
const handleResponse = require('../../shared/responsehandler');
const ServerError = require('../../shared/server-error');
const {StatusCodes} = require('http-status-codes');
const videoValidator = require('../validators/video.validator');
const moment  = require('moment');

const INVALID_REQUEST_BODY_FORMAT = 'Invalid Request Body Format';

exports.uploadVideo = async (req, res, next) => {
  try {
    const { title} = req.body;
    const uploadedBy = req.user.id;
    const url = req.file? req.file.path: null;

    if(!url){
      throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, 'Video is required.');
    }

    const {error} = videoValidator.validateUploadVideo(req.body);
    if (error) {
        throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
    }

    const video = new Video({ title, url, uploadedBy });
    const result = await video.save();

    return handleResponse(req, res, next, StatusCodes.OK, {id:result._id, title: result.title}, 'Video uploaded successfully!', '', null); 
  } catch (error) {
    if (error instanceof ClientError) {
      return next(error)
    }
    next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while uploading the video.', error.message));
    }
};

exports.streamVideo = async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const customerId = req.user.id; 
      const video = await Video.findById(videoId);
  
      if (!video) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Video not found.', '');
      }
      const timeStamp = moment().unix();
      const customerPlan = await PurchasePlan.findOne({ customer: customerId, validity: {$gt: timeStamp} },{plan:1})
      if (!customerPlan) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Access Denied. Customer does not have a valid Plan.');
      }

      const isAccesiable = await Video.findOne({ _id: videoId, plan:  { $elemMatch: { $eq: customerPlan.plan} }});
      if (!isAccesiable) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Access Denied. Customer does not have a access to video.', '');
      }

      const videoPath = path.join(__dirname, '..', '..', video.url);
      const videoStat = fs.statSync(videoPath);
      const fileSize = videoStat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }
    } catch (error) {
      if (error instanceof ClientError) {
        return next(error)
      }
      next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while streaming the video.', error.message));
    }
  };

  exports.mapVideoToPlan = async (req, res, next) => {
    try {
      const { planId, videoId } = req.params;
  
      const plan = await Plan.findById(planId);
      if (!plan) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Plan not found.', '');
      }
  
      const video = await Video.findById(videoId);
      if (!video) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Video not found.', '');
      }
  
      await Video.findByIdAndUpdate(
        videoId,
        { $addToSet: { plan: planId }})
  
      return handleResponse(req, res, next, StatusCodes.OK, {planId:planId}, 'Video mapped to plan successfully!', '', null); 
    } catch (error) {
      if (error instanceof ClientError) {
        return next(error)
      }
      next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while mapping the video to plan.', error.message));
    }
  };
  
exports.fetchVideosForCustomer = async (req, res, next) => {
    try {
      const customerId = req.user.id;

      const {error} = videoValidator.validateFetchVideos(req.body);
      if (error) {
          throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
      }

      let requestPaginationBody = req.body.pagination;
        if (!requestPaginationBody) {
            requestPaginationBody = {
                pageSize: 10,
                pageIndex: 1,
                sort: {
                  column: 'title',
                  direction: 'asc',
                },
            };
        }
        
        const pageSize = requestPaginationBody.pageSize;
        const pageIndex = requestPaginationBody.pageIndex;

      const timeStamp = moment().unix();
      const customerPlan = await PurchasePlan.findOne({ customer: customerId, validity: {$gt: timeStamp} },{plan:1})
      if (!customerPlan) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Access Denied. Customer does not have a valid Plan.');
      }

      requestPaginationBody.total = await Video.countDocuments({ plan:  { $elemMatch: { $eq: customerPlan.plan} }});
      const videos = await Video.aggregate([
        {$match: { plan:  { $elemMatch: { $eq: customerPlan.plan} }}},
        {$sort: {title: 1}},
        {$skip: (pageSize * pageIndex) - pageSize},
        {$limit: pageSize},
        {$project:{
          _id:0,
          id:'$_id',
          title:'$title',
        }}
      ])
  
      return handleResponse(req, res, next, StatusCodes.OK, videos, 'Videos Fetched successfully!', '', requestPaginationBody);
    } catch (error) {
      if (error instanceof ClientError) {
        return next(error)
      }
      next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while fetching videos for the customer.', error.message));
    }
  };

  exports.removeVideoFromPlan = async (req, res, next) => {
    try {
      const { planId, videoId } = req.params;
  
      const plan = await Plan.findById(planId);
      if (!plan) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Plan not found.', '');
      }
  
      const video = await Video.findById(videoId);
      if (!video) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Video not found.', '');
      }
  
      await Video.findByIdAndUpdate(
        videoId,
        { $pullAll: { plan: [planId] }})
  
      return handleResponse(req, res, next, StatusCodes.OK, {planId:planId}, 'Video removed from plan successfully!', '', null); 
    } catch (error) {
      if (error instanceof ClientError) {
        return next(error)
      }
      next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while removing video from plan.', error.message));
    }
  };