import type { Task } from '../shared/repositoryRunner';
import execa from 'execa';

export class DryMergeTask implements Task {
    public constructor(targetBranch = 'main') {
        this.title = `Dry merge to target branch: ${targetBranch}`;
        this.targetBranch = targetBranch;
    }

    public async run(repositoriesDirectory: string): Promise<undefined> {
        // This is resulting in a merge without a commit and fast forward. You could call it a dry run
        await execa('git', ['merge', '--no-commit', '--no-ff', this.targetBranch], {
            cwd: repositoriesDirectory,
        });

        return undefined;
    }

    private readonly targetBranch: string;

    public readonly title: string;
}
