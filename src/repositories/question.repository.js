const { Question, Answer } = require('../models/question.model');

exports.createQuestion = async (questionData) => {
  return new Question(questionData).save();
};

exports.getAllQuestions = async () => {
  return Question.find();
};

exports.getQuestionById = async (id) => {
  return Question.findById(id);
};

exports.createAnswer = async (answerData) => {
  return new Answer(answerData).save();
};

exports.getQuestionsWithAnswers = async (questionId) => {
  return Answer.find({ question: questionId })
    .populate('question', 'text type options')
    .populate('user', 'name email')
    .select('-createdAt -__v');
};

exports.getAnswersByUser = async (userId) => {
  return Answer.find({ user: userId })
    .populate('question', 'text type options')
    .populate('user', 'name email')
    .select('-createdAt -__v');
};
