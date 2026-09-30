const uploadsService = require('../services/uploads.service');

async function createQuestionImageUpload(req, res) {
  const data = await uploadsService.createQuestionImageUpload(
    req.user.instituteId,
    req.body,
  );
  res.status(201).json({ data });
}

async function createProfileImageUpload(req, res) {
  const data = await uploadsService.createProfileImageUpload(
    req.user.instituteId,
    req.body,
  );
  res.status(201).json({ data });
}

module.exports = {
  createQuestionImageUpload,
  createProfileImageUpload,
};
