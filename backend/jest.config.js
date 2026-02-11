module.exports = {
  // Test environment
  testEnvironment: "node",

  // Test file patterns
  testMatch: [
    "**/test/**/*.test.js", // Tìm trong thư mục test/
    "**/test/**/*.spec.js", // Hỗ trợ cả .spec.js
  ],

  // Coverage directory
  coverageDirectory: "coverage",

  // Files to collect coverage from
  collectCoverageFrom: [
    "controllers/**/*.js",
    "models/**/*.js",
    "routes/**/*.js",
    "config/**/*.js",
    "!**/node_modules/**",
    "!**/test/**",
  ],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles
  detectOpenHandles: false,
};
