const Joi = require('joi');

const JobPayloadSchema = Joi.object({
  company_id: Joi.string().required(),
  category_id: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  job_type: Joi.string().required(),
  experience_level: Joi.string().required(),
  location_type: Joi.string().required(),
  location_city: Joi.string().allow('', null).optional(),
  salary_min: Joi.number().allow(null).optional(),
  salary_max: Joi.number().allow(null).optional(),
  is_salary_visible: Joi.boolean().optional(), 
  status: Joi.string().optional(),             
});

module.exports = { JobPayloadSchema };