module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 80,
      statements: 80
    }
  },
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/tests/**/*.test.js']
};
module.exports = {
  rootDir: '.',
  moduleDirectories: ['node_modules'],
  testEnvironment: 'node',
  verbose: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  // Ignorar package.json duplicados
  modulePathIgnorePatterns: ['<rootDir>/package.json']
};
