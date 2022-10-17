export type NonEmptyArray<T> = [T, ...T[]];

export interface Reporter {
    /**
     * Function to be called after the run is done.
     */
    report: (repositoryReports: RepositoryReport[]) => Promise<void>;
}

export interface Task {
    /**
     * Function that gets called during runtime.
     */
    run: (repositoriesDirectory: string) => Promise<string | undefined>;
    /**
     * Tasks title to be used in reports.
     */
    readonly title: string;
}

export interface RepositoryTasks {
    /**
     * Overrides the global regex.
     */
    branchRegex?: RegExp;
    /**
     * List of tasks to run after all branch tasks. Run once after all branches in repository
     */
    cleanupTasks?: NonEmptyArray<Task>;
    /**
     * List of tasks to run before all branch tasks. Run once before all branches in repository
     */
    prepareTasks?: NonEmptyArray<Task>;
    /**
     * Repository name to look up in repositoriesDirectory.
     */
    repository: string;
    /**
     * List of tasks to run on all matches branches.
     */
    tasks: NonEmptyArray<Task>;
}

export interface RunnerConfig {
    /**
     * Regex used to match branches to run tasks.
     */
    branchRegex: RegExp;
    /**
     * Run repositories in concurrent mode. If number is passed this number will be used as maximum.
     */
    concurrent?: boolean | number;
    /**
     * Array of objects with the Reporter interface.
     */
    reporters?: Reporter[];
    /**
     * Repositories to run.
     */
    repositories: NonEmptyArray<RepositoryTasks>;
    /**
     * Repositories directory where the repositories are located.
     */
    repositoriesDirectory: string;
}

interface TaskReportBase {
    /**
     * Title of reference task.
     */
    taskTitle: string;
}

interface TaskReportError extends TaskReportBase {
    /**
     * Error string of task result.
     */
    error?: string;
    output?: never;
}

interface TaskReportSuccess extends TaskReportBase {
    error?: never;
    /**
     * Output string of task result.
     */
    output?: string;
}

export type TaskReport = TaskReportError | TaskReportSuccess;

interface BranchReportBase {
    /**
     * Name of reference branch.
     */
    branch: string;
}

interface BranchReportError extends BranchReportBase {
    /**
     * Error string of branch result.
     */
    error?: string;
    taskReports?: never;
}

interface BranchReportSuccess extends BranchReportBase {
    error?: never;
    /**
     * List of task reports.
     */
    taskReports: TaskReport[];
}

export type BranchReport = BranchReportError | BranchReportSuccess;

interface RepositoryReportBase {
    /**
     * Name of reference repository.
     */
    repository: string;
}

interface RepositoryReportError extends RepositoryReportBase {
    branchReports?: never;
    /**
     * Error string of repository result.
     */
    error?: string;
}

interface RepositoryReportSuccess extends RepositoryReportBase {
    /**
     * List of branch reports.
     */
    branchReports: BranchReport[];
    error?: never;
}

export type RepositoryReport = RepositoryReportError | RepositoryReportSuccess;
