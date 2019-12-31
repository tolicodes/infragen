describe("@infragen/generator-add-ts", () => {
  it("should run `yarn add --dev typescript`");

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
});
