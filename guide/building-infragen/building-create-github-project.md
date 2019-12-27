# Building create-github-project

Now that we have our boilerplate for testing and compiling, we can actually start writing some code. All we have to do is take a look at our tasks and tackle them one at a time

## it("should ask the user for the name of the project");

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

### Sidetrack: Testing Utilities

Sometimes you start writing code and realize...there's not a simple way to test it.

We know we will have a CLI which would run inquirer, but upon extensive searching I could find a utility that sufficiently tests navigating the output that navigates it.

I decided to invest the time in writing a robust CLI tester, since everything we are going to be creating from this point forward will need a CLI.

I already wrote one before, in my first attempt at InfraGen, so I decided to branch off and fully test it.

There's actually a lot more to it than I initially thought. Luckily you don't have to worry about it, you can just install my finished utilities.

```bash
yarn add --dev @infragen/util-test-cli
yarn add --dev @infragen/util-send-inputs-to-cli
```

If you're interested in how it works, check out [this PR] for all the source code, docs, etc

### Writing Our Tests

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
  });

  // ...
});
```
