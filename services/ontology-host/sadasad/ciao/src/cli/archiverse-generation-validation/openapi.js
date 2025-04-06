import fs from 'fs/promises'; // Use promises for async file reading
import OpenAPISchemaValidator from 'openapi-schema-validator'; // Revert to default import
/**
 * Asynchronously validates a given OpenAPI specification file against the OpenAPI 3.x schema.
 * It reads the file content, parses it as JSON, and uses the `openapi-schema-validator`
 * library to check for compliance. If validation errors are found, or if there's an issue
 * reading or parsing the file, it throws an error detailing the problems.
 *
 * @param {string} filePath - The absolute or relative path to the OpenAPI JSON file to be validated.
 * @returns {Promise<void>} A promise that resolves if the validation is successful.
 * @throws {Error} Throws an error if the file cannot be read, is not valid JSON,
 *                 or fails OpenAPI schema validation. The error message will contain details
 *                 about the validation failures.
 */
export async function validateOpenApi(filePath) {
    // console.log(chalk.gray(`  Validating OpenAPI spec: ${filePath}...`)); // Removed: Caller logs start
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const openApiDoc = JSON.parse(fileContent);
        // Instantiate the validator - try calling the .default property if it exists
        // This handles cases where the default export is the actual constructor/function
        const validator = OpenAPISchemaValidator.default ?
            new OpenAPISchemaValidator.default({ version: 3 }) :
            new OpenAPISchemaValidator({ version: 3 }); // Fallback to direct instantiation
        // If the above still fails, the library might not use 'new' at all.
        // Let's try calling it directly as a function, assuming it might be the default export.
        // const validator = (OpenAPISchemaValidator as any).default ?
        //      (OpenAPISchemaValidator as any).default({ version: 3 }) :
        //      (OpenAPISchemaValidator as any)({ version: 3 });
        // Given the errors, let's stick to the 'new' approach but try accessing .default first.
        const validationResult = validator.validate(openApiDoc);
        if (validationResult.errors.length > 0) {
            // Construct a detailed error message instead of logging directly
            const errorDetails = validationResult.errors.map((error) => `- Path: ${error.instancePath}, Message: ${error.message}`).join('\n      ');
            // console.error(chalk.red(`    OpenAPI validation failed:`)); // Removed: Caller logs failure
            // validationResult.errors.forEach((error: any) => {
            //     console.error(chalk.red(`      - Path: ${error.instancePath}, Message: ${error.message}`));
            // });
            throw new Error(`OpenAPI validation failed:\n      ${errorDetails}`); // Throw detailed error
        }
        // else {
        // console.log(chalk.green(`    OpenAPI validation passed.`)); // Removed: Caller logs success
        // }
    }
    catch (error) { // Explicitly type error as unknown
        // const message = error instanceof Error ? error.message : String(error);
        // console.error(chalk.red(`    Error during OpenAPI validation: ${message}`)); // Removed: Caller logs failure
        // Re-throw the error to be caught by the main validation script
        throw error; // Re-throw original or newly constructed error
    }
}
//# sourceMappingURL=openapi.js.map