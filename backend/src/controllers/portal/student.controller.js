const studentService = require('../../services/portal/student.service');

function handler(serviceMethod) {
  return async function portalHandler(req, res) {
    const data = await serviceMethod(req.user._id, req.user.instituteId);
    res.status(200).json({ data });
  };
}

module.exports = {
  getBatch: handler(studentService.getBatch),
  getDashboard: handler(studentService.getDashboard),
  getProfile: handler(studentService.getProfile),
  getSubjects: handler(studentService.getSubjects),
  getTeachers: handler(studentService.getTeachers),
};
