import Joi from "joi";
import dotenv from "dotenv";
dotenv.config();

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(8000),
  ACCESS_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRATION: Joi.number().required(),
  REFRESH_SECRET: Joi.string().required(),
  REFRESH_TOKEN_EXPIRATION: Joi.number().required(),
  DB_URL: Joi.string().required(),
  FRONTEND_URL: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_S3_BUCKET_NAME: Joi.string().required(),
  AWS_S3_BUCKET_PATH: Joi.string().required(),
  SES_SMTP_HOST: Joi.string().required(),
  SES_SMTP_PORT: Joi.string().required(),
  SES_SMTP_USERNAME: Joi.string().required(),
  SES_SMTP_PASSWORD: Joi.string().required(),
  SMTP_FROM_EMAIL: Joi.string().required(),
  SALT_ROUNDS: Joi.number().required(),
  GOOGLE_OAUTH_CLIENT: Joi.string().required(),
  LINKEDIN_CLIENT_ID: Joi.string().required(),
  LINKEDIN_CLIENT_SECRET: Joi.string().required(),
  LINKEDIN_REDIRECT_URI: Joi.string().required(),
})
  .unknown()
  .required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config Validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  accessSecret: envVars.ACCESS_SECRET,
  accessTokenExpiration: envVars.ACCESS_TOKEN_EXPIRATION,
  refreshSecret: envVars.REFRESH_SECRET,
  refreshTokenExpiration: envVars.REFRESH_TOKEN_EXPIRATION,
  mysql: {
    host: envVars.DB_URL,
  },
  frontEndUrl: envVars.FRONTEND_URL,
  awsRegion: envVars.AWS_REGION,
  awsS3BucketName: envVars.AWS_S3_BUCKET_NAME,
  awsS3BucketPath: envVars.AWS_S3_BUCKET_PATH,
  sesSmtpHost: envVars.SES_SMTP_HOST,
  sesSmtpPort: envVars.SES_SMTP_PORT,
  sesSmtpUsername: envVars.SES_SMTP_USERNAME,
  sesSmtpPassword: envVars.SES_SMTP_PASSWORD,
  smtpFromEmail: envVars.SMTP_FROM_EMAIL,
  saltRounds: envVars.SALT_ROUNDS,
  googleOauthClient: envVars.GOOGLE_OAUTH_CLIENT,
  linkedinClientId: envVars.LINKEDIN_CLIENT_ID,
  linkedinClientSecret: envVars.LINKEDIN_CLIENT_SECRET,
  linkedinRedirectUri: envVars.LINKEDIN_REDIRECT_URI,
  paymentWorkingKey: envVars.PAYMENT_WORKING_KEY,
  paymentAccessCode: envVars.PAYMENT_ACCESS_CODE,
};

export default config;
