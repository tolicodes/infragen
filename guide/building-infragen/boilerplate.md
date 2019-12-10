# Setting Up Tools and Boilerplate

Before we start coding we actually have to set up some minimal tools and boilerplate for our actual project. If only there was a tool that 😉

Our `create-github-project` generator is going to be a Node app. Luckily, it needs a lot of the same tools as our `create-react-app` generator. (Babel, TS, and Jest). So we could preemptively make that part modular.

## MonoRepo with Lerna

We also want to make InfraGen a monorepo. One of the core principles is modularity. We want to separate every utility, generator, etc into it's own standalone module that could be run and tested individual from the entire app. [Lerna](https://github.com/lerna/lerna) is a tool which will make our life easy in terms of managing all of our packages.

Perhaps someday we will make a Node Monorepo generator? Even though that's far in the future we can make a directory and take notes as we do our setup.

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
 |   |─> create-node-monorepo
 |   |   |─> __tests__
 |   |   |   |─> index.ts
```

`infragen/generators/create-node-monorepo/__tests__/index.ts`

```js
describe("@infragen/generator-create-node-monorepo", () => {
  it("should run the create-github-project generator");

  it(
    "setup package.json for the base project with the name provided in the create-github-project generator"
  );

  it("should install lerna globally `npm i -g lerna`");

  it("should run `lerna init`");

  it("should set the npmClient to yarn in lerna.json", () => {
    // {
    //   npmClient: "yarn"
    // };
  });

  // note that this next test is intentionally vague for now since it's going to take some thinking
  it(
    "should ask for the names of our packages and how we want to organize our packages and writes it to lerna.json"
  );
});
```

That’s as detailed as we should get. Remember, all of this is just notes for later. We don’t have to write any of this now, so we don’t have to dive into details. But copy and paste notes and commands as you’re setting it up anyways for later.

## Setup Basic Structure for create-react-app generator

Now we want to setup our first package `create-react-app`. Again we can detail all the steps in a tests file and categorize parts that should be modularized.

We know that it will be a Node module so:

`infragen/generators/create-node-module/__tests__/index.ts`

```js
describe("@infragen/generator-create-node-module", () => {
  it("should ask for the name of the package");

  it("should create a directory with that name");

  it("should create a package.json with that name");

  it("should install and configure TS");

  it("should install and configure Babel");

  it("should install and configure Jest");
});
```

And now let's break down the TS, Babel, and Jest installation steps into modules:

`infragen/generators/add-babel/__tests__/index.ts`

```js
describe("@infragen/generator-add-babel", () => {
  it("should run `yarn add --dev @babel/core @babel/cli @babel/preset-env`");

  // note we opt for a json file since writing to a JSON file programmatically will be simpler than the default .js file
  it("if we are in a Node app, we should setup preset-env targeting the current Node version in the babel.config.json file", () => {
    // {
    //   presets: [
    //     [
    //       "@babel/preset-env",
    //       {
    //         targets: {
    //           node: "current"
    //         }
    //       }
    //     ]
    //   ]
    // };
  });
});
```

`infragen/generators/add-ts/__tests__/index.ts`

```js
describe("@infragen/generator-add-ts", () => {
  it("should run `yarn add --dev typescript ts-loader source-map-loader`");

  it(
    "should run `yarn add --dev ts-node @types/node` if it's in the context of a Node App"
  );

  it("should add start script to the package.json file", () => {
    // {
    //   scripts: {
    //     start: "yarn ts-node ."
    //   }
    // };
  });

  it("should add the babel loader if we are using Babel", () => {
    // {
    //   scripts: {
    //     presets: ["@babel/preset-typescript"];
    //   }
    // }
  });
});
```

`infragen/generators/add-jest/__tests__/index.ts`

```js
describe("@infragen/generator-add-jest", () => {
  it("should run `yarn add --dev jest`");

  it("should add scripts to watch and start tests in package.json", () => {
    // {
    //   scripts: {
    //     test: "jest --config jest.config.json",
    //     "test:watch": "jest --config jest.config.json --watch"
    //   }
    // };
  });

  // note we opt for a json file since writing to a JSON file programatically will be simpler than the default .js file
  it("should create a jest.config.json file", () => {
    // {
    //   clearMocks: true,
    //   coverageDirectory: "coverage",
    //   testEnvironment: "node",
    // };
  });

  it(
    "should run `yarn add --dev babel-jest @babel/preset-env` if we are using Babel"
  );

  it("should add transform to the jest.config.json file if we are using Babel", () => {
    // {
    //   transform: {
    //     "^.+\\.jsx?$": "babel-jest",
    //   }
    // };
  });

  it("should run `yarn add --dev @types/jest ts-jest` if we are using TS");

  it("should add transform to the jest.config.json file if we are using TS", () => {
    // {
    //   transform: {
    //     "^.+\\.tsx?$": "ts-jest"
    //   }
    // };
  });

  // we will configure this a little better later, but for now we will just
  // have a few strict rules that work with prettier
  it("should have a tslint.yml with strict rules", () => {
    // extends:
    //   - tslint:latest
    //   - tslint-config-prettier
    // rules:
    //   typedef:
    //     - true
    //     - call-signature
    //     - parameter
    //     - arrow-call-signature
    //     - property-declaration
    //     - variable-declaration
    //     - member-variable-declaration
    //     - object-destructuring
    //     - array-destructuring
  });
});
```

Note that this whole time we are just taking notes on what future generators we will build, while only actually configuring the module we are working on (`create-github-project`).

So our `create-github-project` should look something like this now:

```
 ├─> generators
 │   ├─> create-github-project
 │   │   ├─> __tests__
 │   │   │   └── index.ts
 │   │   ├── babel.config.json
 │   │   ├── jest.config.json
 │   │   ├── package.json
 │   │   └── yarn.lock
