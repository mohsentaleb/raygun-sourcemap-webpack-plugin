# Contribution Guide

Contributions are welcome and appreciated!

## Setting up your environment

First fork the repo to your own github org, then do the following steps to get started:

```bash
# clone your fork to your local machine
git clone https://github.com/YOUR_USER_OR_ORG/raygun-sourcemap-webpack-plugin.git

# change to local repo directory
cd raygun-sourcemap-webpack-plugin

# install dependencies
npm install
```

### Running Tests

```bash
npm test
```

### Style & Linting

The codebase adheres to the [Airbnb Styleguide](https://github.com/airbnb/javascript)
with some tweaks per our personal preferences and is enforced using [ESLint](http://eslint.org/).

```bash
npm run lint
```

### Building the plugin

Source code for the plugin is written with [ES6](https://github.com/lukehoban/es6features#readme)
syntax and transpiled using [babel](http://babeljs.io/). The build is output to `./dist`.

```bash
npm run build
```

## Test coverage

We use the excellent module, [nyc](https://www.npmjs.com/package/nyc), for coverage and strive for 100%.
The coverage report will be displayed in the terminal after tests run.

## Pull Request Guidelines

Before you submit a pull request from your forked repo, check that it meets these guidelines:

1. If the pull request fixes a bug, it should include tests that fail without the changes, and pass with them.
1. Please update README.md accordingly, if relevant, as part of the same PR.
1. Please rebase and resolve all conflicts before submitting.
