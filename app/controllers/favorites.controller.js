const mongoose = require('mongoose');
const Video = require('../models/video.model');
const Favorite = require('../models/favorite.model');
const ClientError = require('../../shared/client-error');
const handleResponse = require('../../shared/responsehandler');
const ServerError = require('../../shared/server-error');
const {StatusCodes} = require('http-status-codes');

exports.addToFavorites = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const customerId = req.user.id;

    const video = await Video.findById(videoId);
    if (!video) {
      throw new ClientError(StatusCodes.BAD_REQUEST, 'Video not found.', '');
    }

      await Favorite.updateOne(
      { customer: new mongoose.Types.ObjectId(customerId) },
      { $addToSet: { videos: videoId }},
      {upsert: true})

    return handleResponse(req, res, next, StatusCodes.OK, {videoId: videoId}, 'Video added to favorite gallery successfully!', '', null);
  } catch (error) {
    if (error instanceof ClientError) {
      return next(error)
    }
    next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while adding the video to favorite gallery.', error.message));
  }
};

exports.getFavorites = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const pageSize = req.query.pageSize || 10;
    const pageIndex = req.query.pageIndex || 1;

    const favoriteGallery = await Favorite.findOne({ customer: customerId },{videos:1}).populate({
      path: 'videos',
      select: '_id title',
      options: { 
        skip: (pageIndex - 1) * pageSize,
        limit: pageSize, 
      }
    });

    return handleResponse(req, res, next, StatusCodes.OK, favoriteGallery?favoriteGallery.videos:[], 'Favirotes Gallery Fetched successfully!', '', null);
  } catch (error) {
    if (error instanceof ClientError) {
      return next(error)
    }
    next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while fetching the favorite gallery.', error.message));
  }
};
