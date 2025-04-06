import chalk from 'chalk';
// Removed unused Grammar, LangiumDocument imports
import { GrammarAST } from 'langium';
// Removed unused NodeFileSystem import
import path from 'path';
import { fileURLToPath } from 'url';
import { getAnnotationsFromNode } from '../archiverse-annotation/parser.js';
import { validateAnnotationsForNode } from '../archiverse-annotation/validator.js';
// Removed unused createArchiverseServices import
import { loadGrammarDocuments } from '../archiverse-generation/grammar-loader.js'; // Reuse grammar loader
/**
 * Standalone script to validate annotations within Archiverse grammar files (.langium).
 * Reports errors and warnings to the console and exits with a non-zero status code if errors are found.
 */
const SCRIPT_NAME = 'ANNOTATION_VALIDATION';
const logPrefix = `[ARCHIVERSE:${SCRIPT_NAME}]`;
async function validateGrammarAnnotations() {
    var _a, _b;
    console.log(chalk.blue(`${logPrefix} Starting...`));
    // Removed unused outer acceptor declaration
    try {
        // 1. Load grammar documents (reusing the logic from generation)
        // This implicitly uses the Langium infrastructure which might perform some base validation
        const { documents: allGrammarDocuments, workspaceRoot } = await loadGrammarDocuments();
        // Filter documents to only include those in the specified directory
        const targetDir = 'src/language'; // Updated target directory
        const targetDirAbsPath = path.resolve(workspaceRoot, targetDir);
        const grammarDocuments = allGrammarDocuments.filter(doc => doc.uri.fsPath.startsWith(targetDirAbsPath));
        console.log(chalk.blue(`${logPrefix} Found ${grammarDocuments.length} grammar document(s) in '${targetDir}'. Validating...`));
        // 2. Iterate through rules and validate annotations
        const allIssues = [];
        for (const doc of grammarDocuments) {
            const grammar = (_a = doc.parseResult) === null || _a === void 0 ? void 0 : _a.value;
            const currentDocPath = path.relative(workspaceRoot, doc.uri.fsPath); // Get relative path here
            if (!grammar) {
                console.warn(chalk.yellow(`${logPrefix} WARN: Skipping document ${currentDocPath} due to parse errors.`));
                continue;
            }
            // Temporary acceptor for this document
            const docIssues = [];
            const acceptor = (severity, message, info) => {
                docIssues.push({ severity, message, info, docPath: currentDocPath }); // Add docPath
            };
            // Define patterns for rules to skip annotation validation for
            const skipPatterns = [
                /Type$/, /Ref$/, /Description$/, /Publisher$/, /Version$/, /Label$/,
                /Path$/, /Priority$/, /Risk$/, /Effort$/, /Category$/, /Criticality$/, /Area$/
            ];
            for (const rule of grammar.rules) {
                // Skip validation for rules matching skip patterns (likely helper/type rules)
                // Also skip if it's not a ParserRule (e.g., TerminalRule)
                if (!GrammarAST.isParserRule(rule) || skipPatterns.some(pattern => pattern.test(rule.name))) {
                    continue; // Skip this rule
                }
                const annotations = getAnnotationsFromNode(rule);
                // Use the dedicated validator function, passing the acceptor
                validateAnnotationsForNode(annotations, rule, acceptor);
            }
            allIssues.push(...docIssues); // Collect issues from this document
        }
        // 3. Report collected validation issues
        if (allIssues.length > 0) {
            console.log(chalk.yellow(`\n${logPrefix} Issues Found:`));
            let errorCount = 0;
            allIssues.forEach(({ severity, message, info, docPath }) => {
                var _a, _b, _c;
                const severityString = severity === 'error' ? chalk.red('ERROR') : chalk.yellow('WARN');
                const node = info.node;
                const line = ((_c = (_b = (_a = node === null || node === void 0 ? void 0 : node.$cstNode) === null || _a === void 0 ? void 0 : _a.range) === null || _b === void 0 ? void 0 : _b.start) === null || _c === void 0 ? void 0 : _c.line) !== undefined ? ` (Line ${node.$cstNode.range.start.line + 1})` : '';
                // Safely check type before accessing name
                const ruleName = GrammarAST.isAbstractRule(node) ? node.name : 'Unknown Node Type';
                // Use the explicitly stored docPath
                console.log(`  ${severityString}: ${message} [Rule: ${ruleName}${line} in ${docPath}]`); // Keep indentation for readability
                if (severity === 'error') {
                    errorCount++;
                }
            });
            if (errorCount > 0) {
                console.error(chalk.red(`\n${logPrefix} ERROR: ${errorCount} critical annotation error(s) found.`));
                process.exit(1); // Exit with error code
            }
            else {
                console.log(chalk.yellow(`\n${logPrefix} WARN: Validation completed with warnings.`));
                process.exit(0); // Exit successfully even with warnings
            }
        }
        else {
            console.log(chalk.green(`\n${logPrefix} SUCCESS: Validation passed.`));
            process.exit(0); // Exit successfully
        }
    }
    catch (error) {
        console.error(chalk.red(`\n${logPrefix} FATAL: Error during validation:`), (_b = error.message) !== null && _b !== void 0 ? _b : error);
        process.exit(1);
    }
}
// Execute if run directly
const scriptFilePath = fileURLToPath(import.meta.url);
const entryFilePath = path.resolve(process.argv[1]);
if (scriptFilePath.endsWith(entryFilePath) || path.basename(scriptFilePath) === path.basename(entryFilePath)) { // More robust check
    validateGrammarAnnotations();
}
//# sourceMappingURL=index.js.map