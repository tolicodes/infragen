import { existsSync } from "fs";
import { ensureDir, remove } from "fs-extra";
import { v4 as uuidv4 } from "uuid";

import testCLI from "@infragen/util-test-cli";
import { ENTER } from "@infragen/util-send-inputs-to-cli";

const TMP_DIR = "/tmp/";

describe("@infragen/generator-create-github-project", () => {
  let cwd;
  beforeEach(async () => {
    cwd = `${TMP_DIR}${uuidv4()}`;
    await ensureDir(cwd);
  });

  afterEach(async () => {
    await remove(cwd);
  });

  it("should throw an error if `cwd` is not passed", async () => {
    const { code, error } = await testCLI({
      bashCommand: `yarn start`,
      inputs: [
        // Answers "Name of the project"
        "my-new-project",
        // Continue
        ENTER
      ]
    });

    // errors listed below and for some reason a blank error
    // @todo look into this
    expect(error.mock.calls.length).toBe(3);
    expect(code).toBe(1);

    expect(error).toBeCalledWith(
      expect.stringMatching(/`cwd` is required. Pass it using the --cwd flag/)
    );

    // the script aborts
    expect(error).toBeCalledWith(
      expect.stringMatching(/Command failed with exit code 1./)
    );
  });

  it("should ask the user for the name of the project", async () => {
    const { code, error, output } = await testCLI({
      bashCommand: `yarn start --cwd ${cwd}`,
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
    expect(output).toBeCalledWith(
      expect.stringMatching(/Your project is named "my-new-project"/)
    );
  });

  it("should create a local directory with that name", async () => {
    const { code, error, output } = await testCLI({
      bashCommand: `yarn start --cwd ${cwd}`,
      inputs: [
        // Answers "Name of the project"
        "my-new-project",
        // Continue
        ENTER
      ]
    });

    expect(error.mock.calls.length).toBe(0);
    expect(code).toBe(0);

    expect(existsSync(`${cwd}/my-new-project`)).toBe(true);
  });

  // it("should run `git init`");

  // // @todo figure this out laters
  // // it('should create a remote Github project with that name');
  // it(
  //   "should ask the user to create a remote Github project with that name and pass the url for the origin"
  // );

  // it("should link the origin of the local directory to the Github project");

  // it("should add a README.md file");
});
