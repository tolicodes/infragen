describe("@infragen/generator-add-jest", () => {
  it("should run `yarn add --dev jest`");

  it("should add scripts to watch and start tests in package.json", () => {
    // {
    //   scripts: {
    //     test: "jest --config jest.config.json",
    //     "test:watch": "jest --config jest.config.json --watch"
    //   }
    // };
  });

  // note we opt for a json file since writing to a JSON file programatically will be simpler than the default .js file
  it("should create a jest.config.json file", () => {
    // {
    //   clearMocks: true,
    //   coverageDirectory: "coverage",
    //   testEnvironment: "node",
    // };
  });

  it(
    "should run `yarn add --dev babel-jest @babel/preset-env` if we are using Babel"
  );

  it("should add transform to the jest.config.json file if we are using Babel", () => {
    // {
    //   transform: {
    //     "^.+\\.jsx?$": "babel-jest",
    //   }
    // };
  });

  it("should run `yarn add --dev @types/jest ts-jest` if we are using TS");

  it("should add transform to the jest.config.json file if we are using TS", () => {
    // {
    //   transform: {
    //     "^.+\\.tsx?$": "ts-jest"
    //   }
    // };
  });
});
