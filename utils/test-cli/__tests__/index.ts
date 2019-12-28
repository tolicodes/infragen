import { ensureDir } from "fs-extra";
import { v4 as uuidv4 } from "uuid";

import testCLI, { ITestCLIReturn } from "../";
import { SPACE, DOWN, ENTER } from "@infragen/util-send-inputs-to-cli";

const TMP_DIR = "/tmp/";

const CLI_TIMEOUT = 20000;
const DEFAULT_TIMEOUT = 5000;

describe("@infragen/util-test-cli", () => {
  beforeAll(() => {
    jest.setTimeout(CLI_TIMEOUT);
  });

  afterAll(() => {
    jest.setTimeout(DEFAULT_TIMEOUT);
  });

  it("tests a CLI run as a bash command", async () => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      bashCommand: `ts-node ./mockCLIs/standard.ts`,
      inputs: [
        // Check "Option 1"
        SPACE,

        // Move to "Option 2"
        DOWN,

        // Move to "Option 3"
        DOWN,

        // Check "Option 3"
        SPACE,

        // Next Question
        ENTER,

        // Type answer to "What's your name"
        "Anatoliy Zaslavskiy",

        // Submit answer to question
        ENTER
      ]
    });

    expect(error.mock.calls.length).toBe(0);

    expect(code).toBe(0);

    expect(output).toBeCalledWith(
      expect.stringMatching(/Which option do you want to choose\?/)
    );

    expect(output).toBeCalledWith(expect.stringMatching(/◯ Option 1/));

    expect(output).toBeCalledWith(expect.stringMatching(/◯ Option 3/));

    expect(output).toBeCalledWith(expect.stringMatching(/Option 1 Chosen/));

    expect(output).not.toBeCalledWith(expect.stringMatching(/Option 2 Chosen/));

    expect(output).toBeCalledWith(expect.stringMatching(/Option 3 Chosen/));

    expect(output).toBeCalledWith(
      expect.stringMatching(/What's your full name\?/)
    );

    expect(output).toBeCalledWith(
      expect.stringMatching(/Your name is "Anatoliy Zaslavskiy"/)
    );
  });

  it("tests a CLI with a different exit code", async () => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      bashCommand: `ts-node ./mockCLIs/differentExitCode.ts`
    });

    expect(output).toBeCalledWith(
      expect.stringMatching(/Something bad is about to happen/)
    );

    expect(error).toBeCalledWith(
      expect.stringMatching(/Something bad happened/)
    );

    expect(code).toBe(1);
  });

  it("tests a CLI that outputs to stderr", async () => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      bashCommand: `ts-node ./mockCLIs/outputsToStdErr.ts`
    });

    expect(output).toBeCalledWith(
      expect.stringMatching(/Something good happened/)
    );

    expect(error).toBeCalledWith(
      expect.stringMatching(/Something bad happened/)
    );

    expect(code).toBe(0);
  });

  it("tests a CLI run as a node script", async () => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      nodeScript: `
          const cli = require('${__dirname}/../mockCLIs/needsToBeTriggeredJS.js');

          cli({ outputThis: "something" });
        `,
      inputs: [
        // Check "Option 1"
        SPACE,

        // Move to "Option 2"
        DOWN,

        // Move to "Option 3"
        DOWN,

        // Check "Option 3"
        SPACE,

        // Next Question
        ENTER,

        // Type answer to "What's your name"
        "Anatoliy Zaslavskiy",

        // Submit answer to question
        ENTER
      ]
    });

    expect(error.mock.calls.length).toBe(0);

    expect(code).toBe(0);

    expect(output).toBeCalledWith(
      expect.stringMatching(/Which option do you want to choose\?/)
    );

    expect(output).toBeCalledWith(expect.stringMatching(/◯ Option 1/));

    expect(output).toBeCalledWith(expect.stringMatching(/◯ Option 3/));

    expect(output).toBeCalledWith(expect.stringMatching(/Option 1 Chosen/));

    expect(output).not.toBeCalledWith(expect.stringMatching(/Option 2 Chosen/));

    expect(output).toBeCalledWith(expect.stringMatching(/Option 3 Chosen/));

    expect(output).toBeCalledWith(
      expect.stringMatching(/What's your full name\?/)
    );

    expect(output).toBeCalledWith(
      expect.stringMatching(/Your name is "Anatoliy Zaslavskiy"/)
    );

    expect(output).toBeCalledWith(
      expect.stringMatching(/Outputting something/)
    );
  });

  it("tests a CLI with different timeouts for inputs", async () => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      bashCommand: `ts-node ./mockCLIs/timeouts.ts`,
      inputs: [
        // Check "Option 1"
        {
          input: SPACE,
          timeoutBeforeInput: 1100
        },

        // Move to "Option 2"
        DOWN,

        // Move to "Option 3"
        DOWN,

        // Check "Option 3"
        SPACE,

        // Next Question
        ENTER,

        // Type answer to "What's your name"
        {
          input: "Anatoliy Zaslavskiy",
          timeoutBeforeInput: 2100
        },

        // Submit answer to question
        ENTER
      ]
    });

    expect(error.mock.calls.length).toBe(0);

    expect(code).toBe(0);

    expect(output).toBeCalledWith(
      expect.stringMatching(/Which option do you want to choose\?/)
    );

    expect(output).toBeCalledWith(expect.stringMatching(/◯ Option 1/));

    expect(output).toBeCalledWith(expect.stringMatching(/◯ Option 3/));

    expect(output).toBeCalledWith(expect.stringMatching(/Option 1 Chosen/));

    expect(output).not.toBeCalledWith(expect.stringMatching(/Option 2 Chosen/));

    expect(output).toBeCalledWith(expect.stringMatching(/Option 3 Chosen/));

    expect(output).toBeCalledWith(
      expect.stringMatching(/What's your full name\?/)
    );

    expect(output).toBeCalledWith(
      expect.stringMatching(/Your name is "Anatoliy Zaslavskiy"/)
    );
  });

  it("tests a CLI run as node script with a different node command", async () => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      nodeScript: `
          import cli from './mockCLIs/needsToBeTriggeredTS.ts';

          cli({ outputThis: 'something' });
        `,
      inputs: [
        // Check "Option 1"
        SPACE,

        // Move to "Option 2"
        DOWN,

        // Move to "Option 3"
        DOWN,

        // Check "Option 3"
        SPACE,

        // Next Question
        ENTER,

        // Type answer to "What's your name"
        "Anatoliy Zaslavskiy",

        // Submit answer to question
        ENTER
      ],
      nodeCommand: "ts-node"
    });

    expect(error.mock.calls.length).toBe(0);

    expect(code).toBe(0);

    expect(output).toBeCalledWith(
      expect.stringMatching(/Which option do you want to choose\?/)
    );

    expect(output).toBeCalledWith(expect.stringMatching(/◯ Option 1/));

    expect(output).toBeCalledWith(expect.stringMatching(/◯ Option 3/));

    expect(output).toBeCalledWith(expect.stringMatching(/Option 1 Chosen/));

    expect(output).not.toBeCalledWith(expect.stringMatching(/Option 2 Chosen/));

    expect(output).toBeCalledWith(expect.stringMatching(/Option 3 Chosen/));

    expect(output).toBeCalledWith(
      expect.stringMatching(/What's your full name\?/)
    );

    expect(output).toBeCalledWith(
      expect.stringMatching(/Your name is "Anatoliy Zaslavskiy"/)
    );

    expect(output).toBeCalledWith(
      expect.stringMatching(/Outputting something/)
    );
  });

  it("tests a CLI with a different default timeoutBetweenInputs", async () => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      bashCommand: `ts-node ./mockCLIs/timeouts.ts`,
      inputs: [
        // Check "Option 1"
        SPACE,

        // Move to "Option 2"
        DOWN,

        // Move to "Option 3"
        DOWN,

        // Check "Option 3"
        SPACE,

        // Next Question
        ENTER,

        // Type answer to "What's your name"
        "Anatoliy Zaslavskiy",

        // Submit answer to question
        ENTER
      ],
      timeoutBetweenInputs: 2300
    });

    expect(error.mock.calls.length).toBe(0);

    expect(code).toBe(0);

    expect(output).toBeCalledWith(
      expect.stringMatching(/Which option do you want to choose\?/)
    );

    expect(output).toBeCalledWith(expect.stringMatching(/◯ Option 1/));

    expect(output).toBeCalledWith(expect.stringMatching(/◯ Option 3/));

    expect(output).toBeCalledWith(expect.stringMatching(/Option 1 Chosen/));

    expect(output).not.toBeCalledWith(expect.stringMatching(/Option 2 Chosen/));

    expect(output).toBeCalledWith(expect.stringMatching(/Option 3 Chosen/));

    expect(output).toBeCalledWith(
      expect.stringMatching(/What's your full name\?/)
    );

    expect(output).toBeCalledWith(
      expect.stringMatching(/Your name is "Anatoliy Zaslavskiy"/)
    );
  });

  it("tests a CLI run in a different cwd", async () => {
    const cwd = `${TMP_DIR}${uuidv4()}`;
    await ensureDir(cwd);

    const { output }: ITestCLIReturn = await testCLI({
      bashCommand: `ts-node --project "${__dirname}/../tsconfig.json"  "${__dirname}/../mockCLIs/cwdTest.ts"`,
      cwd,
      debug: true
    });

    expect(output).toBeCalledWith(expect.stringMatching(cwd));
  });

  it("outputs debug info when debug flag is passed", async () => {
    const stdOutWriteMock = jest.fn();
    const stdErrWriteMock = jest.fn();

    await testCLI({
      bashCommand: `ts-node ./mockCLIs/cwdTest.ts`
    });

    const stdOutWriteOriginal = process.stdout.write;
    const stdErrWriteOriginal = process.stderr.write;

    process.stdout.write = stdOutWriteMock;
    process.stderr.write = stdErrWriteMock;

    expect(stdOutWriteMock).toBeCalledWith(
      expect.stringMatching(/Something good happened/)
    );

    expect(stdErrWriteMock).toBeCalledWith(
      expect.stringMatching(/Something bad happened/)
    );

    process.stdout.write = stdOutWriteOriginal;
    process.stderr.write = stdErrWriteOriginal;
  });
});
