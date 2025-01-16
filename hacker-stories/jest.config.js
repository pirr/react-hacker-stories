module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest', // Transform JS, TS, and JSX files with Babel
  },
  moduleNameMapper: {
    '\\.module\\.css$': '<rootDir>/__mocks__/styleMock.js', // Mock CSS modules
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',         // Mock plain CSS
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',  // Path to the mock file
  },
  transformIgnorePatterns: [
    'node_modules/(?!(some-esm-module)/)', // Add any ESM modules that require transformation
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
