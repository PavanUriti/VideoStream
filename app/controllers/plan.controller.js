const Plan = require('../models/plan.model');
const ClientError = require('../../shared/client-error');
const handleResponse = require('../../shared/responsehandler');
const ServerError = require('../../shared/server-error');
const {StatusCodes} = require('http-status-codes');
const planValidator = require('../validators/plan.validator');
const Video = require('../models/video.model');

const INVALID_REQUEST_BODY_FORMAT = 'Invalid Request Body Format';

exports.createPlan = async (req, res, next) => {
  try {
    const { name, description, price, maxConnections, validity } = req.body;
    const {error} = planValidator.validateCreateorUpdatePlan(req.body);
    if (error) {
        throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
    }
    const plan = new Plan({ name, description, price, maxConnections, validity});
    const result = await plan.save();

    return handleResponse(req, res, next, StatusCodes.OK, {id:result._id}, 'Plan created successfully!', '', null);
  } catch (error) {
    if (error instanceof ClientError) {
      return next(error)
    }
    next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while creating the plan.', error.message));
  }
};

exports.getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find().select('-createdAt -updatedAt');

    return handleResponse(req, res, next, StatusCodes.OK, plans, 'Plans Fetched successfully!', '', null);
  } catch (error) {
    if (error instanceof ClientError) {
      return next(error)
    }
    next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while fetching the plans.', error.message));
  }
};

exports.updatePlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const {error} = planValidator.validateCreateorUpdatePlan(req.body);;
    if (error) {
        throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
    }
    const { name, description, price, maxConnections, validity} = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new ClientError(StatusCodes.BAD_REQUEST, 'Plan not found.');
    }
    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      { name, description, price, maxConnections, validity},
      { new: true }
    );

    return handleResponse(req, res, next, StatusCodes.OK, {id:planId}, 'Plan Updated successfully!', '', null);
  } catch (error) {
    if (error instanceof ClientError) {
      return next(error)
    }
    next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while updating the plan.', error.message));
  }
};

exports.deletePlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new ClientError(StatusCodes.BAD_REQUEST, 'Plan not found.');
    }
    await Plan.findByIdAndDelete(planId);

    await Video.updateMany({},{$pullAll:{plan:[planId]}})
    
    return handleResponse(req, res, next, StatusCodes.OK, {id:planId}, 'Plan deleted successfully!', '', null);
  } catch (error) {
    if (error instanceof ClientError) {
      return next(error)
    }
    next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while deleting the plan.', error.message));
  }
};
