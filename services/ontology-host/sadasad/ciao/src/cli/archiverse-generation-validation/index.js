import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateOpenApi } from './openapi.js';
import { validateODataMetadata } from './odata.js';
const SCRIPT_NAME = 'GENERATION_VALIDATION';
const logPrefix = `[ARCHIVERSE:${SCRIPT_NAME}]`;
async function validateGraphQL(graphqlPath) {
    console.log(chalk.blue(`${logPrefix}   Validating GraphQL SDL: ${graphqlPath}...`));
    try {
        const fileContent = fs.readFileSync(graphqlPath, 'utf-8');
        if (!fileContent.trim()) {
            throw new Error('GraphQL file is empty.');
        }
        console.log(chalk.green(`${logPrefix}     SUCCESS: GraphQL SDL validation passed.`));
    }
    catch (error) {
        console.error(chalk.red(`${logPrefix}     ERROR: GraphQL SDL validation failed: ${error.message || error}`));
        throw error;
    }
}
async function validateGraphSchema(graphSchemaPath) {
    console.log(chalk.blue(`${logPrefix}   Validating Graph Schema: ${graphSchemaPath}...`));
    try {
        if (!graphSchemaPath.endsWith('.groovy')) {
            throw new Error('Graph Schema file must have a .groovy extension.');
        }
        const fileContent = fs.readFileSync(graphSchemaPath, 'utf-8');
        if (!fileContent.trim()) {
            throw new Error('Graph Schema file is empty.');
        }
        // Check if groovyc is installed
        const { exec } = await import('child_process');
        try {
            await new Promise((resolve, reject) => {
                exec(`groovyc -v`, (error, stdout, stderr) => {
                    if (error) {
                        reject(new Error('Groovy is not installed. Please install Groovy and add it to your PATH. You can install it using `brew install groovy`.'));
                    }
                    else {
                        resolve(undefined);
                    }
                });
            });
        }
        catch (error) {
            throw new Error(`Groovy is not installed. Please install Groovy and add it to your PATH. You can install it using \`brew install groovy\`: ${error.message}`);
        }
        // Execute groovyc command to validate syntax
        await new Promise((resolve, reject) => {
            exec(`groovyc ${graphSchemaPath}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(stderr);
                    reject(new Error(`Groovy compilation failed. Please check the generated schema file for syntax errors:\n${stderr}`));
                }
                else {
                    console.log(stdout);
                    // Basic content validation
                    if (!fileContent.includes('mgmt = graph.openManagement()')) {
                        reject(new Error('Graph Schema file does not contain management initialization.'));
                        return;
                    }
                    if (!fileContent.includes('mgmt.commit()')) {
                        reject(new Error('Graph Schema file does not contain commit statement.'));
                        return;
                    }
                    // Check for vertex labels, edge labels, and property keys
                    const vertexLabelRegex = /mgmt\.makeVertexLabel\('(\w+)'\)\.make\(\)/g;
                    const edgeLabelRegex = /mgmt\.makeEdgeLabel\('(\w+)'\)\.multiplicity\(Multiplicity\.MULTI\)\.make\(\)/g;
                    const propertyKeyRegex = /mgmt\.makePropertyKey\('(\w+)'\)\.dataType\(String\.class\)\.cardinality\(Cardinality\.SINGLE\)\.make\(\)/g;
                    let hasVertexLabels = false;
                    let hasEdgeLabels = false;
                    let hasPropertyKeys = false;
                    const vertexLabelMatches = fileContent.matchAll(vertexLabelRegex);
                    if (vertexLabelMatches) {
                        hasVertexLabels = true;
                    }
                    const edgeLabelMatches = fileContent.matchAll(edgeLabelRegex);
                    if (edgeLabelMatches) {
                        hasEdgeLabels = true;
                    }
                    const propertyKeyMatches = fileContent.matchAll(propertyKeyRegex);
                    if (propertyKeyMatches) {
                        hasPropertyKeys = true;
                    }
                    if (!hasVertexLabels) {
                        reject(new Error('Graph Schema file does not contain any vertex labels.'));
                        return;
                    }
                    if (!hasEdgeLabels) {
                        reject(new Error('Graph Schema file does not contain any edge labels.'));
                        return;
                    }
                    if (!hasPropertyKeys) {
                        reject(new Error('Graph Schema file does not contain any property keys.'));
                        return;
                    }
                    console.log(chalk.green(`${logPrefix}     SUCCESS: Graph Schema validation passed.`));
                    resolve(undefined);
                }
            });
        });
    }
    catch (error) {
        console.error(chalk.red(`${logPrefix}     ERROR: Graph Schema validation failed: ${error.message || error}`));
        throw error;
    }
}
async function validateMcpDefinitions(mcpPath) {
    console.log(chalk.blue(`${logPrefix}   Validating MCP Definitions: ${mcpPath}...`));
    try {
        const fileContent = fs.readFileSync(mcpPath, 'utf-8');
        if (!fileContent.trim()) {
            throw new Error('MCP Definitions file is empty.');
        }
        console.log(chalk.green(`${logPrefix}     SUCCESS: MCP Definitions validation passed.`));
    }
    catch (error) {
        console.error(chalk.red(`${logPrefix}     ERROR: MCP validation failed: ${error.message || error}`));
        throw error;
    }
}
/**
 * Main function to validate generated artifacts.
 */
async function validateGeneratedArtifacts() {
    console.log(chalk.blue(`${logPrefix} Starting...`));
    // Determine workspace root and artifact directory
    const scriptPath = fileURLToPath(import.meta.url);
    // Go up 3 levels from out/cli/archiverse-generation-validation to reach project root
    const workspaceRoot = path.resolve(path.join(path.dirname(scriptPath), '../../../'));
    const outputDir = path.join(workspaceRoot, 'src/language/generated-archiverse');
    console.log(chalk.blue(`${logPrefix} Validating artifacts in: ${outputDir}`));
    let hasErrors = false;
    const artifactPaths = {
        openApi: path.join(outputDir, 'openapi.json'),
        odata: path.join(outputDir, 'odata-metadata.xml'),
        graphql: path.join(outputDir, 'schema.graphql'),
        graphSchema: path.join(outputDir, 'graph-schema.groovy'),
        mcp: path.join(outputDir, 'mcp-definitions.txt'),
    };
    const validationPromises = [];
    if (fs.existsSync(artifactPaths.openApi)) {
        console.log(chalk.blue(`${logPrefix}   Validating OpenAPI spec: ${artifactPaths.openApi}...`));
        validationPromises.push(validateOpenApi(artifactPaths.openApi)
            .then(() => console.log(chalk.green(`${logPrefix}     SUCCESS: OpenAPI validation passed.`)))
            .catch((err) => {
            console.error(chalk.red(`${logPrefix}     ERROR: OpenAPI validation failed: ${err.message || err}`));
            hasErrors = true;
        }));
    }
    else {
        console.warn(chalk.yellow(`${logPrefix}     WARN: Skipping OpenAPI validation: File not found.`));
    }
    if (fs.existsSync(artifactPaths.odata)) {
        console.log(chalk.blue(`${logPrefix}   Validating OData metadata: ${artifactPaths.odata}...`));
        validationPromises.push(validateODataMetadata(artifactPaths.odata)
            .then(() => console.log(chalk.green(`${logPrefix}     SUCCESS: OData validation passed.`)))
            .catch((err) => {
            console.error(chalk.red(`${logPrefix}     ERROR: OData validation failed: ${err.message || err}`));
            hasErrors = true;
        }));
    }
    else {
        console.warn(chalk.yellow(`${logPrefix}     WARN: Skipping OData validation: File not found.`));
    }
    if (fs.existsSync(artifactPaths.graphql)) {
        validationPromises.push(validateGraphQL(artifactPaths.graphql));
    }
    else {
        console.warn(chalk.yellow(`${logPrefix}     WARN: Skipping GraphQL validation: File not found.`));
    }
    if (fs.existsSync(artifactPaths.graphSchema)) {
        validationPromises.push(validateGraphSchema(artifactPaths.graphSchema));
    }
    else {
        console.warn(chalk.yellow(`${logPrefix}     WARN: Skipping Graph Schema validation: File not found.`));
    }
    if (fs.existsSync(artifactPaths.mcp)) {
        validationPromises.push(validateMcpDefinitions(artifactPaths.mcp));
    }
    else {
        console.warn(chalk.yellow(`${logPrefix}     WARN: Skipping MCP validation: File not found.`));
    }
    // Wait for all validations to complete
    await Promise.all(validationPromises);
    if (hasErrors) {
        console.error(chalk.red(`\n${logPrefix} ERROR: Artifact validation failed.`));
        process.exit(1);
    }
    else {
        console.log(chalk.green(`\n${logPrefix} SUCCESS: Artifact validation completed.`));
        process.exit(0);
    }
}
// Execute if run directly
const scriptFilePath = fileURLToPath(import.meta.url);
const entryFilePath = path.resolve(process.argv[1]);
if (scriptFilePath === entryFilePath) {
    validateGeneratedArtifacts();
}
//# sourceMappingURL=index.js.map