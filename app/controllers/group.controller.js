const Group = require('../models/group.model');
const PurchasePlan = require('../models/purchasePlan.model');
const ClientError = require('../../shared/client-error');
const handleResponse = require('../../shared/responsehandler');
const ServerError = require('../../shared/server-error');
const {StatusCodes} = require('http-status-codes');
const groupValidator = require('../validators/group.validator');
const User = require('../models/user.model');
const moment  = require('moment');

const INVALID_REQUEST_BODY_FORMAT = 'Invalid Request Body Format';

exports.createGroup = async (req, res, next) => {
    try {
      const { name } = req.body;
      const customerId = req.user.id;
  
      const {error} = groupValidator.validateCreateGroup(req.body);
      if (error) {
          throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
      }
      const timeStamp = moment().unix();
      const customerPlan = await PurchasePlan.findOne({customer: customerId, validity: {$gt: timeStamp}})
      if (!customerPlan) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Access Denied. Customer does not have a valid Plan.');
      }

      const existingGroup = await Group.findOne({ members: customerId });
      if (existingGroup) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'You already belong to a friends group.');
      }

      const result =  await Group.findOneAndUpdate(
        { name: name},
        { $set:{creator: customerId}, $addToSet: { members: customerId }},
        {new: true, upsert: true })
  
      return handleResponse(req, res, next, StatusCodes.OK, {groupId: result._id}, 'Friends group created successfully!', '', null);
    } catch (error) {
      if (error instanceof ClientError) {
        return next(error)
      }
      next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while creating the friends group.', error.message));
    }
  };

  exports.addMemberToFriendGroup = async (req, res, next) => {
    try {
      const groupId = req.params.groupId;
      const memberId = req.body.memberId;

      const {error} = groupValidator.validateAddMemberToGroup(req.body);
      if (error) {
          throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
      }

      // Find the friend group by ID
      const friendGroup = await Group.findById(groupId);
      if (!friendGroup) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Friend Group not found.');
      }
      // Check if the user making the request is the creator of the group
      if (friendGroup.creator.toString() !== req.user.id.toString()) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Access denied. Only the creator can add members.');
      }
  
      const customerPlan = await PurchasePlan.findOne({customer: req.user.id}).populate({
        path: 'plan',
        select: 'maxConnections',
      })
      if (!customerPlan) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Access Denied. Customer does not have a valid Plan.');
      }

      if(friendGroup.members.length>=customerPlan.plan.maxConnections){
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Cannot add member to the group as Max Connections exceeded.');
      }

      // Check if the member being added exists in the User collection
      const member = await User.findById(memberId);
      if (!member) {
        return res.status(404).json({ message: 'Member not found.' });
      }
  
      await Group.findByIdAndUpdate(
        groupId,
        { $addToSet: { members: memberId }})
  
      return handleResponse(req, res, next, StatusCodes.OK, {groupId: groupId}, 'Added member to group successfully!', '', null);
    } catch (error) {
      if (error instanceof ClientError) {
        return next(error)
      }
      next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while adding Member to friends group.', error.message));
    }
  };
  