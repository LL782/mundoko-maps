import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config = {
  // automock: true,
  // bail: 0,
  clearMocks: true,
  // globalSetup: undefined,
  // globalTeardown: undefined,
  // globals: {},
  // maxWorkers: "50%",
  // moduleDirectories: [
  //   "node_modules"
  // ],
  // moduleFileExtensions: [
  //   "js",
  //   "mjs",
  //   "cjs",
  //   "jsx",
  //   "ts",
  //   "tsx",
  //   "json",
  //   "node"
  // ],
  // moduleNameMapper: {},
  // modulePathIgnorePatterns: [],
  // notify: false,
  // preset: undefined,
  // resetMocks: false,
  // resetModules: false,
  // resolver: undefined,
  // restoreMocks: false,
  // setupFiles: [],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // slowTestThreshold: 5,
  // snapshotSerializers: [],
  testEnvironment: "jsdom",
  // testEnvironmentOptions: {},
  // testLocationInResults: false,
  // testMatch: [
  //   "**/__tests__/**/*.[jt]s?(x)",
  //   "**/?(*.)+(spec|test).[tj]s?(x)"
  // ],
  // testPathIgnorePatterns: [
  //   "/node_modules/"
  // ],
  // testRegex: [],
  // testResultsProcessor: undefined,
  // transform: {},
  // transformIgnorePatterns: [
  //   "/node_modules/",
  //   "\\.pnp\\.[^\\/]+$"
  // ],
  // unmockedModulePathPatterns: undefined,
  verbose: true,
  // watchPathIgnorePatterns: [],
  // watchman: true,
};

export default createJestConfig(config);
