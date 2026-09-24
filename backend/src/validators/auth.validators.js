const { z } = require('zod');

const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());
const refreshToken = z.string().trim().min(64).max(256);

const loginSchema = z
  .object({
    email,
    password: z.string().min(8).max(128),
  })
  .strict();

const refreshSchema = z
  .object({
    refreshToken,
  })
  .strict();

module.exports = {
  loginSchema,
  refreshSchema,
};
