// 'use strict';
const Joi = require('joi');
const nameRegex =require('../../shared/regular-expression').NAME;

exports.validateCreateUser = validateCreateUser;
exports.validateLoginUser = validateLoginUser;

/**
 *
 * @param {*} user schema
 * @return {validationResult} validationResult
 */
function validateCreateUser(user) {
    const schema = Joi.object({
        username: Joi.string().regex(nameRegex).min(5).max(50).required(),
        email: Joi.string().email().allow(''),
        phone: Joi.string().allow(''),
        password: Joi.string().required(),
      }).custom((value, helpers) => {
        if (!value.email && !value.phone) {
          return helpers.message('"email" or "phone" is required');
        }
        return value;
      });

    return schema.validate(user);
}

/**
 * 
 * @param {*} user
 * @return {*} validation result
 */
function validateLoginUser(user) {
    const schema = Joi.object({
        email: Joi.string().email().allow(''),
        phone: Joi.string().allow(''),
        password: Joi.string().required(),
    }).custom((value, helpers) => {
        if (!value.email && !value.phone) {
          return helpers.message('"email" or "phone" is required');
        }
        return value;
    });

    return schema.validate(user);
}
