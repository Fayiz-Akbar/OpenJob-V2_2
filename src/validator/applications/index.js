const InvariantError = require('../../exceptions/InvariantError');
const { PostApplicationPayloadSchema, PutApplicationPayloadSchema } = require('./schema');

const ApplicationsValidator = {
  validatePostApplicationPayload: (payload) => {
    const validationResult = PostApplicationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutApplicationPayload: (payload) => {
    const validationResult = PutApplicationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ApplicationsValidator;