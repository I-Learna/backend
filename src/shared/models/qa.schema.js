const { Schema } = require('mongoose');

module.exports.QASchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    question: { type: String, required: true },
    askedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [
      {
        answer: { type: String, required: true },
        answeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);
