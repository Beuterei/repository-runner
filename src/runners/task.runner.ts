import { resolve } from 'path';
import type { ListrTask } from 'listr2';
import type { Task, TaskReport } from '../shared/repositoryRunner';

interface TaskRunnerArguments {
    pushTaskReport: (taskReport: TaskReport) => void;
    repositoriesDirectory: string;
    repository: string;
    tasks: Task[];
}
export const taskRunner = async ({
    pushTaskReport,
    repositoriesDirectory,
    repository,
    tasks,
}: TaskRunnerArguments): Promise<ListrTask[]> => {
    const repositoryDirectory = resolve(repositoriesDirectory, repository);

    const throwAndReport = (taskTitle: string, message: string): never => {
        pushTaskReport({
            taskTitle,
            error: message,
        });
        throw new Error(message);
    };

    const taskListrTasks: ListrTask[] = [];

    for (const task of tasks) {
        taskListrTasks.push({
            title: task.title,
            task: async () => {
                try {
                    const result = await task.run(repositoryDirectory);
                    if (result) {
                        pushTaskReport({
                            taskTitle: task.title,
                            output: result,
                        });
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        throwAndReport(task.title, error.message);
                    }

                    throwAndReport(task.title, 'Unexpected error');
                }
            },
        });
    }

    // since this is the last layer without any subtasks the exports is different
    return taskListrTasks;
};
