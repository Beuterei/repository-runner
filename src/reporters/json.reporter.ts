import type { Reporter, RepositoryReport } from '../shared/repositoryRunner';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

export class JSONReporter implements Reporter {
    public constructor(outputDirectory: string, filename = 'report') {
        this.outputDirectory = outputDirectory;
        this.filename = filename;
    }

    private readonly filename: string;

    private readonly outputDirectory: string;

    public async report(repositoryReports: RepositoryReport[]): Promise<void> {
        writeFileSync(
            resolve(this.outputDirectory, `${this.filename}.json`),
            JSON.stringify(repositoryReports, null, 2),
        );
    }
}
