import execa from 'execa';
import type { Task } from '../shared/repositoryRunner';

export class InstallNodeDependenciesTask implements Task {
    public readonly title = 'Install node dependencies';

    private readonly packageManager: 'npm' | 'yarn';

    public constructor(packageManager: 'npm' | 'yarn' = 'npm') {
        this.packageManager = packageManager;
    }

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
}
