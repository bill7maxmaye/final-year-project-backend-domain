export enum MicroserviceErrorCode {
  VALIDATION_EXCEPTION = 'validation-exception',
  GENERIC_EXCEPTION = 'generic-exception',
  USER_ALREADY_EXISTS = 'user-already-exists',
  USER_NOT_FOUND = 'user-not-found',
  INTERNAL_SERVER_ERROR = 'internal-server-error',
  INVALID_CREDENTIALS = 'invalid-credentials',
  INVALID_VERIFICATION = 'invalid-verification',
  EMAIL_NOT_VERIFIED = 'email-not-verified',
  POST_NOT_FOUND = 'post-not-found',
  NOT_FOUND = 'not-found',
}
