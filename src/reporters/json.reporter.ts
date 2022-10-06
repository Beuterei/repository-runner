import { writeFileSync } from 'fs';
import { resolve } from 'path';
import type { Reporter, RepositoryReport } from '../shared/repositoryRunner';

export class JSONReporter implements Reporter {
    private readonly outputDirectory: string;

    private readonly filename: string;

    public constructor(outputDirectory: string, filename = 'report') {
        this.outputDirectory = outputDirectory;
        this.filename = filename;
    }

    public async report(repositoryReports: RepositoryReport[]): Promise<void> {
        writeFileSync(
            resolve(this.outputDirectory, `${this.filename}.json`),
            JSON.stringify(repositoryReports, null, 2),
        );
    }
}
