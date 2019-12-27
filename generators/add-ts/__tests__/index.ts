describe("@infragen/generator-add-ts", () => {
  it("should run `yarn add --dev typescript ts-loader source-map-loader`");

  it(
    "should run `yarn add --dev ts-node @types/node` if it's in the context of a Node App"
  );

  it("should add start script to the package.json file", () => {
    // {
    //   scripts: {
    //     start: "yarn ts-node ."
    //   }
    // };
  });

  it("should add the babel loader if we are using Babel", () => {
    // {
    //   scripts: {
    //     presets: ["@babel/preset-typescript"];
    //   }
    // }
  });

  it("should write a blank tsconfig.json file", () => {
    // {}
  });
});
