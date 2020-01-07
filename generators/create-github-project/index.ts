import { mkdirSync } from "fs";

import { prompt } from "inquirer";

import execBashCommand, {
  OnDataCallback
} from "@infragen/util-exec-bash-command";

interface IGeneratorCreateGithubProject {
  // The current working directory where the generator runs
  cwd: string;

  // Print debug output (passed to `execBashCommand`)
  debug?: boolean;

  outputCB?: OnDataCallback;

  errorCB?: OnDataCallback;
}

export default async ({
  cwd,
  debug,
  outputCB = console.log,
  errorCB = console.error
}: IGeneratorCreateGithubProject) => {
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

  outputCB(`Your project is named "${projectName}"`);

  const projectDir = `${cwd}/${projectName}`;

  const execBashCommandOpts = {
    cwd: projectDir,
    debug,
    outputCB,
    errorCB
  };

  // Creating Directory with project name
  mkdirSync(projectDir);

  // Executing "git init"
  await execBashCommand({
    bashCommand: "git init",
    ...execBashCommandOpts
  });

  // Ask user for origin
  const { gitOrigin } = await prompt([
    {
      message: "What is your git origin (from github)?",
      name: "gitOrigin",
      type: "input"
    }
  ]);

  // link git origin to the user input
  outputCB(`Linking to git origin "${gitOrigin}"`);

  await execBashCommand({
    bashCommand: `git remote add origin ${gitOrigin}`,
    ...execBashCommandOpts
  });

  // Creates readme file
  outputCB(`Creating README.md file`);

  await execBashCommand({
    bashCommand: `touch README.md`,
    ...execBashCommandOpts
  });
};
