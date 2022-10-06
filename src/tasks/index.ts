import { CommandTask } from './command.task';
import { DryMergeTask } from './dryMerge.task';
import { InstallNodeDependenciesTask } from './installNodeDependencies.task';

// This export is here only for syntax sugar and IDE autocomplete
export const buildInTasks = {
    /**
     * Run a command with the current repository as pwd. Optional reports stdout back in the task report.
     */
    commandTask: (...args: ConstructorParameters<typeof CommandTask>) => new CommandTask(...args),
    /**
     * Tries a dry run merge with the configured branch.
     */
    dryMergeTask: (...args: ConstructorParameters<typeof DryMergeTask>) =>
        new DryMergeTask(...args),
    /**
     * Installs dependencies with the configured package manager. Uses `npm ci` or `yarn install --frozen-lockfile` under the hood.
     */
    installNodeDependenciesTask: (
        ...args: ConstructorParameters<typeof InstallNodeDependenciesTask>
    ) => new InstallNodeDependenciesTask(...args),
};
