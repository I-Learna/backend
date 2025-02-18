const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const { protect } = require('../middlewares/authMiddleware');

router.post('/questions', questionController.createQuestion);
router.get('/questions', questionController.getAllQuestions);
router.get('/questions/:id', questionController.getQuestionById);
router.post('/answers', protect, questionController.submitAnswer);
router.get(
  '/questions/with-answers/:questionId',
  protect,
  questionController.getQuestionsWithAnswers
);
router.get('/answers/user/:userId', protect, questionController.getAnswersByUser);

module.exports = router;
