export const DEFAULT_TIMEOUT_BETWEEN_INPUTS = 100;

export type CLIInputs = (
  | string
  | {
      input: string;
      timeoutBeforeInput: number;
    }
)[];

export default async ({
  inputs,
  stdin = process.stdin,
  timeoutBetweenInputs = DEFAULT_TIMEOUT_BETWEEN_INPUTS
}: {
  inputs: CLIInputs;
  stdin?: NodeJS.ReadStream;
  timeoutBetweenInputs?: number;
}): Promise<void> => {
  await inputs.reduce(
    (previousPromise, input) =>
      new Promise(async resolve => {
        await previousPromise;

        if (typeof input !== "string") {
          timeoutBetweenInputs = input.timeoutBeforeInput;
          input = input.input;
        }

        setTimeout(() => {
          stdin.write(input);
          resolve();
        }, timeoutBetweenInputs);
      }),
    Promise.resolve()
  );

  stdin.end();
};

// https://www.tldp.org/LDP/abs/html/escapingsection.html
export const DOWN: string = "\x1B\x5B\x42";
export const UP: string = "\x1B\x5B\x41";
export const ENTER: string = "\x0D";
export const SPACE: string = "\x20";
