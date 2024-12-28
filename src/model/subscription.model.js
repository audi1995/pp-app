const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
    serviceID: {
      type: String,
      required: true,
      unique: true
    },
    serviceName: {
      type: String,
      required: true
    },
    serviceLink: {
      type: String,
      required: true
    },
    monthlyFee: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }, {
      timestamps: true  
    });
  
  const Subscription = mongoose.model('Subscription', subscriptionSchema);
  
  module.exports = { Subscription };
  