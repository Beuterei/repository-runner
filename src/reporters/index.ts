import { JSONReporter } from './json.reporter';
import { MarkdownReporter } from './markdown.reporter';

// This export is here only for syntax sugar and IDE autocomplete
export const buildInReporters = {
    /**
     * Writes report markdown files to the configured output directory.
     */
    markdownReporter: (...args: ConstructorParameters<typeof MarkdownReporter>) =>
        new MarkdownReporter(...args),
    /**
     * Writes report JSON files to the configured output directory.
     */
    jsonReporter: (...args: ConstructorParameters<typeof JSONReporter>) =>
        new JSONReporter(...args),
};
