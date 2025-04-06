import chalk from 'chalk';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
const execPromise = util.promisify(exec);
/**
 * Runs the openapi-generator-cli tool to generate SDKs from an OpenAPI spec.
 * @param openApiPath Path to the input OpenAPI spec file.
 * @param outputBaseDir Base directory where SDKs should be generated (e.g., 'generated-sdks').
 * @param languages Array of language keys (e.g., ['typescript-fetch', 'go', 'java']).
 * @param logPrefix The prefix string for logging messages.
 */
export async function runOpenapiToSdk(openApiPath, outputBaseDir, languages, logPrefix) {
    // console.log(chalk.blue(`${logPrefix} Attempting to generate SDKs from ${openApiPath}...`)); // Removed: Caller logs start
    var _a;
    if (!fs.existsSync(openApiPath)) {
        console.warn(chalk.yellow(`${logPrefix}   WARN: Skipping SDK generation: Input file not found at ${openApiPath}`)); // Use prefix
        return;
    }
    if (!fs.existsSync(outputBaseDir)) {
        fs.mkdirSync(outputBaseDir, { recursive: true });
    }
    for (const lang of languages) {
        const sdkOutputDir = path.join(outputBaseDir, lang);
        const command = `npx @openapitools/openapi-generator-cli generate -i "${openApiPath}" -g ${lang} -o "${sdkOutputDir}"`; // Quote paths
        // Note: Using npx assumes the tool is installed locally or globally.
        // Adjust command if using docker or direct JAR execution.
        console.log(chalk.blue(`${logPrefix}   Generating ${lang} SDK to ${sdkOutputDir}...`)); // Use prefix
        try {
            // console.log(chalk.gray(`${logPrefix}     Executing: ${command}`)); // Optional: Log command execution
            const { stdout, stderr } = await execPromise(command);
            if (stderr) {
                console.warn(chalk.yellow(`${logPrefix}     WARN: openapi-generator-cli stderr for ${lang}:\n${stderr}`)); // Use prefix
            }
            // stdout often contains completion messages
            if (stdout) {
                console.log(chalk.gray(`${logPrefix}     openapi-generator-cli stdout for ${lang}:\n${stdout}`)); // Use prefix
            }
            console.log(chalk.green(`${logPrefix}     SUCCESS: Generated ${lang} SDK.`)); // Use prefix
        }
        catch (error) {
            console.error(chalk.red(`\n${logPrefix} ERROR: Error during ${lang} SDK generation:`), (_a = error.message) !== null && _a !== void 0 ? _a : error); // Use prefix
            if (error.stderr) {
                console.error(chalk.red(`${logPrefix}   openapi-generator-cli stderr:\n${error.stderr}`)); // Use prefix
            }
            if (error.stdout) {
                console.error(chalk.red(`${logPrefix}   openapi-generator-cli stdout:\n${error.stdout}`)); // Use prefix
            }
            console.error(chalk.yellow(`${logPrefix}   Please ensure '@openapitools/openapi-generator-cli' is installed (e.g., via npm).`)); // Use prefix
            // Decide whether to continue with other languages or throw
            // For now, just log the error and continue (caller will report overall failure)
            // throw new Error(`openapi-generator-cli failed for ${lang}`);
        }
    }
}
//# sourceMappingURL=openapi-to-sdk.js.map