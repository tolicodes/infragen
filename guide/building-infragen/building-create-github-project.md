# Building create-github-project

Now that we have our boilerplate for testing and compiling, we can actually start writing some code. All we have to do is take a look at our tasks and tackle them one at a time.

There's actually quite a lot of work we have to do before we start writing tests.

I wrote out a bunch of these things in [Writing Tests - Common Errors](./writing-tests-common-errors.md)

## @infragen/generator-create-github-project - should throw an error if `cwd` is not passed

### Throwing Errors and Catching then Using CLI Tester

Of course that also fails with a few more errors, complaining about:

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
expect(error.mock.calls.length).toBe(1);
expect(code).toBe(1);
```

We didn't add any `throw`s so the exit code is `1`. And for some reason we are getting 2 error logs.

So let's put it the code we expect.

`infragen/generators/create-github-project/index.ts`

```typescript
export default async ({ cwd }: IGeneratorCreateGithubProject) => {
  if (!cwd) {
    throw new Error("`cwd` is required. Pass it using the --cwd flag");
  }
```

But the test still fails. The error happens inside the executed script and outputs to `error` with an exit code.

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
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
      expect.stringContaining("`cwd` is required. Pass it using the --cwd flag")
    );

    expect(e.code).toEqual(1);
    expect(e.message).toEqual(
      'Failed executing "yarn start" with exit code: 1'
    );
  }
});
```

### Get node to output exit code 1

We still get an error

`infragen/generators/create-github-project yarn test:watch`

```
 ● @infragen/generator-create-github-project › should throw an error if `cwd` is not passed

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      33 |     // @todo look into this
      34 |     expect(error.mock.calls.length).toBe(3);
    > 35 |     expect(code).toBe(1);
         |                  ^
      36 |
      37 |     expect(error).toBeCalledWith(
      38 |       expect.stringMatching(/`cwd` is required. Pass it using the --cwd flag/)

      at __tests__/index.ts:35:18
      at step (__tests__/index.ts:33:23)
      at Object.next (__tests__/index.ts:14:53)
      at fulfilled (__tests__/index.ts:5:58)
```

We also need to update or `cli.ts` to catch error codes. What we are doing here is running the script as usual (in an IIFE so that we can use `await`. We are catching the error thrown in our script, and then `console.error`ing it, while exiting with the correct code.

This way other files can include our `index.ts` without the whole app crashing, but we can still use exit codes when running in `bash`.

`infragen/generators/create-github-project/cli.ts`

```typescript
import generator from ".";
import * as commander from "commander";

commander.option("-c, --cwd <cwd>", "current working directory");

commander.parse(process.argv);

(async () => {
  try {
    await generator({
      cwd: commander.cwd
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
```

Now our test passes. Let's uncomment the `only` and move on.

### Passing `cwd` option to our existing tests

It's good practice to create a completely new folder when doing file manipulations, and then destroy it after the test is done.

So let's add a `beforeEach` and `afterEach` block that creates a new `cwd` and destroys it after the test. We are going to use `uuid` package to create a random directory, and `ensureDir` to create that directory (it recursively creates any directory we pass in case for some reason there is no `/tmp` dir). And finally we will use `unlinkSync` from `fs` to destroy that dir.

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
import { existsSync , unlinkSync} from "fs";
import { ensureDir } from "fs-extra";
import { v4 as uuidv4 } from "uuid";

const TMP_DIR = '/tmp/';

describe("@infragen/generator-create-github-project", () => {
  let cwd;
  beforeEach(async () => {
    cwd = `${TMP_DIR}${uuidv4()}`;
    await ensureDir(cwd);
  });

  afterEach(() => {
    unlinkSync(cwd);
  });
```

And now we have to add the `uuid` and `fs-extra` packages as dev deps

```bash
lerna add --dev --scope=@infragen/generator-create-github-project uuid
lerna add --dev --scope=@infragen/generator-create-github-project fs-extra
```

And now we pass that `cwd` as a parameter to our first non-error-throwing test

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
it.only("should ask the user for the name of the project", async () => {
  const { code, error, output } = await testCLI({
    bashCommand: `yarn start --cwd ${cwd}`,
    debug: true,
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
```

### Proper Commander Usage (Error: Says true as part of the cwd)

We get another error:

`infragen/generators/create-github-project yarn test:watch`

```
 console.error ../../utils/test-cli/index.ts:115
    (node:40089) UnhandledPromiseRejectionWarning: Error: ENOENT: no such file or directory, mkdir 'true/my-new-project'
        at Object.mkdirSync (fs.js:823:3)
        at /Users/toli/ToliCodes Dropbox/Anatoliy Zaslavskiy/Sites/infragen/generators/create-github-project/index.ts:24:3
        at step (/Users/toli/ToliCodes Dropbox/Anatoliy Zaslavskiy/Sites/infragen/generators/create-github-project/index.ts:33:23)
        at Object.next (/Users/toli/ToliCodes Dropbox/Anatoliy Zaslavskiy/Sites/infragen/generators/create-github-project/index.ts:14:53)
        at fulfilled (/Users/toli/ToliCodes Dropbox/Anatoliy Zaslavskiy/Sites/infragen/generators/create-github-project/index.ts:5:58)
        at processTicksAndRejections (internal/process/task_queues.js:93:5)
```

So somehow our `cwd` was read as `true`. It turns out we are using `commander` incorrectly. Specifying and option without additional parameters makes it treat the option as a boolean.

We can fix this by adding `<cwd>` to the option

`infragen/generators/create-github-project/cli.ts`

```typescript
commander.option("-c, --cwd <cwd>", "current working directory");
```

### Unlinking/Removing non Empty Dirs using fs-extra remove

Now we get an error saying:

`infragen/generators/create-github-project yarn test:watch`

```
● @infragen/generator-create-github-project › should ask the user for
 the name of the project

    EPERM: operation not permitted, unlink '/tmp/3dab5c0d-8ab8-43b0-be0
4-45905563dd64'

      17 |
      18 |   afterEach(() => {
    > 19 |     unlinkSync(cwd);
         |     ^
      20 |   });
      21 |
      22 |   it("should throw an error if `cwd` is not passed", async () => {

      at Object.<anonymous> (__tests__/index.ts:19:5)
```

We actually are using the wrong command to remove the directory, because it's not empty. If we use `fs-extra`'s `remove` it will work.

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
import { ensureDir, remove } from "fs-extra";

afterEach(async () => {
  await remove(cwd);
});
```

And it passes again.

If we comment in our "should create a local directory with that name" test with the cwd passed in the CLI it should work.

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
it.only("should create a local directory with that name", async () => {
  const { code, error, output } = await testCLI({
    bashCommand: `yarn start --cwd ${cwd}`,
    debug: true,
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
```

And it does.

So let's clean up (remove `only` and `debug`) and commit our tests and move on!

## @infragen/generator-create-github-project - should run `git init`

### Writing the test

Now we need to be able to run a `git init` in the folder we just created.

When we run git init, a `.git` directory appears. We can check for that.

So we make a new test:

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
it("should run `git init`", async () => {
  const { code, error } = await testCLI({
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
    expect.stringMatching(/Initialized empty Git repository in/)
  );

  expect(existsSync(`${cwd}/my-new-project/.git`)).toBe(true);
});
```

Which of course fails. Let's write the code to fix it.

### Execute bash commands asynchronously and log results

We need do a little bit of refactoring.

- Save the name of the `projectDir` (`cwd` + `projectName`) into a variable, so that we can reuse it throughout as the new `cwd` where all commands are executed
- Create bash execution code (`child_process.exec`) with ways to handle `stdout` and `stderr` output (`console.log` and `console.error` for now).
- a way to handle proper exiting of the bash command. We will wrap it all in a `Promise` that will listen to `proc.on("exit")` and either reject (throwing an error automatically) or continue forward when the command completes.

`infragen/generators/create-github-project/index.ts`

```typescript
import { mkdirSync } from "fs";
import * as child_process from "child_process";

import { prompt } from "inquirer";
interface IGeneratorCreateGithubProject {
  // The current working directory where the generator runs
  cwd: string;
}

export default async ({ cwd }: IGeneratorCreateGithubProject) => {
  if (!cwd) {
    throw new Error("`cwd` is required. Pass it using the --cwd flag");
  }

  // Asking for name of project

  const { projectName } = await prompt([
    {
      message: "What is the name of your project?",
      name: "projectName",
      type: "input"
    }
  ]);

  console.log(`Your project is named "${projectName}"`);

  const projectDir = `${cwd}/${projectName}`;

  // Creating Directory with project name
  mkdirSync(projectDir);

  await new Promise((resolve, reject) => {
    // Executing "git init"
    const bashCommand = "git init";

    const proc = child_process.exec(bashCommand, {
      cwd: projectDir
    });

    proc.stdout.on("data", data => {
      console.log(data);
    });

    proc.stderr.on("data", data => {
      console.error(data);
    });

    proc.on("exit", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(`Failed executing ${bashCommand} with exit code: ${code}`);
      }
    });
  });
};
```

And it passes! That was easy.

## @infragen/generator-create-github-project - should ask the user to create a remote Github project with that name and pass the url for the origin

We originally wanted to create code that will create the Github project for you (`it('should create a remote Github project with that name');`) but that's not an MVP requirement.

Instead we will just ask the user for the origin and link it.

### Writing the Test

For this step we are just doing another input, and we expect to capture that input. We can copy the test code from `should ask the user for the name of the project`

So we should have this test code:

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
it("should ask the user to create a remote Github project with that name and pass the url for the origin", async () => {
  const { code, error, output } = await testCLI({
    bashCommand: `yarn start --cwd ${cwd}`,
    inputs: [
      // Answers "Name of the project"
      "my-new-project",
      // Continue
      ENTER,
      // Answers "What is your git origin (from github)?"
      "git@github.com:tolicodes/test.git",
      // Continue
      ENTER
    ]
  });

  expect(error.mock.calls.length).toBe(0);
  expect(code).toBe(0);
  expect(output).toBeCalledWith(
    expect.stringMatching(/What is your git origin \(from github\)\?/)
  );
  expect(output).toBeCalledWith(
    expect.stringMatching(
      /Linking to git origin "git@github.com:tolicodes\/test\.git"/
    )
  );
});
```

### Asking for git origin

We can copy the code for this from our "Ask for project name" step.

`infragen/generators/create-github-project/index.ts`

```typescript
// Ask user for origin
const { gitOrigin } = await prompt([
  {
    message: "What is your git origin (from github)?",
    name: "gitOrigin",
    type: "input"
  }
]);

console.log(`Linking to git origin "${gitOrigin}"`);
```

### Tests timing out (adjusting test-cli defaultTimeBetweenInputs)

When we run it, the test times out.

`infragen/generators/create-github-project yarn test:watch`

```
: Timeout - Async callback was not invoked within the 30000ms timeo
ut specified by jest.setTimeout.Timeout - Async callback was not invoke
d within the 30000ms timeout specified by jest.setTimeout.Error:

      114 |   // // it('should create a remote Github project with that name');
      115 |
    > 116 |   it.only("should ask the user to create a remote Github project with that name and pass the url for the origin", async () => {
          |      ^
      117 |     const { code, error, output } = await testCLI({
      118 |       bashCommand: `yarn start --cwd ${cwd}`,
      119 |       inputs: [

      at new Spec (node_modules/jest-jasmine2/build/jasmine/Spec.js:116:22)
      at Suite.<anonymous> (__tests__/index.ts:116:6)
```

This is because the default timeout between inputs is too low.

We can fix this by adding a `timeoutBetweenInputs` param to our `testCLI` command with a `1000` ms delay

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
const { code, error, output } = await testCLI({
  bashCommand: `yarn start --cwd ${cwd}`,
  inputs: [
    // Answers "Name of the project"
    "my-new-project",
    // Continue
    ENTER,
    // Answers "What is your git origin (from github)?"
    "git@github.com:tolicodes/test.git",
    // Continue
    ENTER
  ],
  // timeoutBetweenInputs: 1000,
  debug: true
});
```

It passes!

### Fixing old tests (refactor)

But when we uncomment `only` our old tests fail. This is because we didn't add our `timeoutBetweenInputs` to the old commands, and we didn't add the new `input`s. So let's just take that whole `testCLI` execution and put it init a variable which we can overwrite if needed.

First we need to slightly edit our `beforeEach`. The params for `testCLI` require for there to be a `cwd` so we can only define it in a `beforeEach`.

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
let cwd;
let TEST_CLI_PARAMS;
beforeEach(async () => {
  cwd = `${TMP_DIR}${uuidv4()}`;
  await ensureDir(cwd);

  TEST_CLI_PARAMS = {
    bashCommand: `yarn start --cwd ${cwd}`,
    inputs: [
      // Answers "Name of the project"
      "my-new-project",
      // Continue
      ENTER,
      // Answers "What is your git origin (from github)?"
      "git@github.com:tolicodes/test.git",
      // Continue
      ENTER
    ],
    timeoutBetweenInputs: 2000
  };
});
```

Then in our `` should throw an error if `cwd` is not passed `` command we can pass those params, while overwriting the `bashCommand` with no `cwd`

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
  it("should throw an error if `cwd` is not passed", async () => {
    const { code, error } = await testCLI({
      ...TEST_CLI_PARAMS,
      bashCommand: `yarn start`,
    });
```

And everywhere else we just pass the params.

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
const { code, error, output } = await testCLI(TEST_CLI_PARAMS);
```

### Exiting `send-inputs-to-cli` if our script fails

We get another error our first test

`infragen/generators/create-github-project yarn test:watch`

```
● @infragen/generator-create-github-project › should throw an error i
f `cwd` is not passed

    Cannot call write after a stream was destroyedError [ERR_STREAM_DES
TROYED]: Cannot call write after a stream was destroyed

      47 |
      48 |         setTimeout(() => {
    > 49 |           stdin.write(inputString);
         |                 ^
      50 |           resolve();
      51 |         }, timeoutBetweenInputs);
      52 |       }),

      at Timeout._onTimeout (../../utils/send-inputs-to-cli/index.ts:49:17)
```

This is caused by the app crashing, and then `send-inputs-to-cli` continuing to fire events at the write stream.

So let's write a test for `send-inputs-to-cli` for that situation:

`infragen/utils/send-inputs-to-cli/__tests__/index.ts`

```typescript
it("should stop sending input if the write stream is closed", async () => {
  let error;
  let output;
  try {
    ({ error, output } = await testSendInputToCLI({
      bashCommand: `ts-node ./mockCLIs/errorEarly.ts`,
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

        // Type answer to "What's your name" (script error beforehand)
        "Anatoliy Zaslavskiy",

        // Submit answer to question
        ENTER
      ],
      debug: true
    }));
  } catch (e) {
    expect(output).toBeCalledWith(
      expect.stringMatching(/Which option do you want to choose\?/)
    );

    expect(output).toBeCalledWith(expect.stringMatching(/◯ Option 1/));

    expect(output).toBeCalledWith(expect.stringMatching(/◯ Option 3/));

    expect(output).toBeCalledWith(expect.stringMatching(/Option 1 Chosen/));

    expect(output).not.toBeCalledWith(expect.stringMatching(/Option 2 Chosen/));

    expect(output).toBeCalledWith(expect.stringMatching(/Option 3 Chosen/));

    expect(error).toEqual(expect.stringContaining("Erroring now"));

    expect(e).not.toBeCalledWith(
      expect.stringContaining(
        "Cannot call write after a stream was destroyedError"
      )
    );
  }
});
```

Not that a few things are happening here:

- We are making sure that what happened before the error (choosing Option 1 and Option 3, and outputting the result) still works
- The error thrown inside the script fires (it's saved to the `error` mock)
- We are expecting an external error (outside the `errorEarly.ts` script) to fire, for that we need to wrap the execution in a `try/catch`. We are making sure that it is NOT firing the error we get now `Cannot call write after a stream was destroyedError`.

For some reason I couldn't figure this out after an hour. So I posted a question to [Stack Overflow](https://stackoverflow.com/questions/59606113/try-catch-not-catching-with-async-function-using-await) and for now we are just going to deal with this error and fix it's causes.

So for now we just don't send inputs to that stream:

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
 it.only("should throw an error if `cwd` is not passed", async () => {
    const { code, error } = await testCLI({
      // it will yell at us for stream being closed early
      // @todo update this when we have proper handling for stream being closes early
      inputs: [],
      bashCommand: `yarn start`
    });
```

## @infragen/generator-create-github-project - should link the origin of the local directory to the Github project

### Writing Test

First we want to write the test to make sure that we get the git origin we passed.

For that we can use the same code we used in `create-github-project` index to execute a command that gets us the git origin.

Note that we have already used this same code 8 times. So perhaps it's time to make a util? But for now let's get the test passing.

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
it.only("should link the origin of the local directory to the Github project", async () => {
  const { code, error, output } = await testCLI(TEST_CLI_PARAMS);
  expect(error.mock.calls.length).toBe(0);
  expect(code).toBe(0);

  await new Promise((resolve, reject) => {
    const bashCommand = `git config --get remote.origin.url`;

    const proc = child_process.exec(bashCommand, {
      cwd: projectDirectory
    });

    proc.stdout.on("data", data => {
      expect(data).toEqual(
        expect.stringContaining("git@github.com:tolicodes/test.git")
      );
    });

    proc.stderr.on("data", data => {
      console.error(data);
    });

    proc.on("exit", code => {
      console.log("exit");
      if (code === 0) {
        resolve();
      } else {
        reject(`Failed executing ${bashCommand} with exit code: ${code}`);
      }
    });
  });
});
```

### Linking git origin

So for this we just execute the `git remote add origin` command with the user input. We need to use our exec code again

`infragen/generators/create-github-project/index.ts`

```typescript
// link git origin to the user input
console.log(`Linking to git origin "${gitOrigin}"`);

return new Promise((resolve, reject) => {
  const bashCommand = `git remote add origin ${gitOrigin}`;

  const proc = child_process.exec(bashCommand, {
    cwd: projectDir
  });

  proc.stdout.on("data", data => {
    console.log(data);
  });

  proc.stderr.on("data", data => {
    console.error(data);
  });

  proc.on("exit", code => {
    if (code === 0) {
      resolve();
    } else {
      reject(`Failed executing ${bashCommand} with exit code: ${code}`);
    }
  });
});
```

## Refactor - Create Exec Bash Command Util

We keep using this snippet of code everywhere. It's time to make a utility!

```typescript
await new Promise((resolve, reject) => {
  const bashCommand = `git config --get remote.origin.url`;

  const proc = child_process.exec(bashCommand, {
    cwd: projectDirectory
  });

  proc.stdout.on("data", data => {
    expect(data).toEqual(
      expect.stringContaining("git@github.com:tolicodes/test.git")
    );
  });

  proc.stderr.on("data", data => {
    console.error(data);
  });

  proc.on("exit", code => {
    console.log("exit");
    if (code === 0) {
      resolve();
    } else {
      reject(`Failed executing ${bashCommand} with exit code: ${code}`);
    }
  });
});
```

### Boilerplate - Create Infragen Package

We can copy the boilerplate from our `test-cli` utility. This is also a good chance to take notes for our `create-infragen-package` generator (a generator that will be used to create new infragen packages).

So first we can clone our `add-jest` generator (which has no setup).

We just edit the `package.json`:

`infragen/generators/create-infragen-package/package.json`

```json
{
  "name": "@infragen/generator-create-infragen-package"
}
```

And then we take notes in `infragen/generators/create-infragen-package/__tests__/index.ts`

### Boilerplate - Exec Bash Command Util

Let's see that we need from the `test-cli` copy and take notes in `@infragen/generator-create-infragen-package` as we figure it out.

It turns out we need just about everything except for the node stuff. We just rename the `testCLI` command to `execBashCommand` and switch the typings.

`infragen/generators/create-infragen-package/__tests__/index.ts`

```typescript
import { ensureDir } from "fs-extra";
import { v4 as uuidv4 } from "uuid";

import execBashCommand, { IExecBashCommandReturn } from "../";
import { SPACE, DOWN, ENTER } from "@infragen/util-send-inputs-to-cli";

const CLI_TIMEOUT = 180000;
const DEFAULT_TIMEOUT = 5000;
const TMP_DIR = "/tmp/";

const STD_CLI_INPUTS = [
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
];

let DEFAULT_EXEC_BASH_COMMAND_OPTS;
let error;
let output;

describe("@infragen/util-exec-bash-command", () => {
  beforeAll(() => {
    jest.setTimeout(CLI_TIMEOUT);
  });

  afterAll(() => {
    jest.setTimeout(DEFAULT_TIMEOUT);
  });

  beforeEach(() => {
    error = jest.fn();
    output = jest.fn();

    DEFAULT_EXEC_BASH_COMMAND_OPTS = {
      errorCB: error,
      outputCB: output
    };
  });

  it("runs a bash command", async () => {
    const { code }: IExecBashCommandReturn = await execBashCommand({
      ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
      bashCommand: `echo "hello"`
    });
    expect(error.mock.calls.length).toBe(0);
    expect(code).toBe(0);
    expect(output).toBeCalledWith(expect.stringContaining("hello"));
  });

  it("runs a bash command with inputs", async () => {
    const { code }: IExecBashCommandReturn = await execBashCommand({
      ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
      bashCommand: `ts-node ./mockCLIs/standard.ts`,
      inputs: STD_CLI_INPUTS
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

  it("runs a bash command with different exit code", async () => {
    try {
      await execBashCommand({
        ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
        bashCommand: `echo "hello" && >&2 echo "Something bad happened 1" && exit 1`
      });
    } catch (e) {
      expect(output).toBeCalledWith(expect.stringContaining("hello"));

      expect(error).toBeCalledWith(
        expect.stringContaining("Something bad happened")
      );

      expect(e.code).toBe(1);
    }
  });

  it("runs a bash command that outputs to stderr", async () => {
    const { code }: IExecBashCommandReturn = await execBashCommand({
      ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
      bashCommand: `echo "hello" && >&2 echo "Something bad happened 2"`
    });

    expect(output).toBeCalledWith(expect.stringContaining("hello"));

    expect(error).toBeCalledWith(
      expect.stringContaining("Something bad happened")
    );

    expect(code).toBe(0);
  });

  it("runs a bash command with different timeouts for inputs", async () => {
    const { code }: IExecBashCommandReturn = await execBashCommand({
      ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
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

  it("runs a bash command with a different default timeoutBetweenInputs", async () => {
    const { code }: IExecBashCommandReturn = await execBashCommand({
      ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
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
      timeoutBetweenInputs: 3000
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

  it("runs a bash command in a different cwd", async () => {
    const cwd = `${TMP_DIR}${uuidv4()}`;
    await ensureDir(cwd);

    const { code }: IExecBashCommandReturn = await execBashCommand({
      ...DEFAULT_EXEC_BASH_COMMAND_OPTS,
      bashCommand: `pwd`,
      cwd
    });

    expect(code).toEqual(0);

    expect(output).toBeCalledWith(expect.stringContaining(cwd));
  });
});
```

We also create boilerplate `index.ts`

`infragen/generators/create-infragen-package/index.ts`

```typescript
it("creates a boilerplate index.ts", () => {
  // export interface IUtilReturn {
  //   returnVal1: string;
  // }
  // export interface IUtilOpts {
  //   param1: string;
  // }
  // export default async (
  //   { param1 }: IUtilOpts = {
  //     param1: "defaultVal"
  //   }
  // ): Promise<IUtilReturn> => new Promise(async (resolve, reject) => {});
});
```

### Making Tests Pass

Now we can start copying the relevant code from `test-cli` to make everything pass. We basically copy everything except for the node script functionality.

Another key difference is you have to pass in your `output` and `error` callbacks, because this utility will not be exclusively used in a jest context (where `testCLI` just creates mock functions for you). Other than that the code should just work with minor refactors.

`infragen/generators/create-infragen-package/index.ts`

```typescript
import * as child_process from "child_process";

import sendInputs, {
  DEFAULT_TIMEOUT_BETWEEN_INPUTS,
  CLIInputs
} from "@infragen/util-send-inputs-to-cli";

type DataCallback = (string) => void;

export interface IExecBashCommandReturn {
  // Exit code of the process
  code: number;
}

export interface IExecBashCommandOpts {
  outputCB?: DataCallback;
  errorCB?: DataCallback;

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
          message: `Failed executing ${bashCommand} with exit code: ${code}`
        });
      }
    });
  });
```

Now we can commit and refactor everything to use our new utility.

### Refactor to using @infragen/util-exec-bash-command

Now we can just do a file search anywhere we have `child_process.exec`.

We do:

```bash
lerna add --dev --scope=@infragen/generator-create-github-project @infragen/util-exec-bash-command
```

on each project we want to add the exec util to.

Then we import it at the top:

```typescript
import execBashCommand from "@infragen/util-exec-bash-command";
```

We convert the tests to look something like this:

```typescript
it.only("should link the origin of the local directory to the Github project", async () => {
  const { code, error } = await testCLI(TEST_CLI_PARAMS);
  expect(error.mock.calls.length).toBe(0);
  expect(code).toBe(0);

  const outputCB = jest.fn();
  await execBashCommand({
    bashCommand: "git config --get remote.origin.url",
    cwd: projectDirectory,
    outputCB
  });

  expect(outputCB).toBeCalledWith(
    expect.stringContaining("git@github.com:tolicodes/test.git")
  );
});
```

In the case of actual package code (ex: `create-github-project/index.ts`), we want to pass through a `debug` parameter which will allow us to console.log if needed.

You can look through the [code PR](https://github.com/hoverinc/infragen/pull/8) for the full refactor

### Running All Jest Tests in Lerna

We just refactored a huge chunk of functionality. We can go individually into each package to run `yarn test` but there is a utility to do that for you.

First we have to install on the root level the test watcher and jest

`infragen/`

```bash
lerna add --scope=infragen --dev jest
lerna add --scope=infragen --dev jest-watch-lerna-packages
```

Next we want to create a `jest.config.json` file at the root, referencing that plugin:

`infragen/jest.config.json`

```json
{
  "testEnvironment": "node",
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "watchPlugins": ["jest-watch-lerna-packages"]
}
```

And finally we want to add the `test` commands to the root `package.json`

`infragen/package.json`

```json
  "scripts": {
    "test": "jest --config jest.config.json --runInBand",
    "test:watch": "jest --config jest.config.json --watch --runInBand"
  },
```

Note that we are using `--runInBand` because there are some really weird issues when we run tests in parallel. Will look into this more.

Now we can watch all the tests by running at the root

`infragen/`

```bash
yarn test:watch
```

## @infragen/generator-create-github-project should add a README.md file

### Writing the Test

The test is pretty straightforward:

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
it("should add a README.md file", async () => {
  const { code, error } = await testCLI(TEST_CLI_PARAMS);
  expect(error.mock.calls.length).toBe(0);
  expect(code).toBe(0);

  expect(existsSync(`${projectDirectory}/README.md`)).toBe(true);
});
```

### Implementation

The implementation is simple:

`infragen/generators/create-github-project/index.ts`

```typescript
// Creates readme file
outputCB(`Creating README.md file`);

await execBashCommand({
  bashCommand: `touch README.md`,
  ...execBashCommandOpts
});
```

## @infragen/generator-create-github-project - should push to origin master

### Writing the Test

Here the best way to tell that it's been pushed is to check for a message

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
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
```

We also need to do a little cleanup after our test runs

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
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
```

### Implementation

The implementation is simple.

We want to commit the file we just created and push it to the origin.

`infragen/generators/create-github-project/index.ts`

```typescript
// Pushes it up
outputCB(`Pushing to origin master`);

await execBashCommand({
  // use because git commands output to stderr
  onlyOutputCB: true,
  bashCommand: `git add . && git commit -m "README" && git push -u origin master`,
  ...execBashCommandOpts
});
```
