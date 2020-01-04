# Building create-github-project

Now that we have our boilerplate for testing and compiling, we can actually start writing some code. All we have to do is take a look at our tasks and tackle them one at a time

## Sidetrack: Testing Utilities

Sometimes you start writing code and realize...there's not a simple way to test it.

We know we will have a CLI which would run inquirer, but upon extensive searching I couldn't find a utility that sufficiently tests sending inputs and checking that the outputs are correct.

I decided to invest the time in writing a robust CLI tester, since everything we are going to be creating from this point forward will need a CLI.

I already wrote one before, in my first attempt at InfraGen, so I decided to branch off and fully test it.

There's actually a lot more to it than I initially thought. Luckily you don't have to worry about it, you can just install my finished utilities.

```bash
yarn add --dev @infragen/util-test-cli
yarn add --dev @infragen/util-send-inputs-to-cli
```

If you're interested in how it works, check out [this PR](https://github.com/hoverinc/infragen/pull/7) for all the source code, docs, etc

## it("should ask the user for the name of the project");

### Writing our expects

So using our new CLI tester, let's write our first test:

`infragen/generators/create-github-project/__test__/index.ts`

```typescript
import testCLI from "@infragen/util-test-cli";
import { ENTER } from "@infragen/util-send-inputs-to-cli";

describe("@infragen/generator-create-github-project", () => {
  // ...

  it("should ask the user for the name of the project", async () => {
    const { code, error, output } = await testCLI({
      bashCommand: `ts-node ../`,
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
      expect.stringMatching(/Your project is named "my-new-project"\?/)
    );
  });

  // ...
});
```

### Adding Utils to Run Tests (Adding Dev Packages in Lerna)

We also have to add the utils in lerna

```bash
lerna add --dev --scope=@infragen/generator-create-github-project @infragen/util-test-cli
lerna add --dev --scope=@infragen/generator-create-github-project @infragen/util-send-inputs-to-cli
```

### Adding Boilerplate for Actual Package

Now we finally can write some code to make that test pass.

We start by creating an index.ts in `create-github-project`.

```
infragen
 ├─> generators
 |   |─> create-github-project
 |   |   |─> index.ts
 |   |   |─> __tests__
 |   |   |   |─> index.ts
```

`infragen/generators/create-github-project/index.ts`

```typescript
export default () => {
  // ask the user for the name of the project
};
```

And now we fill in the details until the test passes.

### Running Our Test (Fixing Lerna Internal Linking for typescript/ts-node)

We run the command `yarn test:watch` which will rerun the tests every time we make a change.

Note that we got an error:

`infragen/generators/create-github-project yarn test:watch`

```
TypeError: Unable to require `.d.ts` file.
    This is usually the result of a faulty configuration or import. Make sure there is a `.js`, `.json` or another executable extension available alongside `index.ts`.
```

This is something related to how Lerna links internal packages. We need add this to the `tsconfig.json` to properly link packages in jest.

We should also add that to our default ts config. We can just note it in the tests for `add-ts` generator

`infragen/generators/create-github-project/tsconfig.json`

```
{
  "compilerOptions": {
    "preserveSymlinks": true
  }
}
```

`infragen/generators/add-ts/__tests__/index.ts`

```typescript
it("should create a basic tsconfig.json file", () => {
  // {
  //   "compilerOptions": {
  //     "preserveSymlinks": true
  //   }
  // }
});
```

### Adding Lerna Packages (Fixing Async Function requires Promise Error)

Then we get another error:

`infragen/generators/create-github-project yarn test:watch`

```
__tests__/index.ts:5:57 - error TS2705: An async function or method in ES5/ES3 requires the 'Promise' constructor.  Make sure you have a declaration for the 'Promise' constructor or include 'ES2015' in your `--lib` option.
```

We need to install some packages.

