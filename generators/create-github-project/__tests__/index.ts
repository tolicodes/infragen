import testCLI from "@infragen/util-test-cli";
import { ENTER } from "@infragen/util-send-inputs-to-cli";

describe("@infragen/generator-create-github-project", () => {
  it("should ask the user for the name of the project", async () => {
    const { code, error, output } = await testCLI({
      bashCommand: `ts-node ../`,
      inputs: [
        // Answers "Name of the project"
        "my-new-project",

        // Continue
        ENTER
      ]
    });

    expect(error.mock.calls.length).toBe(0);

    expect(code).toBe(0);

    expect(output).toBeCalledWith(
      expect.stringMatching(/What is the name of your project\?/)
    );
  });

  it("should create a local directory with that name");

  it("should run `git init`");

  // @todo figure this out laters
  // it('should create a remote Github project with that name');
  it(
    "should ask the user to create a remote Github project with that name and pass the url for the origin"
  );

  it("should link the origin of the local directory to the Github project");

  it("should add a README.md file");
});
