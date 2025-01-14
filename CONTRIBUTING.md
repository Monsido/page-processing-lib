# Contributing

## Submitting pull requests

Pull requests must also adhere to the following guidelines:

- Pull requests must be atomic and targeted at a single issue rather than broad scope.
- Pull requests must contain clear testing steps and justification, and all other information required by the pull request template.
- Pull requests must pass automated tests before they will be reviewed. Acquia recommends running the tests locally before submitting.
- Pull requests must meet Drupal coding standards and best practices as defined by the project maintainers.

## Building and testing

No special tools or dependencies are necessary to develop or contrib to Acquia Page Processing Library. Simply clone the Git repo and install yarn dependencies:
```
git clone git@github.com:acquia/page-processing-library.git
cd page-processing-library
yarn install
yarn serve
```

Be sure to validate and test your code locally using the provided yarn test scripts (`yarn test`) before opening a PR.

### Building dist files

1. Install yarn dependencies: `yarn install`
2. Build output files: `yarn build`
3. Now the [index.js](dist/index.js) file is ready to be used in your project.

### Writing tests

New code should be covered at 100% (or as close to it as reasonably possible) by Jest unit tests. It should also minimize the number of escaped mutants (as close to 0% as reasonably possible), which will appear as annotations on your PR after unit tests run.

Every class / command has a corresponding test file. The first test case in each file should be the "default" passing workflow for that command. Additional test cases should cover any possible inputs for that command as well as any possible error cases.

Jest data providers may be used to fuzz input for a test case as long as the output remains the same. However, if the output of a command varies non-trivially based on input, it should probably be broken into different test cases rather than using a data provider.

Test cases are declarative specifications. They should not implement or utilize any logic, especially not as provided by the covered source code itself.