We need `@types/jest` and `@types/node` for proper TS compilation (these are just `dev` dependencies.

`infragen/`

```bash
lerna add --dev --scope=@infragen/generator-create-github-project @types/jest
lerna add --dev --scope=@infragen/generator-create-github-project @types/node
lerna add --scope=@infragen/generator-create-github-project inquirer
```

Note that you can only add one package at a time

We also need to make sure that everything in our package.json is properly installed.

We can't run `yarn` in a `lerna` project because it will mess stuff up. But we can run the equivalent:

`infragen/`

```bash
lerna bootstrap
```

### Getting Basic Boilerplate Passing (Cannot Write to Stream/Script Doesn't Exit Error)

We get another error:

`infragen/generators/create-github-project yarn test:watch`

```
    Cannot call write after a stream was destroyedError [ERR_STREAM_DESTROYED]: Cannot call write after a stream was destroyed

      47 |
      48 |         setTimeout(() => {
    > 49 |           stdin.write(inputString);
         |                 ^
      50 |           resolve();
      51 |         }, timeoutBetweenInputs);
      52 |       }),

      at Timeout._onTimeout (../../utils/send-inputs-to-cli/index.ts:49:17)
```

This means that the script exists before accepting any input. So we need to comment out the inputs firing in our test because we want to first just see our setup running.

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
it("should ask the user for the name of the project", async () => {
  const { code, error, output } = await testCLI({
    bashCommand: `ts-node ../`
    // inputs: [
    //   // Answers "Name of the project"
    //   "my-new-project",

    //   // Continue
    //   ENTER
    // ]
  });

  expect(error.mock.calls.length).toBe(0);

  expect(code).toBe(0);

  expect(output).toBeCalledWith(
    expect.stringMatching(/What is the name of your project\?/)
  );

  expect(output).toBeCalledWith(
    expect.stringMatching(/Your project is named "my-new-project"\?/)
  );
});
```

### Debugging CLI Errors (Error Mock Calls is not 0), Using Test CLI Debug Param

We still get an error

`infragen/generators/create-github-project yarn test:watch`

```

    Expected: 0
    Received: 1

      15 |     });
      16 |
    > 17 |     expect(error.mock.calls.length).toBe(0);
         |                                     ^
      18 |
      19 |     expect(code).toBe(0);
      20 |

      at __tests__/index.ts:17:37
      at step (__tests__/index.ts:33:23)
      at Object.next (__tests__/index.ts:14:53)
      at fulfilled (__tests__/index.ts:5:58)
```

Meaning there was an error. We can't see the error because debugging is turned off. We can change that by flipping the `debug` switch in our `testCLI` command:

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
const { code, error, output } = await testCLI({
  bashCommand: `ts-node ../`,
  debug: true
  // inputs: [
  //   // Answers "Name of the project"
  //   "my-new-project",

  //   // Continue
  //   ENTER
  // ]
});
```

### Cannot find module error (Running ts-node in jest tests is in root of project)

We still get another error saying that `generators` cannot be included.

`infragen/generators/create-github-project yarn test:watch`

```
console.error ../../utils/test-cli/index.ts:115
    Error: Cannot find module '/Users/toli/ToliCodes Dropbox/Anatoliy Zaslavskiy/Sites/infragen/generators/i
ndex.ts'
        at Function.Module._resolveFilename (internal/modules/cjs/loader.js:797:15)
        at Function.Module._load (internal/modules/cjs/loader.js:690:27)
        at Function.Module.runMain (internal/modules/cjs/loader.js:1047:10)
        at main (/Users/toli/ToliCodes Dropbox/Anatoliy Zaslavskiy/Sites/infragen/generators/create-github-p
roject/node_modules/ts-node/src/bin.ts:212:14)
        at Object.<anonymous> (/Users/toli/ToliCodes Dropbox/Anatoliy Zaslavskiy/Sites/infragen/generators/create-github-project/node_modules/ts-node/src/bin.ts:470:3)
        at Module._compile (internal/modules/cjs/loader.js:959:30)
        at Object.Module._extensions..js (internal/modules/cjs/loader.js:995:10)
        at Module.load (internal/modules/cjs/loader.js:815:32)
        at Function.Module._load (internal/modules/cjs/loader.js:727:14)
        at Function.Module.runMain (internal/modules/cjs/loader.js:1047:10)

```

