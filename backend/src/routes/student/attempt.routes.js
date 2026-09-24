const express = require('express');

const controller = require('../../controllers/student/attempt.controller');

const router = express.Router();

router.get('/exams', controller.listExams);
router.get('/exams/:id', controller.getExam);
router.post('/exams/:id/attempt', controller.startAttempt);
router.get('/exams/:id/attempt', controller.getAttempt);
router.put('/exams/:id/attempt/answers', controller.syncAnswers);
router.post('/exams/:id/attempt/submit', controller.submitAttempt);

module.exports = router;
