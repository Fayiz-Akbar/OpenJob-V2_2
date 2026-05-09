const Joi = require('joi');

const BookmarkPayloadSchema = Joi.object({
  job_id: Joi.string().required(),
});

module.exports = { BookmarkPayloadSchema };