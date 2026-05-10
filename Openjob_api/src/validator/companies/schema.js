const Joi = require('joi');

const CompanyPayloadSchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().required(),
  description: Joi.string().allow('', null).optional(), // Boleh kosong/tidak dikirim
});

module.exports = { CompanyPayloadSchema };