function createCrudController(service) {
  return {
    async list(req, res) {
      const result = await service.list(req.user.instituteId, req.query);
      res.status(200).json(result);
    },

    async getById(req, res) {
      const data = await service.getById(req.user.instituteId, req.params.id);
      res.status(200).json({ data });
    },

    async create(req, res) {
      const data = await service.create(req.user.instituteId, req.body);
      res.status(201).json({ data });
    },

    async update(req, res) {
      const data = await service.update(
        req.user.instituteId,
        req.params.id,
        req.body,
      );
      res.status(200).json({ data });
    },

    async remove(req, res) {
      await service.remove(req.user.instituteId, req.params.id);
      res.status(204).send();
    },
  };
}

module.exports = createCrudController;
