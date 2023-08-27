import type { BranchReport, RepositoryReport, RepositoryTasks } from '../shared/repositoryRunner';
import { branchRunner } from './branch.runner';
import execa from 'execa';
import { existsSync, lstatSync } from 'fs';
import type { ListrTask } from 'listr2';
import { resolve } from 'path';

interface RepositoryRunnerArguments {
    pushRepositoryReport: (repositoryReport: RepositoryReport) => void;
    repositoriesDirectory: string;
    repositoryTasks: RepositoryTasks;
}
export const repositoryRunner = async ({
    pushRepositoryReport,
    repositoriesDirectory,
    repositoryTasks,
}: RepositoryRunnerArguments): Promise<ListrTask[]> => {
    // Define some scoped variables to be used
    const branchReports: BranchReport[] = [];
    let previousBranch: string;
    const { tasks, repository, branchRegex, prepareTasks, cleanupTasks } = repositoryTasks;

    const repositoryDirectory = resolve(repositoriesDirectory, repository);
    const execaWithCwd = async (command: string, arguments_?: string[]) =>
        await execa(command, arguments_, {
            cwd: repositoryDirectory,
        });

    const pushBranchReport = (branchReport: BranchReport) => {
        branchReports.push(branchReport);
    };

    const throwAndReport = (baseMessage: string, error?: unknown): never => {
        if (error instanceof Error) {
            pushRepositoryReport({
                repository,
                error: `${baseMessage} with: ${error.message}`,
            });
            throw new Error(`${baseMessage} with: ${error.message}`);
        }

        pushRepositoryReport({
            repository,
            error: baseMessage,
        });
        throw new Error(baseMessage);
    };

    const branchListrTasks: ListrTask[] = [];

    if (!existsSync(repositoryDirectory)) {
        throwAndReport(`Path ${repositoryDirectory} does not exist`);
    }

    if (!lstatSync(repositoryDirectory).isDirectory()) {
        throwAndReport(`Path ${repositoryDirectory} is not a directory`);
    }

    try {
        // This will give us the current checked out branch
        const { stdout } = await execaWithCwd('git', ['rev-parse', '--abbrev-ref', 'HEAD']);

        previousBranch = stdout;
    } catch (error) {
        throwAndReport('Getting current branch failed', error);
    }

    let matchedRemoteBranches: string[] = [];
    try {
        // get list of branches on remote
        const { stdout: allRemoteBranches } = await execaWithCwd('git', ['branch', '-r']);

        matchedRemoteBranches = allRemoteBranches
            .split(/\r?\n/u) // Split by new line
            .filter(
                (branch: string) =>
                    !/^origin\/HEAD.*$/u.test(branch.trim()) && // Trim spaces and remove origin ore HEAD
                    branchRegex?.test(branch.trim().replace(/^origin\//u, '')), // Test if the defined regex is matching
            )
            .map(branch => branch.trim().replace(/^origin\//u, '')); // Trim all the unwanted stuff to end up with just the name
    } catch (error) {
        throwAndReport('Fetching remote branches failed', error);
    }

    if (prepareTasks) {
        for (const prepareTask of prepareTasks) {
            branchListrTasks.push({
                title: prepareTask.title,
                task: async () => {
                    try {
                        await prepareTask.run(repositoryDirectory);
                    } catch (error) {
                        throwAndReport(prepareTask.title, error);
                    }
                },
            });
        }
    }

    for (const branch of matchedRemoteBranches) {
        branchListrTasks.push({
            title: branch,
            task: (_, task) =>
                task.newListr(
                    branchRunner({
                        pushBranchReport,
                        branch,
                        repositoriesDirectory,
                        tasks,
                        repository,
                    }),
                    { rendererOptions: { collapse: false } },
                ),
        });
    }

    if (cleanupTasks) {
        for (const cleanupTask of cleanupTasks) {
            branchListrTasks.push({
                title: cleanupTask.title,
                task: async () => {
                    try {
                        await cleanupTask.run(repositoryDirectory);
                    } catch (error) {
                        throwAndReport(cleanupTask.title, error);
                    }
                },
            });
        }
    }

    return [
        {
            title: 'Check for uncommitted changes',
            task: async () => {
                try {
                    await execaWithCwd('git', ['update-index', '--refresh']);
                } catch {
                    throwAndReport(`${repositoryDirectory} contains uncommitted changes`);
                }
            },
        },
        {
            task: async (_, task) =>
                task.newListr(branchListrTasks, {
                    exitOnError: false,
                    rendererOptions: { collapse: false },
                }),
        },
        {
            task: async () => {
                try {
                    // Ensure we switch back to the previous branch
                    await execaWithCwd('git', ['switch', previousBranch]);
                } catch (error) {
                    throwAndReport('Switching back to previous branch failed', error);
                }
            },
        },
        {
            task: () =>
                pushRepositoryReport({
                    repository,
                    branchReports,
                }),
        },
    ];
};
