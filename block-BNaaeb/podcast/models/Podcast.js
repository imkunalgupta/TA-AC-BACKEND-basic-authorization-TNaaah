const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let podcastApp = new Schema(
  {
    name: { type: String, required: true },
    audio: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    podcastType: { type: String, default: 'Free' },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Podcast', podcastApp);
