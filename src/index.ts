import { repositoryRunner } from './runners/repository.runner';
import type { RepositoryReport, RunnerConfig } from './shared/repositoryRunner';
import type { ListrTask } from 'listr2';
import { Listr } from 'listr2';

export const runner = async (config: RunnerConfig) => {
    const repositoryReports: RepositoryReport[] = [];

    // Define report function for child task
    const pushRepositoryReport = (repositoryReport: RepositoryReport) => {
        repositoryReports.push(repositoryReport);
    };

    const {
        repositories,
        branchRegex,
        repositoriesDirectory,
        reporters,
        concurrent = true,
    } = config;

    const listrTasks: ListrTask[] = [];

    // Build list of repository runner tasks
    for (const repository of repositories) {
        listrTasks.push({
            title: repository.repository,
            task: async (_, task): Promise<Listr> =>
                task.newListr(
                    await repositoryRunner({
                        pushRepositoryReport,
                        repositoriesDirectory,
                        repositoryTasks: {
                            branchRegex,
                            ...repository,
                        },
                    }),
                    {
                        rendererOptions: { collapse: false },
                    },
                ),
        });
    }

    await new Listr([
        {
            task: (_, task) =>
                task.newListr(listrTasks, {
                    exitOnError: false,
                    concurrent,
                    rendererOptions: { collapse: false, showTimer: true },
                }),
        },
        {
            // Task to do the final reporting on everything
            title: 'Report',
            skip: !reporters, // Gets skipped when no reporters are defined
            task: async () => {
                if (reporters) {
                    for (const reporter of reporters) {
                        await reporter.report(repositoryReports);
                    }
                }
            },
        },
    ]).run();
};

export { buildInReporters } from './reporters';
export * from './shared/repositoryRunner';
export { buildInTasks } from './tasks';
