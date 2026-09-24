function paginationMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

function paginationWindow(page, limit) {
  return {
    skip: (page - 1) * limit,
    limit,
  };
}

module.exports = {
  paginationMeta,
  paginationWindow,
};
