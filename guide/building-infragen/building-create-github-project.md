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

### Writing Our Tests First

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

We also have to add the utils in lerna

```bash
lerna add --dev --scope=@infragen/generator-create-github-project @infragen/util-test-cli
lerna add --dev --scope=@infragen/generator-create-github-project @infragen/util-send-inputs-to-cli
```

### Writing the Code to Make the Test Pass

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

We run the command `yarn test --watch` which will rerun the tests every time we make a change.

Note that we got an error

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
