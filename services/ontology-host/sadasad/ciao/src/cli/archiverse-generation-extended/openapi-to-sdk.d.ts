/**
 * Runs the openapi-generator-cli tool to generate SDKs from an OpenAPI spec.
 * @param openApiPath Path to the input OpenAPI spec file.
 * @param outputBaseDir Base directory where SDKs should be generated (e.g., 'generated-sdks').
 * @param languages Array of language keys (e.g., ['typescript-fetch', 'go', 'java']).
 * @param logPrefix The prefix string for logging messages.
 */
export declare function runOpenapiToSdk(openApiPath: string, outputBaseDir: string, languages: string[], logPrefix: string): Promise<void>;
//# sourceMappingURL=openapi-to-sdk.d.ts.map