import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.e2e-spec\\.ts$',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        rootDir: '.',
      },
    }],
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default config;
