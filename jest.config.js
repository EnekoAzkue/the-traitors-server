/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: 'ts-jest',          // Transforma TypeScript automáticamente
  testEnvironment: 'jest-environment-node',    // Entorno Node.js
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/__test__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
};