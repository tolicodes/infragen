import { prompt } from "inquirer";

import execBashCommand from "@infragen/util-exec-bash-command";

interface IGeneratorCreateGithubProject {
  // The current working directory where the generator runs
  cwd: string;

  // Print debug output (passed to `execBashCommand`)
  debug?: boolean;

  outputCB?: any;

  errorCB?: any;
}

export default async ({
  cwd,
  outputCB = console.log,
  errorCB = console.error
}: IGeneratorCreateGithubProject) => {
  if (!cwd) {
    throw new Error("`cwd` is required. Pass it using the --cwd flag");
  }

  const execBashCommandOpts = {
    cwd,
    outputCB,
    errorCB
  };

  // Ask user for origin
  // const { gitOrigin } = await prompt([
  //   {
  //     message: "What is your git origin (from github)?",
  //     name: "gitOrigin",
  //     type: "input"
  //   }
  // ]);

  // await new Promise(resolve => setTimeout(resolve, 3000));

  const gitOrigin = `git@github.com:tolicodes/test.git`;

  // link git origin to the user input
  outputCB(`Cloning "${gitOrigin}"`);

  await execBashCommand({
    bashCommand: `git clone ${gitOrigin}`,
    ...execBashCommandOpts
  });

  const projectDir = gitOrigin.match(/(\w+)\.git/);

  execBashCommandOpts.cwd = `${cwd}/${projectDir[1]}`;

  // Creates README file
  outputCB(`Creating README.md file`);

  await execBashCommand({
    bashCommand: `touch README.md`,
    ...execBashCommandOpts
  });

  // Pushes it up
  outputCB(`Pushing to origin master`);

  await execBashCommand({
    bashCommand: `echo "ToliTest"`,
    ...execBashCommandOpts
  });

  await execBashCommand({
    bashCommand: `git add . && git commit -m "README" && git push -u origin master`,
    ...execBashCommandOpts
  });
};
