const { randomUUID } = require('node:crypto');
const cloudinary = require('cloudinary').v2;
const env = require('../config/env');
const AppError = require('../utils/AppError');

function storageConfigured() {
  return Boolean(
    env.cloudinaryCloudName &&
    env.cloudinaryApiKey &&
    env.cloudinaryApiSecret,
  );
}

function getCloudinary() {
  if (!storageConfigured()) {
    throw new AppError(
      'Object storage is not configured.',
      503,
      'STORAGE_NOT_CONFIGURED',
    );
  }

  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });

  return cloudinary;
}

async function createQuestionImageUpload(instituteId, input) {
  const client = getCloudinary();
  const publicId = `institutes/${instituteId}/questions/${randomUUID()}`;
  const timestamp = Math.floor(Date.now() / 1000);

  const paramsToSign = {
    folder: `institutes/${instituteId}/questions`,
    public_id: publicId,
    timestamp,
    overwrite: false,
  };

  const signature = client.utils.api_sign_request(
    paramsToSign,
    env.cloudinaryApiSecret,
  );

  const uploadUrl = `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`;
  const publicUrl = `https://res.cloudinary.com/${env.cloudinaryCloudName}/image/upload/${publicId}`;

  return {
    uploadUrl,
    url: publicUrl,
    storageKey: publicId,
    expiresIn: env.cloudinarySignedUrlTtlSeconds,
    headers: {
      'Content-Type': input.mimeType,
    },
    fields: {
      api_key: env.cloudinaryApiKey,
      timestamp: String(timestamp),
      signature,
      public_id: publicId,
      folder: `institutes/${instituteId}/questions`,
      overwrite: 'false',
    },
  };
}

async function verifyQuestionImage(image) {
  const client = getCloudinary();

  let result;
  try {
    result = await client.api.resource(image.storageKey, { resource_type: 'image' });
  } catch {
    throw new AppError(
      'Question image was not found in object storage.',
      400,
      'INVALID_IMAGE_UPLOAD',
    );
  }

  const actualSize = result.bytes;
  if (
    !Number.isFinite(actualSize) ||
    actualSize <= 0 ||
    actualSize > 5 * 1024 * 1024
  ) {
    throw new AppError(
      'Question image metadata is invalid.',
      400,
      'INVALID_IMAGE_UPLOAD',
    );
  }
}

module.exports = {
  createQuestionImageUpload,
  storageConfigured,
  verifyQuestionImage,
};
