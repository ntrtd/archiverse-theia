import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadGrammarDocuments } from './grammar-loader.js';
import { buildIntermediateRepresentation } from './ir-builder.js';
import { renderGraphSchema } from './renderers/graph-schema/index.js';
import { renderGraphQLSDL } from './renderers/graphql/index.js';
import { renderMcpDefinitions } from './renderers/mcp/index.js';
import { renderODataMetadata } from './renderers/odata/index.js';
import { renderOpenApi } from './renderers/openapi/index.js';
// Validation functions are no longer called here
/**
 * Main function to orchestrate the downstream artifact generation process.
 */
const SCRIPT_NAME = 'GENERATION';
const logPrefix = `[ARCHIVERSE:${SCRIPT_NAME}]`;
async function generateArtifacts() {
    var _a;
    console.log(chalk.blue(`${logPrefix} Starting...`));
    try {
        // 1. Load and parse grammar documents (ensures CST is available)
        // This step implicitly relies on annotation validation having passed previously in the build.
        const { documents: grammarDocuments, workspaceRoot } = await loadGrammarDocuments();
        // 2. Build the Intermediate Representation (IR)
        const ir = buildIntermediateRepresentation(grammarDocuments, logPrefix); // Pass logPrefix
        // 3. Render outputs (Placeholders for now)
        // Define output directory
        const outputDir = path.join(workspaceRoot, 'src/language/generated-archiverse');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        // Render OpenAPI
        console.log(chalk.blue(`${logPrefix} Rendering OpenAPI specification...`));
        const openApiPath = path.join(outputDir, 'openapi.json');
        const openApiContent = renderOpenApi(ir, logPrefix); // Pass logPrefix
        fs.writeFileSync(openApiPath, openApiContent);
        console.log(chalk.green(`${logPrefix}   SUCCESS: Generated OpenAPI spec to ${openApiPath}`));
        // Render OData Metadata
        console.log(chalk.blue(`${logPrefix} Rendering OData Metadata...`));
        const odataPath = path.join(outputDir, 'odata-metadata.xml');
        const odataContent = renderODataMetadata(ir, logPrefix);
        fs.writeFileSync(odataPath, odataContent);
        console.log(chalk.green(`${logPrefix}   SUCCESS: Generated OData metadata to ${odataPath} with ${ir.elements.length} entities`));
        // Render GraphQL SDL
        console.log(chalk.blue(`${logPrefix} Rendering GraphQL SDL (placeholder)...`));
        const graphqlPath = path.join(outputDir, 'schema.graphql');
        const graphqlContent = renderGraphQLSDL(ir);
        fs.writeFileSync(graphqlPath, graphqlContent);
        console.log(chalk.green(`${logPrefix}   SUCCESS: Generated GraphQL SDL to ${graphqlPath}`));
        // Render Graph Schema (e.g., Markdown)
        console.log(chalk.blue(`${logPrefix} Rendering Graph Schema (placeholder)...`));
        const graphSchemaPath = path.join(outputDir, 'graph-schema.groovy');
        const graphSchemaContent = renderGraphSchema(ir);
        fs.writeFileSync(graphSchemaPath, graphSchemaContent);
        console.log(chalk.green(`${logPrefix}   SUCCESS: Generated Graph Schema docs to ${graphSchemaPath}`));
        // Render MCP Definitions (Conceptual)
        console.log(chalk.blue(`${logPrefix} Rendering MCP Definitions (placeholder)...`));
        const mcpPath = path.join(outputDir, 'mcp-definitions.txt');
        const mcpContent = renderMcpDefinitions(ir);
        fs.writeFileSync(mcpPath, mcpContent);
        console.log(chalk.green(`${logPrefix}   SUCCESS: Generated MCP definitions to ${mcpPath}`));
        console.log(chalk.green(`\n${logPrefix} SUCCESS: Artifact generation completed.`));
        process.exit(0);
    }
    catch (error) {
        console.error(chalk.red(`\n${logPrefix} FATAL: Error during artifact generation:`), (_a = error.message) !== null && _a !== void 0 ? _a : error);
        process.exit(1);
    }
}
// Execute if run directly
const scriptFilePath = fileURLToPath(import.meta.url);
const entryFilePath = path.resolve(process.argv[1]);
if (scriptFilePath === entryFilePath) {
    generateArtifacts();
}
//# sourceMappingURL=index.js.map