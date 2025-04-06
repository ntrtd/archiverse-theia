import chalk from 'chalk';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
const execPromise = util.promisify(exec);
/**
 * Runs the openapi2kong tool to convert an OpenAPI spec to Kong declarative config.
 * @param openApiPath Path to the input OpenAPI spec file.
 * @param outputDir Directory where the Kong config file should be written.
 * @param logPrefix The prefix string for logging messages.
 */
export async function runOpenapiToKong(openApiPath, outputDir, logPrefix) {
    const kongOutputPath = path.join(outputDir, 'kong.yaml'); // Default to YAML
    // console.log(chalk.blue(`${logPrefix} Attempting to convert ${openApiPath} to Kong config at ${kongOutputPath}...`)); // Removed: Caller logs start
    // Check if input OpenAPI spec exists
    if (!fs.existsSync(openApiPath)) {
        console.warn(chalk.yellow(`${logPrefix}   WARN: Skipping openapi2kong: Input file not found at ${openApiPath}`)); // Use prefix
        // Decide if this should be an error or just a skip. Skipping for now.
        return;
    }
    // Construct the command
    // Assumes 'openapi2kong' is in the system PATH
    const command = `openapi2kong --output "${kongOutputPath}" "${openApiPath}"`; // Quote paths
    try {
        // console.log(chalk.gray(`${logPrefix}   Executing: ${command}`)); // Optional: Log command execution
        const { stderr } = await execPromise(command); // Removed unused stdout
        if (stderr) {
            console.warn(chalk.yellow(`${logPrefix}   WARN: openapi2kong stderr:\n${stderr}`)); // Use prefix
        }
        // if (stdout) { // Usually stdout is empty on success for this tool
        //      console.log(chalk.gray(`${logPrefix}   openapi2kong stdout:\n${stdout}`));
        // }
        if (!fs.existsSync(kongOutputPath)) {
            throw new Error(`openapi2kong command ran but output file was not created: ${kongOutputPath}`);
        }
        console.log(chalk.green(`${logPrefix}   SUCCESS: Generated Kong config: ${kongOutputPath}`)); // Use prefix
    }
    catch (error) {
        // console.error(chalk.red(`\n${logPrefix} ERROR: Error during openapi2kong execution:`), error.message ?? error); // Caller logs main error
        let detailedError = error.message || error;
        if (error.stderr) {
            // console.error(chalk.red(`${logPrefix}   openapi2kong stderr:\n${error.stderr}`));
            detailedError += `\n  stderr: ${error.stderr}`;
        }
        if (error.stdout) {
            // console.error(chalk.red(`${logPrefix}   openapi2kong stdout:\n${error.stdout}`));
            detailedError += `\n  stdout: ${error.stdout}`;
        }
        // console.error(chalk.yellow(`${logPrefix}   Please ensure 'openapi2kong' is installed and accessible in your PATH.`));
        // Re-throw the error to be caught by the main index.ts
        throw new Error(`openapi2kong failed for ${openApiPath}. Details: ${detailedError}`);
    }
}
//# sourceMappingURL=openapi-to-kong.js.map