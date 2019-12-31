// anything less and inquirer doesn't catch it
export const DEFAULT_TIMEOUT_BETWEEN_INPUTS = 400;

// Could be a list of inputs or objects listing the input and timeout
// before the input is fired
//
// ex:
// ["hello", ENTER, "test"]
// [{ input: "hello", timeBeforeInput: 2000 }, ENTER, "test"]
export type CLIInputs = (
  | string
  | {
      input: string;
      timeoutBeforeInput: number;
    }
)[];

export type ISendInputsToCli = {
  inputs: CLIInputs;
  // should be from `child_process.exec` stdin stream
  stdin?: NodeJS.WritableStream;

  // default timeout before an input (default 400ms)
  timeoutBetweenInputs?: number;
};

export default async ({
  inputs,
  stdin = process.stdin,
  timeoutBetweenInputs = DEFAULT_TIMEOUT_BETWEEN_INPUTS
}: ISendInputsToCli): Promise<void> => {
  // go through each input, waiting for the last timeout to
  // resolve
  // write the input to stdin
  await inputs.reduce(
    (previousPromise, input) =>
      new Promise(async resolve => {
        await previousPromise;
        let inputString;

        if (typeof input !== "string") {
          timeoutBetweenInputs = input.timeoutBeforeInput;
          inputString = input.input;
        } else {
          inputString = input;
        }

        setTimeout(() => {
          stdin.write(inputString);
          resolve();
        }, timeoutBetweenInputs);
      }),
    Promise.resolve()
  );
};

// https://www.tldp.org/LDP/abs/html/escapingsection.html
export const DOWN: string = "\x1B\x5B\x42";
export const UP: string = "\x1B\x5B\x41";
export const ENTER: string = "\x0D";
export const SPACE: string = "\x20";
