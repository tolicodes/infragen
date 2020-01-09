import { existsSync } from "fs";
import { ensureDir, remove } from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import execBashCommand from "@infragen/util-exec-bash-command";

import testCLI from "@infragen/util-test-cli";
import { ENTER } from "@infragen/util-send-inputs-to-cli";

const TMP_DIR = "/tmp/";

const CLI_TIMEOUT = 180000;
const DEFAULT_TIMEOUT = 5000;
const PROJECT_ROOT = `${__dirname}/..`;

describe("@infragen/generator-create-github-project", () => {
  beforeAll(() => {
    jest.setTimeout(CLI_TIMEOUT);
  });

  afterAll(() => {
    jest.setTimeout(DEFAULT_TIMEOUT);
  });

  let cwd;
  let projectDirectory;

  let TEST_CLI_PARAMS;
  beforeEach(async () => {
    cwd = `${TMP_DIR}${uuidv4()}`;
    projectDirectory = `${cwd}/test`;
    await ensureDir(cwd);

    TEST_CLI_PARAMS = {
      bashCommand: `yarn start --cwd ${cwd}`,
      inputs: [
        // Answers "What is your git origin (from github)?"
        "git@github.com:tolicodes/test.git",
        // Continue
        ENTER
      ],
      timeoutBetweenInputs: 2000,
      cwd: PROJECT_ROOT
    };
  });

  afterEach(async () => {
    // get rid of readme
    await execBashCommand({
      bashCommand: `rm README.md && git add . && git commit 'remove README' && git push`,
      cwd: projectDirectory
    });

    await remove(cwd);
  });

  it("should throw an error if `cwd` is not passed", async () => {
    try {
      await testCLI({
        // it will yell at us for stream being closed early
        // @todo update this when we have proper handling for stream being closes early
        inputs: [],
        bashCommand: `yarn start`,
        // this is the cwd of the command `yarn start` NOT the internal execution env of the script `yarn start` calls
        cwd: PROJECT_ROOT
      });
    } catch (e) {
      // errors listed below and for some reason a blank error occasionally
      expect(e.error.mock.calls.length).toBeGreaterThan(1);

      expect(e.error).toBeCalledWith(
        expect.stringContaining(
          "`cwd` is required. Pass it using the --cwd flag"
        )
      );

      expect(e.code).toEqual(1);
      expect(e.message).toEqual(
        'Failed executing "yarn start" with exit code: 1'
      );
    }
  });

  // // @todo figure this out later
  // // it('should create a remote Github project with that name');

  it("should ask the user to create a remote Github project with that name and pass the url for the origin", async () => {
    const { code, error, output } = await testCLI(TEST_CLI_PARAMS);

    // For some reason `git clone` writes to stderr
    // https://stackoverflow.com/questions/34820975/git-clone-redirect-stderr-to-stdout-but-keep-errors-being-written-to-stderr/34841363
    // @todo look into this
    expect(error.mock.calls.length).toBe(1);
    expect(code).toBe(0);
    expect(output).toBeCalledWith(
      expect.stringContaining("What is your git origin (from github)?")
    );
  });

  it("should clone the Github project", async () => {
    const { code, error, output } = await testCLI(TEST_CLI_PARAMS);
    // For some reason `git clone` writes to stderr
    // https://stackoverflow.com/questions/34820975/git-clone-redirect-stderr-to-stdout-but-keep-errors-being-written-to-stderr/34841363
    // @todo look into this
    expect(error.mock.calls.length).toBe(1);
    expect(code).toBe(0);

    expect(output).toBeCalledWith(
      expect.stringContaining('Cloning "git@github.com:tolicodes/test.git"')
    );

    expect(existsSync(`${projectDirectory}/.git`)).toBe(true);
  });

  it("should add a README.md file", async () => {
    const { code, error } = await testCLI({
      ...TEST_CLI_PARAMS
    });

    // For some reason `git clone` writes to stderr
    // https://stackoverflow.com/questions/34820975/git-clone-redirect-stderr-to-stdout-but-keep-errors-being-written-to-stderr/34841363
    // @todo look into this
    expect(error.mock.calls.length).toBe(1);
    expect(code).toBe(0);

    expect(existsSync(`${projectDirectory}/README.md`)).toBe(true);
  });

  it.only("should push to origin master", async () => {
    const { code, error, output } = await testCLI({
      ...TEST_CLI_PARAMS,
      debug: true
    });
    // For some reason `git clone` writes to stderr
    // https://stackoverflow.com/questions/34820975/git-clone-redirect-stderr-to-stdout-but-keep-errors-being-written-to-stderr/34841363
    // @todo look into this
    expect(error.mock.calls.length).toBe(1);
    expect(code).toBe(0);

    expect(output).toBeCalledWith(
      expect.stringContaining(
        "Branch 'master' set up to track remote branch 'master' from 'origin'"
      )
    );
  });
});
