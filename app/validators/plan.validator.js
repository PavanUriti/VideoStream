// 'use strict';
const Joi = require('joi');
const nameRegex =require('../../shared/regular-expression').NAME;

exports.validateCreateorUpdatePlan = validateCreateorUpdatePlan;

/**
 *
 * @param {*} user schema
 * @return {validationResult} validationResult
 */
function validateCreateorUpdatePlan(plan) {
    const schema = Joi.object({
        name: Joi.string().regex(nameRegex).min(3).max(50).required(),
        description: Joi.string().allow(''),
        price: Joi.string().required(),
        maxConnections: Joi.string().required(),
        validity: Joi.string().required(),
      })

    return schema.validate(plan);
}

