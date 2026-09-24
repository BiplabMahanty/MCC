function plain(document) {
  return document?.toObject ? document.toObject() : document;
}

function publicPerson(document, profileKey) {
  const value = plain(document);
  if (!value) {
    return null;
  }

  const profile = plain(value[profileKey]) || {};
  const result = { ...value, ...profile };

  delete result.passwordHash;
  delete result.refreshTokens;
  delete result.studentProfile;
  delete result.teacherProfile;
  delete result.isDeleted;
  delete result.deletedAt;
  delete result.__v;

  return result;
}

module.exports = {
  publicPerson,
};
