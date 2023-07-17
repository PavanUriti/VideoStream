// 'use strict';
const Joi = require('joi');
const nameRegex =require('../../shared/regular-expression').NAME;
const Id =require('../../shared/regular-expression').ID;

exports.validateCreateGroup = validateCreateGroup;
exports.validateAddMemberToGroup = validateAddMemberToGroup;

/**
 *
 * @param {*} group schema
 * @return {validationResult} validationResult
 */
function validateCreateGroup(group) {
    const schema = Joi.object({
        name: Joi.string().regex(nameRegex).min(3).max(50).required(),
      })

    return schema.validate(group);
}

/**
 *
 * @param {*} group schema
 * @return {validationResult} validationResult
 */
function validateAddMemberToGroup(group) {
    const schema = Joi.object({
        memberId: Joi.string().regex(Id).required(),
      })

    return schema.validate(group);
}