describe("@infragen/generator-create-node-monorepo", () => {
  it("should run the create-github-project generator");

  it("should run npm init");

  it(
    "setup package.json for the base project with the name provided in the create-github-project generator"
  );

  it("should install lerna globally `npm i -g lerna`");

  it("should run `lerna init`");

  it("should set the npmClient to yarn in lerna.json", () => {
    // {
    //   npmClient: "yarn"
    // };
  });

  // note that this next test is intentionally vague for now since it's going to take some thinking
  it(
    "should ask for the names of our packages and how we want to organize our packages and writes it to lerna.json"
  );
});
