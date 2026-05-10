const InvariantError = require('../../exceptions/InvariantError');
const { JobPayloadSchema } = require('./schema');

const JobsValidator = {
  validateJobPayload: (payload) => {
    const validationResult = JobPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = JobsValidator;