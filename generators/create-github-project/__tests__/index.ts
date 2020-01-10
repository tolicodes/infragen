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

  let containerDir;
  let projectDir;
  let testCLIParams;

  beforeEach(async () => {
    containerDir = `${TMP_DIR}${uuidv4()}`;
    projectDir = `${containerDir}/test`;
    await ensureDir(containerDir);

    testCLIParams = {
      bashCommand: `yarn start --cwd ${containerDir}`,
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

  // @todo find out why we need to do done instead of regular async/await
  afterEach(async done => {
    // get rid of readme
    // @todo think of better way to do this
    try {
      await execBashCommand({
        bashCommand: `[[ -d ${projectDir} ]] && cd ${projectDir} && rm README.md && git add . && git commit -m 'remove README' && git push`,
        cwd: containerDir
      });
    } catch (e) {
      // ignore because I'm not sure what's going on
    }
    await remove(containerDir);

    done();
  });

  it("should throw an error if `cwd` is not passed", async () => {
    try {
      await testCLI({
        // it will yell at us for stream being closed early
        // @todo update this when we have proper handling for stream being closes early
        // inputs: [],
        bashCommand: `yarn start`,
        // this is the cwd of the command `yarn start` NOT the internal execution env of the script `yarn start` calls
        cwd: PROJECT_ROOT
      });
    } catch (e) {
      // errors listed below and for some reason a blank error occasionally
      expect(e.error.mock.calls.length).toBeGreaterThan(0);

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

  // @todo figure this out later
  it.todo("should create a remote Github project with that name");

  it("should ask the user to create a remote Github project with that name and pass the url for the origin", async () => {
    const { code, error, output } = await testCLI({
      ...testCLIParams,
      bashCommand: `yarn start --cwd ${containerDir}`
    });

    expect(error.mock.calls.length).toBe(0);
    expect(code).toBe(0);
    expect(output).toBeCalledWith(
      expect.stringContaining("What is your git origin (from github)?")
    );
  });

  it("should clone the Github project", async () => {
    const { code, error, output } = await testCLI({
      ...testCLIParams
    });
    expect(error.mock.calls.length).toBe(0);
    expect(code).toBe(0);

    expect(output).toBeCalledWith(
      expect.stringContaining('Cloning "git@github.com:tolicodes/test.git"')
    );

    expect(existsSync(`${projectDir}/.git`)).toBe(true);
  });

  it("should add a README.md file", async () => {
    const { code, error } = await testCLI({
      ...testCLIParams
    });

    expect(error.mock.calls.length).toBe(0);
    expect(code).toBe(0);

    expect(existsSync(`${projectDir}/README.md`)).toBe(true);
  });

  it("should push to origin master", async () => {
    const { code, error, output } = await testCLI({
      ...testCLIParams
    });

    expect(error.mock.calls.length).toBe(0);
    expect(code).toBe(0);

    expect(output).toBeCalledWith(
      expect.stringContaining(
        "Branch 'master' set up to track remote branch 'master' from 'origin'"
      )
    );
  });
});
