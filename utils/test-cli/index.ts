import { writeFileSync, unlinkSync } from "fs";
import * as child_process from "child_process";
import { v4 as uuidv4 } from "uuid";

import sendInputs, {
  DEFAULT_TIMEOUT_BETWEEN_INPUTS,
  CLIInputs
} from "@infragen/util-send-inputs-to-cli";

type Process = child_process.ChildProcess | NodeJS.Process;

// if we don't pass a cwd, we will create the temporary node file in the tmp directory
const TMP_DIR = "/tmp/";

export interface ITestCLIReturn {
  // Jest mock function which will fire every time there is a stdout.on('data')
  output: jest.Mock;

  // Jest mock function which will fire every time there is a stderr.on('data')
  error: jest.Mock;

  // Exit code of the process
  code: number;
}

export interface ITestCLIOpts {
  // used if you need to test a CLI command/npm package
  // ex: `run-my-tool --someoption`
  bashCommand?: string;

  // this is a stringified node script to run as a child process
  // ex:
  // `
  // import myCLI from '../';
  // myCLI(someOpts: true);
  // `
  nodeScript?: string;

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

  // if using nodeScript, this is the command used to run the script
  // by default it's node (will run `node tmpFile.js`)
  // ex: 'tsnode'
  nodeCommand?: string;

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
  bashCommand,
  nodeScript,
  inputs,

  nodeCommand = "node",
  timeoutBetweenInputs = DEFAULT_TIMEOUT_BETWEEN_INPUTS,
  cwd = TMP_DIR,
  debug = false
}: ITestCLIOpts = {}): Promise<ITestCLIReturn> =>
  new Promise(async resolve => {
    const output = jest.fn();
    const error = jest.fn();

    let proc: Process;

    const tmpFile: string = `${TMP_DIR}/${uuidv4()}.js`;

    if (bashCommand) {
      writeFileSync(tmpFile, bashCommand);
      proc = child_process.exec(`${nodeCommand} "${tmpFile}"`, {
        cwd
      });
    } else {
      proc = child_process.exec(bashCommand, {
        cwd
      });
    }

    proc.stdout.on("data", data => {
      output(data);
    });

    proc.stderr.on("data", data => {
      error(data);
    });

    await sendInputs({
      inputs,
      stdin: proc.stdin,
      timeoutBetweenInputs
    });

    proc.on("exit", code => {
      if (nodeScript && !debug) {
        unlinkSync(tmpFile);
      }

      if (debug) {
        console.log(output.mock.calls);
        console.error(error.mock.calls);
      }

      resolve({
        code,
        output,
        error
      });
    });
  });
