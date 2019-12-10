describe("@infragen/generator-add-babel", () => {
  it("should run `yarn add --dev @babel/core @babel/cli @babel/preset-env`");

  // note we opt for a json file since writing to a JSON file programmatically will be simpler than the default .js file
  it("if we are in a Node app, we should setup preset-env targeting the current Node version in the babel.config.json file", () => {
    // {
    //   presets: [
    //     [
    //       "@babel/preset-env",
    //       {
    //         targets: {
    //           node: "current"
    //         }
    //       }
    //     ]
    //   ]
    // };
  });
});
