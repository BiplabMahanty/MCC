const express = require('express');

const controller = require('../../controllers/admin/exams.controller');

const router = express.Router();

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);
router.post('/:id/publish', controller.publish);
router.post('/:id/unpublish', controller.unpublish);

module.exports = router;
