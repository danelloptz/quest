
const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');

// Маршруты для работы с попытками
router.post('/', attemptController.getOrCreateAttempt);
router.get('/:id', attemptController.getAttemptDetails);
router.get('/:id/questions', attemptController.getAttemptQuestions);
router.put('/:id/answers/:questionId', attemptController.saveAnswer);
router.post('/:id/finish', attemptController.finishAttempt);
router.get('/:id/result', attemptController.getAttemptResult);

module.exports = router;