This means that `ts-node` cannot find the file we are trying to run. Turns out that `ts-node` will run in the root of the app NOT the root of the tests. When we switch to `.` the error goes away

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
const { code, error, output } = await testCLI({
  bashCommand: `ts-node .`,
  debug: true
  // inputs: [
  //   // Answers "Name of the project"
  //   "my-new-project",
  //   // Continue
  //   ENTER
  // ]
});
```

### Getting Tests Passing Continued (Minimizing expects until it passes)

We finally get an expected error:

`infragen/generators/create-github-project yarn test:watch`

```
 Expected: StringMatching /What is the name of your project\?/

    Number of calls: 0

      16 |     expect(error.mock.calls.length).toBe(0);
      17 |     expect(code).toBe(0);
    > 18 |     expect(output).toBeCalledWith(
         |                    ^
      19 |       expect.stringMatching(/What is the name of your project\?/)
      20 |     );
      21 |     expect(output).toBeCalledWith(

      at __tests__/index.ts:18:20
      at step (__tests__/index.ts:33:23)
      at Object.next (__tests__/index.ts:14:53)
      at fulfilled (__tests__/index.ts:5:58)
```

This is expected because we aren't actually `console.log`-ing anything. So let's comment out those lines for now:

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
it("should ask the user for the name of the project", async () => {
  const { code, error, output } = await testCLI({
    bashCommand: `ts-node .`,
    debug: true
    // inputs: [
    //   // Answers "Name of the project"
    //   "my-new-project",
    //   // Continue
    //   ENTER
    // ]
  });
  expect(error.mock.calls.length).toBe(0);
  expect(code).toBe(0);
  // expect(output).toBeCalledWith(
  //   expect.stringMatching(/What is the name of your project\?/)
  // );
  // expect(output).toBeCalledWith(
  //   expect.stringMatching(/Your project is named "my-new-project"\?/)
  // );
});
```

Finally our test passes! Now we can start filling in code!

### Filling in the Code so that it Passes the Tests

So now let's get the stuff we commented out to pass:

Let's uncomment:

v

```typescript
expect(output).toBeCalledWith(
  expect.stringMatching(/What is the name of your project\?/)
);
```

Now we need to add stuff to our actual file to generate that question. So to our `index.ts` we add:

`infragen/generators/create-github-project/index.ts`

```typescript
import { prompt } from "inquirer";

export default async () => {
  const { projectName } = await prompt([
    {
      message: "What is the name of your project?",
      name: "projectName",
      type: "input"
    }
  ]);
};
```

### Adding a dev package to a lerna package (`lerna add`)

We need to install `inquirer` as a dependency. We can't use `yarn add` because we are in a lerna context. But we can do their version

`infragen/`

```bash
lerna add --dev --scope=@infragen/generator-create-github-project inquirer
```

And now, our test should pass.

### Re-enabling Inputs (Fix Tests timing out)

Now let's fix the second test, which checks if we got the input correctly. So comment in

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
expect(output).toBeCalledWith(
  expect.stringMatching(/Your project is named "my-new-project"\?/)
);
```

Our test fails again. We get a new error:

`infragen/generators/create-github-project yarn test:watch`

```
 ● @infragen/generator-create-github-project › should ask the user for the name of the project

    : Timeout - Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout.Timeout - Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout.Error:

      3 |
      4 | describe("@infragen/generator-create-github-project", () => {
    > 5 |   it("should ask the user for the name of the project", async () => {
        |   ^
      6 |     const { code, error, output } = await testCLI({
      7 |       bashCommand: `ts-node .`,
      8 |       debug: true

      at new Spec (node_modules/jest-jasmine2/build/jasmine/Spec.js:116:22)
      at Suite.<anonymous> (__tests__/index.ts:5:3)
```

This happens because the input was never entered and the script just hangs. So let's re-enable our inputs:

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
const { code, error, output } = await testCLI({
  bashCommand: `ts-node .`,
  debug: true,
  inputs: [
    // Answers "Name of the project"
    "my-new-project",
    // Continue
    ENTER
  ]
});
```

### Debugging Manually (Running script directly without tests)

We get another error, saying that we still don't see the question "What is the name of your project?". We think everything should be working, but it also doesn't output anything to the screen despite `debug` being on.

`infragen/generators/create-github-project yarn test:watch`

```
● @infragen/generator-create-github-project › should ask the user for the name of the project

    expect(jest.fn()).toBeCalledWith(...expected)

    Expected: StringMatching /What is the name of your project\?/

    Number of calls: 0

      17 |     expect(error.mock.calls.length).toBe(0);
      18 |     expect(code).toBe(0);
    > 19 |     expect(output).toBeCalledWith(
         |                    ^
      20 |       expect.stringMatching(/What is the name of your project\?/)
      21 |     );
      22 |     // expect(output).toBeCalledWith(

      at __tests__/index.ts:19:20
      at step (__tests__/index.ts:33:23)
      at Object.next (__tests__/index.ts:14:53)
      at fulfilled (__tests__/index.ts:5:58)
```

So let's run this script directly. First we add a `start` command in `package.json`

`infragen/generators/create-github-project/package.json`

```json
  "scripts": {
    "start": "ts-node .",
  },
```

#### Creating CLI for exported function

When see that indeed it outputs nothing. Turns out it's because our `index.ts` file is just outputting a function, not running it. So perhaps we have a script to trigger that export. Remember, this generator might be called from another file, so want the default option (importing the root package) to still export a function that we can call at the time we need it.

We can add a separate file (`cli.ts`) which triggers that function manually

`infragen/generators/create-github-project/cli.ts`

```typescript
import generator from ".";

generator();
```

And boom it runs!

So let's charge the `start` command in the `package.json`

`infragen/generators/create-github-project/package.json`

```json
"scripts": {
  "start": "ts-node cli.ts",
}
```

We also need to update our test. Let's just have it run `yarn start` to keep it as close to production as possible

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
const { code, error, output } = await testCLI({
  bashCommand: `yarn start`,
  ...
```

And now our tests pass, and they output what they're supposed to.

### Checking Inquirer Input

Now we can complete that test, by un-commenting our last expect, and filling in a command in our package that would pass it.

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
expect(output).toBeCalledWith(
  expect.stringMatching(/Your project is named "my-new-project"/)
);
```

`infragen/generators/create-github-project/index.ts`

```typescript
console.log(`Your project is named "${projectName}"`);
```

Yay! Our FIRST WORKING TEST!

### Clean up (Disable Debug Flag after everything passes)

We still have all the output from the script outputting to the console when the test passes. This is great for debugging but will make it hard to read when we have a lot more tests.

So, after you're done debugging, let's turn that flag off.

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
const { code, error, output } = await testCLI({
  bashCommand: `yarn start`,
  inputs: [
    // Answers "Name of the project"
    "my-new-project",
    // Continue
    ENTER
  ]
});
```

Now we have a clean passing test. Now is a good time to do a commit.

## it("should create a local directory with that name");

### Filling in Expects

Basically this command will create a directory in whatever CWD we pass it. So we want to specify a fake CWD for the test. `/tmp/` is fine. And then we want to check if a folder that we specified in the previous step actually gets created.

Note that we always want to keep the following in each test, so that we ensure it passes without errors.

Note that we are also using the `debug` flag from the start to help with debugging.

```typescript
expect(error.mock.calls.length).toBe(0);
expect(code).toBe(0);
```

`infragen/generators/create-github-project/__tests__/index.ts`

```typescript
import { existsSync } from "fs";

it("should create a local directory with that name", async () => {
  const { code, error, output } = await testCLI({
    bashCommand: `yarn start`,
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

  const fakeProjectCwd = "/tmp/";

  expect(existsSync(`${fakeProjectCwd}/my-new-project`)).toBe(true);
});
```

As expected, our test stats that `/tmp/my-new-project` does not exist.

`infragen/generators/create-github-project yarn test:watch`

```

● @infragen/generator-create-github-project › should create a local d
irectory with that name

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      43 |     const fakeProjectCwd = "/tmp/";
      44 |
    > 45 |     expect(existsSync(`${fakeProjectCwd}/my-new-project`)).toBe(true);
         |                                                            ^
      46 |   });
      47 |
      48 |   // it("should run `git init`");

      at __tests__/index.ts:45:60
      at step (__tests__/index.ts:33:23)
      at Object.next (__tests__/index.ts:14:53)
      at fulfilled (__tests__/index.ts:5:58)

```
