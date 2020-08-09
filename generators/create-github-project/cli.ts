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
