import { mkdirSync } from "fs";

import { prompt } from "inquirer";
interface IGeneratorCreateGithubProject {
  // The current working directory where the generator runs
  cwd: string;
}

export default async ({ cwd }: IGeneratorCreateGithubProject) => {
  if (!cwd) {
    throw new Error("`cwd` is required. Pass it using the --cwd flag");
  }

  const { projectName } = await prompt([
    {
      message: "What is the name of your project?",
      name: "projectName",
      type: "input"
    }
  ]);

  console.log(`Your project is named "${projectName}"`);

  mkdirSync(`${cwd}/${projectName}`);
};
