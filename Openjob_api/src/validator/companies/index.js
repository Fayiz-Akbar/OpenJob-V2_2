const InvariantError = require('../../exceptions/InvariantError');
const { CompanyPayloadSchema } = require('./schema');

const CompaniesValidator = {
  validateCompanyPayload: (payload) => {
    const validationResult = CompanyPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CompaniesValidator;