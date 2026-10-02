const teacherService = require('../../services/portal/teacher.service');

function handler(serviceMethod) {
  return async function portalHandler(req, res) {
    const data = await serviceMethod(req.user._id, req.user.instituteId);
    res.status(200).json({ data });
  };
}

module.exports = {
  getBatches: handler(teacherService.getBatches),
  getDashboard: handler(teacherService.getDashboard),
  getProfile: handler(teacherService.getProfile),
  getSchedule: handler(teacherService.getSchedule),
  getStudents: handler(teacherService.getStudents),
  getSubjects: handler(teacherService.getSubjects),
};
