// 'use strict';
const Joi = require('joi');
const nameRegex =require('../../shared/regular-expression').NAME;

exports.validateUploadVideo = validateUploadVideo;
exports.validateFetchVideos = validateFetchVideos;

/**
 *
 * @param {*} user schema
 * @return {validationResult} validationResult
 */
function validateUploadVideo(video) {
    const schema = Joi.object({
        title: Joi.string().regex(nameRegex).min(3).max(50).required(),
      })

    return schema.validate(video);
}

/**
 *
 * @param {*} user schema
 * @return {validationResult} validationResult
 */
function validateFetchVideos(video) {
    const schema = Joi.object({
        pagination: Joi.object().keys({
            pageIndex: Joi.number().min(1).required(),
            pageSize: Joi.number().max(1000).min(1).required(),
            sort: Joi.object().keys({
                column: Joi.string().required(),
                direction: Joi.string().required(),
            }),
        }).optional(),
      })

    return schema.validate(video);
}