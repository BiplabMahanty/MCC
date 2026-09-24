function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function searchFilter(search, fields) {
  if (!search) {
    return {};
  }

  const expression = new RegExp(escapeRegex(search), 'i');
  return {
    $or: fields.map((field) => ({ [field]: expression })),
  };
}

module.exports = {
  escapeRegex,
  searchFilter,
};
