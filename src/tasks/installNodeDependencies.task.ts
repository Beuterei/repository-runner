import type { Task } from '../shared/repositoryRunner';
import execa from 'execa';

export class InstallNodeDependenciesTask implements Task {
    public constructor(packageManager: 'npm' | 'yarn' = 'npm') {
        this.packageManager = packageManager;
    }

    private readonly packageManager: 'npm' | 'yarn';

    public async run(repositoriesDirectory: string): Promise<undefined> {
        // Decide on the package manager what command to use
        if (this.packageManager === 'yarn') {
            await execa('yarn', ['install', '--frozen-lockfile'], {
                cwd: repositoriesDirectory,
            });

            return undefined;
        }

        // Since we only support two options we can assume the fallback
        await execa('npm', ['ci'], {
            cwd: repositoriesDirectory,
        });

        return undefined;
    }

    public readonly title = 'Install node dependencies';
}
