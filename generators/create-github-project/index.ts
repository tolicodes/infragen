import { prompt } from "inquirer";

export default async () => {
  const { projectName } = await prompt([
    {
      message: "What is the name of your project?",
      name: "projectName",
      type: "input"
    }
  ]);

  console.log(`Your project is named "${projectName}"`);
};
