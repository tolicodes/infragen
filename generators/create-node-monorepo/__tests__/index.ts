describe("@infragen/generator-create-node-monorepo", () => {
  it.todo("should run the create-github-project generator");

  it.todo("should run create-node-module generator");

  it.todo("should run npm init");

  it.todo(
    "setup package.json for the base project with the name provided in the create-github-project generator"
  );

  it.todo("should install lerna globally `npm i -g lerna`");

  it.todo("should run `lerna init`");

  it.todo("should set the npmClient to yarn in lerna.json");
  // {
  //   npmClient: "yarn"
  // };

  // note that this next test is intentionally vague for now since it's going to take some thinking
  it.todo(
    "should ask for the names of our packages and how we want to organize our packages and writes it to lerna.json"
  );

  it.todo("should run add-ts generator");
  it.todo("should run add-jest generator");
});
