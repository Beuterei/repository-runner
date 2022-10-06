import { resolve } from 'path';
import execa from 'execa';
import type { ListrTask } from 'listr2';
import type { BranchReport, Task, TaskReport } from '../shared/repositoryRunner';
import { taskRunner } from './task.runner';

interface BranchRunnerArguments {
    branch: string;
    pushBranchReport: (branchReport: BranchReport) => void;
    repositoriesDirectory: string;
    repository: string;
    tasks: Task[];
}
export const branchRunner = ({
    branch,
    pushBranchReport,
    repositoriesDirectory,
    repository,
    tasks,
}: BranchRunnerArguments): ListrTask[] => {
    const taskReports: TaskReport[] = [];
    const repositoryDirectory = resolve(repositoriesDirectory, repository);
    const execaWithCwd = async (command: string, arguments_?: string[]) =>
        await execa(command, arguments_, {
            cwd: repositoryDirectory,
        });
    const pushTaskReport = (taskReport: TaskReport) => {
        taskReports.push(taskReport);
    };

    const throwAndReport = (baseMessage: string, error?: unknown): never => {
        if (error instanceof Error) {
            pushBranchReport({
                branch,
                error: `${baseMessage} with: ${error.message}`,
            });
            throw new Error(`${baseMessage} with: ${error.message}`);
        }

        pushBranchReport({
            branch,
            error: baseMessage,
        });
        throw new Error(baseMessage);
    };

    return [
        {
            title: 'Checkout branch',
            task: async () => {
                try {
                    await execaWithCwd('git', ['checkout', branch]);
                } catch (error) {
                    throwAndReport('Checkout failed', error);
                }
            },
        },
        {
            title: 'Pull latest changes',
            task: async () => {
                try {
                    await execaWithCwd('git', ['pull']);
                } catch (error) {
                    throwAndReport('Pull failed', error);
                }
            },
        },
        {
            // double sub tasks to prevent failing of the parent
            task: async (_, task) =>
                task.newListr(
                    [
                        {
                            title: 'Run tasks',
                            task: async () =>
                                task.newListr(
                                    await taskRunner({
                                        pushTaskReport,
                                        repository,
                                        repositoriesDirectory,
                                        tasks,
                                    }),
                                    { rendererOptions: { collapse: false } },
                                ),
                        },
                    ],
                    { exitOnError: false, rendererOptions: { collapse: false } },
                ),
        },
        {
            task: () =>
                pushBranchReport({
                    branch,
                    taskReports,
                }),
        },
    ];
};
