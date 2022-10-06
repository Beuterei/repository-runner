import { writeFileSync } from 'fs';
import { resolve } from 'path';
import type { Reporter, RepositoryReport } from '../shared/repositoryRunner';

export class JSONReporter implements Reporter {
    private readonly outputDirectory: string;

    public constructor(outputDirectory: string) {
        this.outputDirectory = outputDirectory;
    }

    public async report(repositoryReports: RepositoryReport[]): Promise<void> {
        writeFileSync(
            resolve(this.outputDirectory, 'report.json'),
            JSON.stringify(repositoryReports, null, 2),
        );
    }
}
