const PurchasePlan = require('../models/purchasePlan.model');
const Plan = require('../models/plan.model');
const ClientError = require('../../shared/client-error');
const handleResponse = require('../../shared/responsehandler');
const ServerError = require('../../shared/server-error');
const {StatusCodes} = require('http-status-codes');
const moment  = require('moment');

exports.buyPlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const customerId = req.user.id;

    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new ClientError(StatusCodes.BAD_REQUEST, 'Plan not found.');
    }
    const validity = moment().add(plan.validity, 'days').unix();
    const timeStamp = moment().unix();
    const purchase = new PurchasePlan({ customer: customerId, plan: planId, purchaseDate :timeStamp, validity: validity });
    const result = await purchase.save();

    return handleResponse(req, res, next, StatusCodes.OK, {id:result._id}, 'Plan purchased successfully!', '', null);
  } catch (error) {
    if (error instanceof ClientError) {
      return next(error)
    }
    next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while purchasing the plan.', error.message));
  }
};

  
