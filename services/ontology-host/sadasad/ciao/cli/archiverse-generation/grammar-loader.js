import chalk from 'chalk';
import fs from 'fs';
import { URI } from 'langium';
import { createLangiumGrammarServices } from 'langium/grammar';
import { NodeFileSystem } from 'langium/node';
import path from 'path';
import { fileURLToPath } from 'url';
/**
 * Loads and parses all .langium grammar files within the project.
 * Ensures the Concrete Syntax Tree (CST) is available for annotation parsing.
 */
export async function loadGrammarDocuments() {
    // console.log(chalk.blue('Loading grammar documents for generation...'));
    var _a;
    const services = createLangiumGrammarServices(NodeFileSystem);
    const documents = services.shared.workspace.LangiumDocuments;
    // Determine workspace root
    const scriptPath = fileURLToPath(import.meta.url);
    // Go up 3 levels from out/cli/archiverse-generation to reach project root
    const workspaceRoot = path.resolve(path.join(path.dirname(scriptPath), '../../../'));
    // console.log(chalk.blue(`Searching for .langium files in: ${workspaceRoot}`));
    const grammarFilePaths = await findLangiumFiles(workspaceRoot);
    if (grammarFilePaths.length === 0) {
        throw new Error('No .langium files found in the workspace.');
    }
    // console.log(chalk.blue(`Found ${grammarFilePaths.length} .langium files.`));
    // Load documents using getOrCreateDocument
    let hasError = false;
    for (const filePath of grammarFilePaths) {
        const uri = URI.file(filePath);
        try {
            // This ensures the document is parsed and linked, including CST
            await documents.getOrCreateDocument(uri);
        }
        catch (e) {
            console.error(chalk.red(`  Error processing grammar file ${path.relative(workspaceRoot, filePath)}:`), (_a = e.message) !== null && _a !== void 0 ? _a : e);
            hasError = true;
        }
    }
    if (hasError) {
        throw new Error('Errors occurred while loading grammar files. Cannot proceed with generation.');
    }
    // console.log(chalk.blue('Grammar documents loaded successfully.'));
    // Return only the documents directly found, not imported stdlib etc.
    const loadedDocs = grammarFilePaths
        .map(filePath => ({ filePath, doc: documents.getDocument(URI.file(filePath)) })) // Keep track of original path
        .filter((item) => {
        if (item.doc === undefined) {
            console.warn(chalk.yellow(`  Warning: Could not retrieve loaded document for path: ${item.filePath}`)); // Use item.filePath
            return false;
        }
        // Log the URI of the document being returned
        // console.log(chalk.gray(`  Returning loaded document: ${item.doc.uri.fsPath}`));
        return true;
    })
        .map(item => item.doc); // Extract the document after filtering
    // Removed duplicated logging and return lines from here
    // console.log(chalk.blue(`Returning ${loadedDocs.length} loaded grammar documents.`));
    return { documents: loadedDocs, workspaceRoot }; // This is the correct final return
}
// Helper function to find .langium files
async function findLangiumFiles(dir) {
    let files = [];
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip node_modules and dist/build directories
            if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== 'build' && !entry.name.startsWith('.')) {
                files = files.concat(await findLangiumFiles(fullPath));
            }
        }
        else if (entry.isFile() && entry.name.endsWith('.langium')) {
            files.push(fullPath);
        }
    }
    return files;
}
//# sourceMappingURL=grammar-loader.js.map