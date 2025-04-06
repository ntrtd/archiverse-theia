import { exec } from 'child_process';
import path from 'path';
import util from 'util';
import { fileURLToPath } from 'url';
const SCRIPT_NAME = 'GENERATION_VALIDATION';
const logPrefix = `[ARCHIVERSE:${SCRIPT_NAME}]`;
const execPromise = util.promisify(exec);
// Determine project root relative to the current file
const scriptPath = fileURLToPath(import.meta.url);
// Go up 3 levels from out/cli/archiverse-generation-validation to reach project root
const projectRoot = path.resolve(path.join(path.dirname(scriptPath), '../../../'));
const XSD_PATH = path.join(projectRoot, 'schemas/odata-csdl');
/**
 * Validates a generated OData CSDL XML file using xmllint (requires xmllint to be installed).
 * @param filePath Path to the OData metadata XML file.
 */
export async function validateODataMetadata(filePath) {
    console.log(`${logPrefix} Validating OData metadata file: ${filePath}`);
    const schemaPath = path.join(XSD_PATH, 'edmx.xsd'); // Main EDMX schema file
    try {
        // Ensure xmllint is available in the system PATH
        // The command validates the XML file against the specified XSD schema.
        // --noout prevents printing the validated XML itself.
        const { stdout, stderr } = await execPromise(`xmllint --noout --schema "${schemaPath}" "${filePath}"`);
        if (stderr && !stderr.includes('validates')) { // xmllint might output to stderr even on success, check if it's not just the success message
            // xmllint often prints validation errors to stderr
            // console.error(chalk.red(`    OData validation failed:\n${stderr}`)); // Removed: Caller logs failure
            throw new Error(`OData validation failed (stderr):\n${stderr}`); // Throw detailed error
        }
        // Check stdout as well, sometimes errors appear there
        if (stdout && !stdout.includes('validates')) {
            // console.error(chalk.red(`    OData validation failed:\n${stdout}`)); // Removed: Caller logs failure
            throw new Error(`OData validation failed (stdout):\n${stdout}`); // Throw detailed error
        }
        console.log(`${logPrefix} OData metadata file ${filePath} is valid.`);
    }
    catch (error) {
        // Handle execution errors (e.g., xmllint not found) or validation errors printed to stderr/stdout
        const errorMessage = error.stderr || error.stdout || error.message || 'Unknown error';
        // console.error(chalk.red(`    OData validation failed (xmllint execution error or validation issues):\n${errorMessage}`)); // Removed: Caller logs failure
        // Re-throw a more informative error
        throw new Error(`OData validation failed (xmllint execution error or validation issues):\n${errorMessage}`);
    }
}
//# sourceMappingURL=odata.js.map