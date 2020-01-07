import * as child_process from "child_process";

import sendInputs, {
  DEFAULT_TIMEOUT_BETWEEN_INPUTS,
  CLIInputs
} from "@infragen/util-send-inputs-to-cli";

export type OnDataCallback = (string) => void;

export interface IExecBashCommandReturn {
  // Exit code of the process
  code: number;
}

export interface IExecBashCommandOpts {
  outputCB?: OnDataCallback;
  errorCB?: OnDataCallback;

  // a standard bash command
  // ex: `echo "hi"`
  bashCommand: string;

  // this is a list of inputs that need to be sent to cli
  // if a string is passed then it will use the default
  // timeoutBetweenInputs
  // if an object is passed, you can specify the time to
  // wait before the input
  // ex:
  // [
  //   'hello',
  //   '\x20',
  //   {
  //     input: 'test'
  //     timeoutBeforeInput: 1000
  //   }
  // ]
  //
  inputs?: CLIInputs;

  // time to wait in between sending inputs
  // if one of your commands takes longer than the default
  // 100 ms increase this parameter
  timeoutBetweenInputs?: number;

  // Which directory should the CLI execute in
  cwd?: string;

  // Should we print out all the calls to the output and error mocks
  // otherwise use
  debug?: boolean;
}

export default async ({
  outputCB,
  errorCB,
  bashCommand,
  inputs,
  timeoutBetweenInputs = DEFAULT_TIMEOUT_BETWEEN_INPUTS,
  cwd,
  debug = false
}: IExecBashCommandOpts): Promise<IExecBashCommandReturn> =>
  new Promise(async (resolve, reject) => {
    const proc = child_process.exec(bashCommand, {
      cwd
    });

    proc.stdout.on("data", data => {
      if (debug) {
        console.log(data);
      }
      outputCB && outputCB(data);
    });

    proc.stderr.on("data", data => {
      if (debug) {
        console.error(data);
      }
      errorCB && errorCB(data);
    });

    if (inputs) {
      await sendInputs({
        inputs,
        stdin: proc.stdin,
        timeoutBetweenInputs
      });
    }

    proc.on("exit", code => {
      if (code === 0) {
        resolve({
          code
        });
      } else {
        reject({
          code,
          message: `Failed executing "${bashCommand}" with exit code: ${code}`
        });
      }
    });
  });
