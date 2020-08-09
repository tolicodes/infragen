describe("@infragen/generator-add-jest", () => {
  it.todo("should run `yarn add --dev jest`");

  it.todo("should add scripts to watch and start tests in package.json");
  // {
  //   scripts: {
  //     test: "jest --config jest.config.json",
  //     "test:watch": "jest --config jest.config.json --watch"
  //   }
  // };

  // note we opt for a json file since writing to a JSON file programatically will be simpler than the default .js file
  it.todo("should create a jest.config.json file");
  // {
  //   testEnvironment: "node",
  // };

  it.todo("should run `yarn add --dev @types/jest ts-jest` if we are using TS");

  it.todo(
    "should add transform to the jest.config.json file if we are using TS"
  );

  // {
  //   transform: {
  //     "^.+\\.tsx?$": "ts-jest"
  //   }
  // };

  // we will configure this a little better later, but for now we will just
  // have a few strict rules that work with prettier
  it.todo("should have a tslint.yml with strict rules");
  // extends:
  //   - tslint:latest
  //   - tslint-config-prettier
  // rules:
  //   typedef:
  //     - true
  //     - call-signature
  //     - parameter
  //     - arrow-call-signature
  //     - property-declaration
  //     - variable-declaration
  //     - member-variable-declaration
  //     - object-destructuring
  //     - array-destructuring

  it.todo("if in lerna monorepo root");
  // add to jest.config.json
  // {
  //   "watchPlugins": ["jest-watch-lerna-packages"]
  // }
  // run
  // lerna add --scope=<root project name> --dev jest-watch-lerna-packages
});
