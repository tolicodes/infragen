import * as child_process from "child_process";
import sendInputsToCLI, { CLIInputs, SPACE, DOWN, ENTER } from "../index";

interface ISendInputsToCli {
  inputs: CLIInputs;
  timeoutBetweenInputs?: number;
  bashCommand: string;
}

interface ITestCLIReturn {
  output: jest.Mock;
  error: jest.Mock;
  code: number;
}

// a mini version of the read Test CLI used solely for testing SendInputsToCLI
const testSendInputToCLI = async ({
  inputs,
  timeoutBetweenInputs,
  bashCommand
}: ISendInputsToCli): Promise<ITestCLIReturn> =>
  new Promise(async resolve => {
    const output = jest.fn();
    const error = jest.fn();

    const proc = child_process.exec(bashCommand);

    proc.stdout.on("data", data => {
      console.log(data);
      output(data);
    });

    proc.stderr.on("data", data => {
      console.error(data);
      error(data);
    });

    await sendInputsToCLI({
      inputs,
      stdin: proc.stdin,
      timeoutBetweenInputs
    });

    proc.on("exit", (code, sig) => {
      console.log("CODE", code, sig);
      resolve({
        code,
        output,
        error
      });
    });
  });

describe("@infragen/util-send-inputs-to-cli", () => {
  it("should send input to stdin", async () => {
    const { output, error, code } = await testSendInputToCLI({
      bashCommand: "ts-node ./mockCLIs/standard.ts",
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

  it("tests a CLI with different timeouts for inputs", async () => {
    const { code, error, output } = await testSendInputToCLI({
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

    expect(output).toBeCalledWith(
      expect.stringMatching(/Outputting "something"/)
    );
  });

  it("tests a CLI with a different default timeoutBetweenInputs", async () => {
    const { code, error, output } = await testSendInputToCLI({
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
      timeoutBetweenInputs: 2000
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
      expect.stringMatching(/Outputting "something"/)
    );
  });
});