```

`infragen/generators/create-github-project/babel.config.json`

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "current"
        }
      }
    ]
  ]
}
```

`infragen/generators/create-github-project/jest.config.json`

```json
{
  "clearMocks": true,
  "coverageDirectory": "coverage",
  "testEnvironment": "node",
  "transform": {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest"
  }
}
```

`infragen/generators/create-github-project/tslint.yml`

```yml
extends:
  - tslint:latest
  - tslint-config-prettier
rules:
  typedef:
    - true
    - call-signature
    - parameter
    - arrow-call-signature
    - property-declaration
    - variable-declaration
    - member-variable-declaration
    - object-destructuring
    - array-destructuring
```

`infragen/generators/create-github-project/package.json`

```json
{
  "name": "@infragen/generator-create-github-project",
  "version": "1.0.0",
  "description": "",
  "main": "jest.config.js",
  "scripts": {
    "test": "jest --config jest.config.json",
    "test:watch": "jest --config jest.config.json --watch"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@babel/preset-env": "^7.7.4",
    "@types/jest": "^24.0.23",
    "babel-jest": "^24.9.0",
    "jest": "^24.9.0",
    "ts-jest": "^24.2.0",
    "typescript": "^3.7.2"
  },
  "dependencies": {
    "ts-node": "^8.5.4"
  }
}
```

And our `lerna.json` file should look like this

`infragen/lerna.json`

```
{
  "packages": [".", "generators/*"],
  "version": "0.0.0",
  "npmClient": "yarn"
}
```

## Ensuring Boilerplate Works

Now let's ensure that our setup works! We can test whether our installation of Babel, TS, and Jest worked in one go.

Add the following to the top of

`infragen/generator/create-github-project/__tests__/index.ts`

```typescript
describe("@infragen/generator-create-github-project", () => {
  it("should run a test", () => {
    expect(true).toBe(true);
  });
});
```

Next run `yarn test` inside of `infragen/generator/create-github-project/` and you should get your first passing test!

Now we are ready to do some actual coding. We have our work cut out for us. It's all written as tests in `infragen/generator/create-github-project/__tests__/index.ts`

Your code should look something like [this] at the end of this section.
