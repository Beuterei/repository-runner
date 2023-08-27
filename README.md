[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<!-- PROJECT HEADER -->
<br />
<p align="center">
  <h3 align="center">repository-runner</h3>

  <p align="center">
    A task runner for repositories
    <br />
    <br />
    ·
    <a href="https://github.com/Beuterei/repository-runner/issues">Report Bug</a>
    ·
    <a href="https://github.com/Beuterei/repository-runner/issues">Request Feature</a>
    ·
  </p>
</p>

<!-- ABOUT THE PROJECT -->

## About The Project

A task runner to run tasks on repositories and matching branches. Reporting the collected results.

It makes sure not to override local changes and goes back to the previous checked out branch.

## Installation

```bash
npm i @beuluis/repository-runner
```

## Usage

1. Create a node project. You can use TypeScript if you wish.

2. Define a main bin

3. Call the [runner helper function](#runner-helper-function) and start configure your setup

4. You can package your project and run it via `npx`or you can just run the bin locally

## Functions

### Runner helper function

Runner helper function accepts [RunnerConfig](#RunnerConfig) as parameter.

Example:

```typescript
#!/usr/bin/node

import { resolve } from 'path';
import { runner, buildInReporters, buildInTasks } from '@beuluis/repository-runner';

void runner({
    reporters: [
        buildInReporters.jsonReporter(resolve(process.cwd(), 'out')),
        buildInReporters.markdownReporter(resolve(process.cwd(), 'out')),
    ],
    repositoriesDirectory: resolve('/Users/HelloWorld/workspaces'),
    branchRegex: /(.*?)/u,
    repositories: [
        {
            repository: 'testRepo1',
            tasks: [buildInTasks.commandTask('echo', ['hello'])],
        },
        {
            repository: 'testRepo2',
            branchRegex: /^feature\/.*/u,
            tasks: [
                buildInTasks.installNodeDependenciesTask(),
                buildInTasks.dryMergeTask('master'),
            ],
        },
        {
            repository: 'testRepo3',
            prepareTasks: [buildInTasks.commandTask('docker-compose', ['up', '--build', '-d'])],
            tasks: [
                buildInTasks.installNodeDependenciesTask('yarn'),
                buildInTasks.commandTask('npm', ['run', 'test:cov']),
                {
                    title: 'Awesome task',
                    run: async (repositoriesDirectory: string) => {
                        console.log(`what ever you want in ${repositoriesDirectory}`);
                    },
                },
            ],
            cleanupTasks: [buildInTasks.commandTask('docker-compose', ['down'])],
        },
    ],
});
```

## Build in tasks

-   `buildInTasks.commandTask(command: string, args?: string[], reportStdout = true)` - Run a command with the current repository as pwd. Optional reports stdout back in the [task report](#TaskReport).

-   `buildInTasks.dryMergeTask(targetBranch = 'main')` - Tries a dry run merge with the configured branch.

-   `buildInTasks.installNodeDependenciesTask(packageManager: 'npm' | 'yarn' = 'npm')` - Installs dependencies with the configured package manager. Uses `npm ci` or `yarn install --frozen-lockfile` under the hood.

## Build in reporters

-   `buildInReporters.markdownReporter(outputDirectory: string, filename = 'report')` - Writes report markdown files to the configured output directory.

-   `buildInReporters.jsonReporter(outputDirectory: string, filename = 'report')` - Writes report JSON files to the configured output directory.

## Interfacess

### RunnerConfig

-   `branchRegex` - Regex used to match branches to run tasks.

-   `concurrent` - Run repositories in concurrent mode. If number is passed this number will be used as maximum.

-   `reporters` - Array of objects with the Reporter interface. See [Reporter](#Reporter)

-   `repositories` - Repositories to run. See [RepositoryTasks](#RepositoryTasks).

-   `repositoriesDirectory` - Repositories directory where the repositories are located.

### RepositoryTasks

-   `branchRegex` - Overrides the global regex.

-   `repository` - Repository name to look up in repositoriesDirectory.

-   `tasks` - List of tasks to run on all matches branches. See [Task](#Task).

-   `prepareTasks` - List of tasks to run after all branch tasks. Run once after all branches in repository. See [Task](#Task).

-   `cleanupTasks` - List of tasks to run before all branch tasks. Run once before all branches in repository. See [Task](#Task).

### Task

-   `run` - Function that gets called during runtime.

-   `title` - Tasks title to be used in reports.

### Reporter

-   `report` - Function to be called after the run is done.

### RepositoryReport

-   `repository` - Name of reference repository.

-   `error` - Error string of repository result.

or

-   `repository` - Name of reference repository.

-   `branchReports` - List of branch reports. See [BranchReport](#BranchReport).

### BranchReport

-   `branch` - Name of reference branch.

-   `error` - Error string of branch result.

or

-   `branch` - Name of reference branch.

-   `taskReports` - List of task reports. See [TaskReport](#TaskReport).

### TaskReport

-   `taskTitle` - Title of reference task.

-   `error` - Error string of task result.

or

-   `taskTitle` - Title of reference task.

-   `output` - Output string of task result.

## Write custom tasks

To provide a custom task you can implement a class or object according to the [Task](#Task) and pass it in the `tasks` property of the [RepositoryTasks](#RepositoryTasks) interface.

## Write custom reporter

To provide a custom reporter you can implement a class or object according to the [Reporter](#Reporter) and pass it in the `reporter` property of the [RunnerConfig](#RunnerConfig) interface.

## Principles

### Runners

A runner is responsible to run all defined tasks on the context 'section'.

As example the `repositoryRunner` is run per repository and the `branchRunner` per branch.

An configuration like this:

```text
├── repo1
│   ├── branch 1
│   └── branch 2
└── repo2
    ├── branch 1
    └── branch 2
```

Would result in something like this:

```text
├── repositoryRunner for repo 1
│   ├── branchRunner for branch 1
│   └── branchRunner for branch 2
└── repositoryRunner for repo 2
    ├── branchRunner for branch 1
    └── branchRunner for branch 2
```

### Reporting

All runners care about the reports of there own context 'section' and combine them of the results of the triggered runners. You can say the reports bubble up to the upper layers.

The report order goes as follows:

`taskRunner` -> `branchRunner` -> `repositoryRunner` -> index function

After all reports are collected they get passed to the configured [reporters](#Reporter). These reporters can do whatever they want with the reports. They can write them to files, pass them to an API, or trigger scripts, whatever their heart desires.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/Beuterei/repository-runner.svg?style=flat-square
[contributors-url]: https://github.com/Beuterei/repository-runner/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Beuterei/repository-runner.svg?style=flat-square
[forks-url]: https://github.com/Beuterei/repository-runner/network/members
[stars-shield]: https://img.shields.io/github/stars/Beuterei/repository-runner.svg?style=flat-square
[stars-url]: https://github.com/Beuterei/repository-runner/stargazers
[issues-shield]: https://img.shields.io/github/issues/Beuterei/repository-runner.svg?style=flat-square
[issues-url]: https://github.com/Beuterei/repository-runner/issues
[license-shield]: https://img.shields.io/github/license/Beuterei/repository-runner.svg?style=flat-square
