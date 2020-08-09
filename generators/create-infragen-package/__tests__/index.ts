describe("@infragen/generator-create-infragen-package", () => {
  it.todo("asks for type");
  // util
  // generator

  it.todo(
    "cds into infragen folder in `generators/` or `utils/` depending on the type"
  );

  it.todo("runs create-node-module generator");

  it.todo("updates package name in package.json");
  // {
  //   "name": "@infragen/<type>-<name>", // ex: util-util-name or generator-create-something
  // }

  // pretty much all tests use this
  it.todo("adds inquirer");
  // lerna add --dev --scope=@infragen/util-exec-bash-command inquirer

  it.todo("adds @infragen/util-test-cli");
  // lerna add --dev --scope=@infragen/util-exec-bash-command @infragen/util-test-cli

  it.todo("adds @infragen/util-send-inputs-to-cli");
  // lerna add --dev --scope=@infragen/util-exec-bash-command @infragen/util-send-inputs-to-cli

  it.todo("creates a __test__ directory with index.ts");
  // __tests__/index.ts
  // import testCLI, { ITestCLIReturn } from "@infragen/util-test-cli";
  // import { SPACE, DOWN, ENTER } from "@infragen/util-send-inputs-to-cli";

  // const CLI_TIMEOUT = 180000
  // const DEFAULT_TIMEOUT = 5000;

  // const STD_CLI_INPUTS = [
  //   // Check "Option 1"
  //   SPACE,
  //   // Move to "Option 2"
  //   DOWN,
  //   // Move to "Option 3"
  //   DOWN,
  //   // Check "Option 3"
  //   SPACE,
  //   // Next Question
  //   ENTER,
  //   // Type answer to "What's your name"
  //   "Anatoliy Zaslavskiy",
  //   // Submit answer to question
  //   ENTER
  // ];
  // describe("@infragen/<package_name>", () => {
  //   beforeAll(() => {
  //     jest.setTimeout(CLI_TIMEOUT);
  //   });

  //   afterAll(() => {
  //     jest.setTimeout(DEFAULT_TIMEOUT);
  //   });

  //   it("runs the package", async () => {
  //     const { code, error, output }: ITestCLIReturn = await testCLI({
  //       bashCommand: `ts-node ./mockCLIs/standard.ts`,
  //       inputs: STD_CLI_INPUTS
  //     });
  //     expect(error.mock.calls.length).toBe(0);
  //     expect(code).toBe(0);
  //     expect(output).toBeCalledWith(expect.stringContaining(/some output/));
  //   });
  // });

  it.todo("creates a mockCLIs directory with a standard mock cli");
  // mockCLIs/standard.ts
  //   import { prompt } from "inquirer";

  //   const CHOICES = [
  //     {
  //       name: "Option 1",
  //       value: "option1"
  //     },
  //     {
  //       name: "Option 2",
  //       value: "option2"
  //     },
  //     {
  //       name: "Option 3",
  //       value: "option3"
  //     }
  //   ];

  //   (async () => {
  //     const { optionChoice, fullName } = await prompt([
  //       {
  //         message: "Which option do you want to choose?",
  //         name: "optionChoice",
  //         type: "checkbox",
  //         choices: CHOICES
  //       },
  //       {
  //         message: "What's your full name?",
  //         name: "fullName",
  //         type: "input"
  //       }
  //     ]);

  //     optionChoice.forEach(choice => {
  //       const choiceName = CHOICES.find(({ value }) => value === choice).name;
  //       console.log(`${choiceName} Chosen`);
  //     });

  //     console.log(`Your name is "${fullName}"`);
  //   })();

  it.todo("creates a boilerplate index.ts");
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
