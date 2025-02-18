const questionRepo = require('../repositories/question.repository');

exports.createQuestion = async (req, res) => {
  try {
    const { text, type, options } = req.body;
    const question = await questionRepo.createQuestion({ text, type, options });
    res.status(201).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await questionRepo.getAllQuestions();
    res.json({ success: true, count: questions.length, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await questionRepo.getQuestionById(id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { questionId, response } = req.body;
    const userId = req.user.id;

    const answer = await questionRepo.createAnswer({
      question: questionId,
      user: userId,
      response,
    });
    res.status(201).json({ success: true, answer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuestionsWithAnswers = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await questionRepo.getQuestionsWithAnswers(questionId);
    res.json({ success: true, question: question });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnswersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const answers = await questionRepo.getAnswersByUser(userId);
    res.json({ success: true, count: answers.length, answers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
