import chalk from 'chalk';
// Removed unused fs import
import path from 'path';
import { fileURLToPath } from 'url';
import { runOpenapiToKong } from './openapi-to-kong.js';
import { runOpenapiToSdk } from './openapi-to-sdk.js';
// Optional: import { executeCommand } from './utils.js';
/**
 * Main function to orchestrate extended generation steps.
 */
const SCRIPT_NAME = 'GENERATION_EXTENDED';
const logPrefix = `[ARCHIVERSE:${SCRIPT_NAME}]`;
async function generateExtendedArtifacts() {
    console.log(chalk.blue(`${logPrefix} Starting...`));
    let hasErrors = false;
    // Determine workspace root and input/output paths
    const scriptPath = fileURLToPath(import.meta.url);
    // Go up 4 levels from out/cli/archiverse-generation-extended to reach project root
    const workspaceRoot = path.resolve(path.join(path.dirname(scriptPath), '../../../../'));
    const generatedArtifactsDir = path.join(workspaceRoot, 'src/language/generated-archiverse');
    const openApiPath = path.join(generatedArtifactsDir, 'openapi.json');
    const sdkBaseDir = path.join(workspaceRoot, 'generated-sdks'); // Example output dir for SDKs
    // --- Run openapi2kong ---
    console.log(chalk.blue(`${logPrefix} Attempting to convert ${openApiPath} to Kong config...`));
    try {
        await runOpenapiToKong(openApiPath, generatedArtifactsDir, logPrefix); // Pass logPrefix
        // Assuming runOpenapiToKong logs its own success/skip messages based on file existence
    }
    catch (error) {
        console.error(chalk.red(`${logPrefix} ERROR: openapi2kong step failed: ${error.message || error}`));
        hasErrors = true; // Mark error but continue if possible
    }
    // --- Run openapi-to-sdk ---
    // Define which languages to generate SDKs for
    const sdkLanguages = ['typescript-fetch']; // Example: Add 'go', 'java' etc. as needed
    console.log(chalk.blue(`${logPrefix} Attempting to generate SDKs from ${openApiPath}...`));
    try {
        await runOpenapiToSdk(openApiPath, sdkBaseDir, sdkLanguages, logPrefix); // Pass logPrefix
        // Assuming runOpenapiToSdk logs its own success/skip messages based on file existence
    }
    catch (error) {
        console.error(chalk.red(`${logPrefix} ERROR: openapi-to-sdk step failed: ${error.message || error}`));
        hasErrors = true; // Mark error but continue if possible
    }
    // --- Add other extended generation steps here ---
    // --- Final Status ---
    if (hasErrors) {
        console.error(chalk.red(`\n${logPrefix} ERROR: Extended artifact generation finished with errors.`));
        process.exit(1);
    }
    else {
        console.log(chalk.green(`\n${logPrefix} SUCCESS: Extended artifact generation completed.`));
        process.exit(0);
    }
}
// Execute if run directly
const scriptFilePath = fileURLToPath(import.meta.url);
const entryFilePath = path.resolve(process.argv[1]);
if (scriptFilePath === entryFilePath) {
    generateExtendedArtifacts();
}
//# sourceMappingURL=index.js.map