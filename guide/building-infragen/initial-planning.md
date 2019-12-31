### Initial Planning - Breaking Down Your MVP into stories

[PR for this section](https://github.com/hoverinc/infragen/pull/4/files)

Many people prefer to do their sprint planning in JIRA. I find it cumbersome and unnecessary for small projects with few developers and little non-engineering oversight. For example, for InfraGen, there is no product owner. Or perhaps I am the product owner. And also the sole developer. I just needed to keep myself organized and have a way for other engineers to give me guidance.

Jest tests are the perfect answer for these kinds of projects.

Simply start out with your MVP, make a `__tests__` folder with a index.ts file and keep breaking down that file into folders and subfolders until you get down to tests that could be applied to actual components/functions. Note that you should write 0 code in the process. You’re just planning for now.

Think of your tests as a fractal. They start out with the big picture, but you keep zooming further and further recursively into one SPECIFIC part until you can’t break it down any further (not quite how fractals work, but humor me). And then when you're done, you can zoom out and explore another portion.

In order to start this project, there is very little setup we need to do before writing our tests/stories:

1. Make a git repo locally and on Github and link the origins
2. Branch from our inital `preface` branch (let’s call it `initial-planning`)
3. Make a `__tests__` folder
4. Make a `README` (which we will write in parallel as essentially a more readable copy of your tests
5. Write your stories (tests)

That’s it. It’s tempting to install Jest, Lerna, all the boilerplate. But it’s not necessary...yet.

So for InfraGen that process would like this:

What is my MVP? What feature do I need to have before this product is useful?

```
infragen
 |─> __tests__
 |   |─> index.ts
```

`ingragen/__tests__/index.ts`

```js
describe('infragen', () => {
  it('should generate a basic React app with TypeScript, Babel, Webpack, Jest, React, and a hello world page');
  it('should have a jest and cypress test ensuring that it works as expected');
  it('should build, test, and deploy to our K8S cluster');
);
```

This seemed pretty barebones when I stated but then I realized, "does it REALLY need to build, test and deploy to be immediately useful"? Not really. In fact just doing our first requirement would in itself yield an immediately useful tool. It would create a tool that generates a standardized way to setup the simplest configuration to get started on your React project.

Playing with Babel, TS, Webpack and Jest just to get that working from scratch usually takes me an hour or so. A tool that would save developers an hour of boilerplate coding is immediately useful.

The other stuff (testing, building, deploying) is all very important but we don’t have to worry about it now.

So, with that said let’s comment out the last two goals. They’re nice and safe in your repo for when you’re ready to code them. Let’s break down scaffolding a simple React app.

So we make a folder for our first generator who’s sole purpose it to scaffold a React app

```
infragen
 |─> __tests__
 |   |─> index.ts
 ├─> generators
 |   |─> create-react-app
 |   |   |─> __tests__
 |   |   |   |─> index.ts
```

Inside we break down our tests further. What are the steps needed to create a React app?

`infragen/generators/create-react-app/__tests__/index.ts`

```js
describe("@infragen/generator-create-react-app", () => {
  it("should create a Git repo and link it to Github");
  it("should npm init the repo making a package.json");
  it("should add a README");
  it("should install and configure TS");
  it("should install and configure Babel");
  it("should install and configure Jest");
  it("should install and configure Webpack");
  it("should ensure that TS, Babel, Jest, and Webpack play well together");
});
```

That's better. Much more detailed. But we still have to break it down further. Again, let’s drill down onto the first step. Looks like we are going to have a few sub generators. Let’s create a package for each. Well, just the GIT one for now

```
infragen
 |─> __tests__
 |   |─> index.ts
 ├─> generators
 |   |─> create-react-app
 |   |   |─> __tests__
 |   |   |   |─> index.ts
 |   |─> create-github-project
 |   |   |─> __tests__
 |   |   |   |─> index.ts
```

`infragen/generators/create-github-project/__tests__/index.ts`

```js
describe("@infragen/generator-create-github-project", () => {
  it("should ask the user for the name of the project");
  it("should create a local directory with that name");
  it("should run `git init`");
  it("should create a remote Github project with that name");
  it("should link the origin of the local directory to the Github project");
  it("should add a README.md file");
});
```

Even more concise. For most of these tasks I already know the code I will write with minimal Googling.

- **should ask the user for the name of the project**: use [inquirer](https://github.com/SBoudrias/Inquirer.js/) to prompt the user for the name of the project
- **should create a local directory with that name**: use the answer the user gave in the previous step to create a folder using `` child_process.exec(`mkdir ${projectName}`) ``
- **should run `git init`**: `cd ${projectName} && git init`
- **should create a remote Github project with that name**: this seems more complicated. I’ll have to ask the user for their Github Token, contact an API, deal with permissions. This is a task on it’s own. Very interesting and tempting, but not necessary for the MVP. So let’s comment it out keep it safe and replace it with a manual step where the user just creates it on their own and passes the url for the origin
- **should link the origin of the local directory to the Github project**: will take the origin the user passed and run `git add origin ${origin}`
- **should add a README.md file**: `touch README.md`

So now with our slight modification we have successfully drilled down our tests. We'll comment out the dynamic creation of the Github project for later and replace it with a simpler step

`infragen/generators/create-github-project/__tests__/index.ts`

```js
describe("@infragen/generator-create-github-project", () => {
  it("should ask the user for the name of the project");
  it("should create a local directory with that name");
  it("should run `git init`");
  // it('should create a remote Github project with that name');
  it(
    "should ask the user to create a remote Github project with that name and pass the url for the origin"
  );
  it("should link the origin of the local directory to the Github project");
  it("should add a README.md file");
});
```

We can now make our first PR to show the team our plan and proceed forward. It should look something like [this](https://github.com/hoverinc/infragen/pull/4/files)

**ProTip**: If you're going to be creating frequent PRs, a great tool is [hub](https://hub.github.com/), a CLI for Github. You just run the following and you've got yourself a PR opened in the browser!

```bash
hub pull-request -b <against which branch?> -o -m "Title your PR"
```
