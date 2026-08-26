process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://bms_user:change_me@localhost:5432/bms_test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_jwt_secret_that_is_long_enough_for_validation';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
