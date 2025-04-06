import chalk from 'chalk';
import fs from 'fs';
import { URI } from 'langium'; // Removed LangiumDocument
import { NodeFileSystem } from 'langium/node';
import path from 'path';
import { fileURLToPath } from 'url';
// Removed Diagnostic import from vscode-languageserver-types
import { createArchiverseServices } from '../language/archiverse-module.js';
// ArchiverseModel might not be needed directly here if we just check diagnostics
// import { ArchiverseModel } from '../language/generated/ast.js';
/**
 * Standalone script to validate all Archiverse model files (.archiverse) in the project.
 * Reports errors and warnings to the console and exits with a non-zero status code if errors are found.
 */
const SCRIPT_NAME = 'BUILD_VALIDATOR';
const logPrefix = `[ARCHIVERSE:${SCRIPT_NAME}]`;
export async function validateModels() {
    var _a, _b;
    // Initialize Langium services with NodeFileSystem
    const services = createArchiverseServices(Object.assign({}, NodeFileSystem)).Archiverse;
    const documents = services.shared.workspace.LangiumDocuments;
    // Determine workspace root relative to the current script file
    const scriptPath = fileURLToPath(import.meta.url);
    const workspaceRoot = path.resolve(path.join(path.dirname(scriptPath), '../../')); // Assumes CLI is in src/cli
    console.log(chalk.blue(`${logPrefix} Searching for .archiverse files in: ${workspaceRoot}`));
    const filePaths = await findArchiverseFiles(workspaceRoot);
    if (filePaths.length === 0) {
        console.log(chalk.yellow(`${logPrefix} WARN: No .archiverse files found to validate.`));
        process.exit(0);
    }
    console.log(chalk.blue(`${logPrefix} Found ${filePaths.length} .archiverse files. Validating...`));
    let totalErrors = 0;
    let totalWarnings = 0;
    // Load all documents using getOrCreateDocument
    // This should implicitly trigger parsing, linking, and validation phases
    console.log(chalk.blue(`${logPrefix} Loading documents...`));
    for (const filePath of filePaths) {
        const uri = URI.file(filePath);
        try {
            // This should trigger parsing, linking, and registered validations
            await documents.getOrCreateDocument(uri);
            // Check if document loaded successfully, maybe log progress
            // const doc = documents.getDocument(uri);
            // if (!doc) {
            //     console.warn(chalk.yellow(`  Failed to load document: ${filePath}`));
            // }
        }
        catch (e) {
            console.error(chalk.red(`${logPrefix} ERROR: Error processing document ${path.relative(workspaceRoot, filePath)}:`), (_a = e.message) !== null && _a !== void 0 ? _a : e);
            totalErrors++; // Count processing errors as validation errors
        }
    }
    console.log(chalk.blue(`${logPrefix} Document loading complete. Checking diagnostics...`));
    // Iterate over the loaded documents held by LangiumDocuments and report diagnostics
    for (const document of documents.all) {
        // Ensure the document URI corresponds to one of the files we intended to load
        if (!filePaths.includes(document.uri.fsPath)) {
            continue; // Skip documents that might have been loaded indirectly (e.g., imports)
        }
        const diagnostics = (_b = document.diagnostics) !== null && _b !== void 0 ? _b : [];
        const validationErrors = diagnostics.filter(d => d.severity === 1); // 1 = Error
        const validationWarnings = diagnostics.filter(d => d.severity === 2); // 2 = Warning
        if (validationErrors.length > 0 || validationWarnings.length > 0) {
            console.log(chalk.yellow(`\n${logPrefix} Diagnostics for ${path.relative(workspaceRoot, document.uri.fsPath)}:`));
            diagnostics.forEach(diagnostic => {
                const message = `${diagnostic.message} [${document.textDocument.getText(diagnostic.range)}]`;
                if (diagnostic.severity === 1) {
                    console.error(chalk.red(`  ERROR: ${message}`));
                    totalErrors++;
                }
                else if (diagnostic.severity === 2) {
                    console.warn(chalk.yellow(`  WARN: ${message}`));
                    totalWarnings++;
                }
                else {
                    console.log(chalk.gray(`  INFO: ${message}`));
                }
            });
        }
    }
    console.log(chalk.blue(`\n${logPrefix} Validation Summary:`));
    console.log(chalk.red(`  Total Errors: ${totalErrors}`));
    console.log(chalk.yellow(`  Total Warnings: ${totalWarnings}`));
    if (totalErrors > 0) {
        console.error(chalk.red(`\n${logPrefix} ERROR: Validation failed due to errors.`));
        process.exit(1);
    }
    else {
        console.log(chalk.green(`\n${logPrefix} SUCCESS: Validation completed.`));
        process.exit(0);
    }
}
async function findArchiverseFiles(dir) {
    let files = [];
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip node_modules and dist/build directories
            if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== 'build' && !entry.name.startsWith('.')) {
                files = files.concat(await findArchiverseFiles(fullPath));
            }
        }
        else if (entry.isFile() && entry.name.endsWith('.archiverse')) {
            files.push(fullPath);
        }
    }
    return files;
}
// Execute the validation function if the script is run directly
// Convert script path and argv[1] to file paths for comparison
const scriptFilePath = fileURLToPath(import.meta.url);
const entryFilePath = path.resolve(process.argv[1]);
if (scriptFilePath === entryFilePath) {
    validateModels().catch(err => {
        console.error(chalk.red(`${logPrefix} FATAL: An unexpected error occurred during validation:`), err);
        process.exit(1);
    });
}
//# sourceMappingURL=build-validator.js.map