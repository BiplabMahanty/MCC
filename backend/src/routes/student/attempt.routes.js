const express = require('express');

const controller = require('../../controllers/student/attempt.controller');
const { examAttemptRateLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.get('/exams', controller.listExams);
router.get('/exams/:id', controller.getExam);
router.post('/exams/:id/attempt', examAttemptRateLimiter, controller.startAttempt);
router.get('/exams/:id/attempt', examAttemptRateLimiter, controller.getAttempt);
router.put(
  '/exams/:id/attempt/answers',
  examAttemptRateLimiter,
  controller.syncAnswers,
);
router.post(
  '/exams/:id/attempt/submit',
  examAttemptRateLimiter,
  controller.submitAttempt,
);

module.exports = router;
