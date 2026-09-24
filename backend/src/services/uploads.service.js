const path = require('node:path');
const { randomUUID } = require('node:crypto');

const {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const env = require('../config/env');
const AppError = require('../utils/AppError');

const extensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
};

function storageConfigured() {
  return Boolean(
    env.objectStorageEndpoint &&
    env.objectStorageBucket &&
    env.objectStorageAccessKeyId &&
    env.objectStorageSecretAccessKey &&
    env.objectStoragePublicBaseUrl,
  );
}

function createClient() {
  if (!storageConfigured()) {
    throw new AppError(
      'Object storage is not configured.',
      503,
      'STORAGE_NOT_CONFIGURED',
    );
  }

  return new S3Client({
    endpoint: env.objectStorageEndpoint,
    region: env.objectStorageRegion,
    credentials: {
      accessKeyId: env.objectStorageAccessKeyId,
      secretAccessKey: env.objectStorageSecretAccessKey,
    },
  });
}

async function createQuestionImageUpload(instituteId, input) {
  const originalExtension = path.extname(input.fileName).toLowerCase();
  const extension = extensions[input.mimeType];

  if (originalExtension && !['.jpeg', extension].includes(originalExtension)) {
    throw new AppError(
      'File extension does not match its content type.',
      400,
      'INVALID_FILE_TYPE',
    );
  }

  const storageKey = `institutes/${instituteId}/questions/${randomUUID()}${extension}`;
  const metadata = { size: String(input.size) };
  const command = new PutObjectCommand({
    Bucket: env.objectStorageBucket,
    Key: storageKey,
    ContentType: input.mimeType,
    Metadata: metadata,
  });
  const uploadUrl = await getSignedUrl(createClient(), command, {
    expiresIn: env.objectStorageSignedUrlTtlSeconds,
  });
  const publicBaseUrl = env.objectStoragePublicBaseUrl.replace(/\/$/, '');

  return {
    uploadUrl,
    url: `${publicBaseUrl}/${storageKey}`,
    storageKey,
    expiresIn: env.objectStorageSignedUrlTtlSeconds,
    headers: {
      'Content-Type': input.mimeType,
      'x-amz-meta-size': String(input.size),
    },
  };
}

async function verifyQuestionImage(image) {
  let metadata;
  try {
    metadata = await createClient().send(
      new HeadObjectCommand({
        Bucket: env.objectStorageBucket,
        Key: image.storageKey,
      }),
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      'Question image was not found in object storage.',
      400,
      'INVALID_IMAGE_UPLOAD',
    );
  }

  const actualSize = metadata.ContentLength;
  const declaredSize = Number(metadata.Metadata?.size);
  if (
    !Number.isFinite(actualSize) ||
    actualSize <= 0 ||
    actualSize > 5 * 1024 * 1024 ||
    actualSize !== declaredSize ||
    metadata.ContentType !== image.mimeType
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
