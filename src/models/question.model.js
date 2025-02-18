const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['choose', 'open'], required: true },
  options: [{ type: String }], // only for "choose" type
  createdAt: { type: Date, default: Date.now },
});

const Question = mongoose.model('Question', QuestionSchema);

const AnswerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  response: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Answer = mongoose.model('Answer', AnswerSchema);

module.exports = { Question, Answer };
