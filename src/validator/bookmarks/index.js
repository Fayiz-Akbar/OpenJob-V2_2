const InvariantError = require('../../exceptions/InvariantError');
const { BookmarkPayloadSchema } = require('./schema');

const BookmarksValidator = {
  validateBookmarkPayload: (payload) => {
    const validationResult = BookmarkPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = BookmarksValidator;