const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const apiKeySchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    secretKey: {
      type: String,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ApiKey', apiKeySchema);
