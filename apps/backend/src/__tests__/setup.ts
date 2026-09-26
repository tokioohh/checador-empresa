// Variables de entorno mínimas para que env.ts no aborte durante los tests.
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
process.env.JWT_SECRET = "test-jwt-secret-with-enough-chars!!";
process.env.QR_SECRET = "test-qr-secret-value";
