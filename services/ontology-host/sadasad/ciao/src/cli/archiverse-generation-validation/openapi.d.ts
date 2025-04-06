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
export declare function validateOpenApi(filePath: string): Promise<void>;
//# sourceMappingURL=openapi.d.ts.map