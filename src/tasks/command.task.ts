import type { Task } from '../shared/repositoryRunner';
import execa from 'execa';

export class CommandTask implements Task {
    private readonly args?: string[];

    private readonly command: string;

    public constructor(command: string, args?: string[], reportStdout = true) {
        // Join args to the title if there are any
        this.title = args ? `${command} ${args.join(' ')}` : command;
        this.command = command;
        this.args = args;
        this.reportStdout = reportStdout;
    }

    private readonly reportStdout: boolean;

    public async run(repositoriesDirectory: string): Promise<string | undefined> {
        // Set the cwd to the repository directory
        const output = await execa(this.command, this.args, {
            cwd: repositoriesDirectory,
        });

        if (this.reportStdout) {
            return output.stdout;
        }

        return undefined;
    }

    public readonly title: string;
}
