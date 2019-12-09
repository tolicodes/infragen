describe("@infragen/generator-create-github-project", () => {
  it("should ask the user for the name of the project");
  it("should create a local directory with that name");
  it("should run `git init`");
  // it('should create a remote Github project with that name');
  it(
    "should ask the user to create a remote Github project with that name and pass the url for the origin"
  );
  it("should link the origin of the local directory to the Github project");
  it("should add a README.md file");
});
