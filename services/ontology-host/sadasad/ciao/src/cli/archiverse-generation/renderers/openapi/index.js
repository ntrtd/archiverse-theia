/**
 * Renders OpenAPI v3.x specification from the Intermediate Representation.
 * @param ir The Intermediate Representation.
 * @param logPrefix The prefix string for logging messages.
 */
export function renderOpenApi(ir, logPrefix) {
    // The main generation script already logs the start message.
    // console.log(`${logPrefix} Rendering OpenAPI specification...`);
    const schemas = {};
    const paths = {};
    // 1. Generate Schemas from Elements and Relations
    for (const element of ir.elements) {
        schemas[element.label] = generateSchemaForElement(element);
        schemas[`${element.label}Input`] = generateSchemaForElement(element, true); // Input schema
    }
    for (const relation of ir.relations) {
        // Use relation.type as the base name, assuming it's unique and descriptive
        const relationLabel = relation.type; // e.g., PLAN_OWNERSHIP
        schemas[relationLabel] = generateSchemaForRelation(relation);
        schemas[`${relationLabel}Input`] = generateSchemaForRelation(relation, true); // Input schema
    }
    // 2. Generate CRUD Paths for Elements and Relations
    for (const element of ir.elements) {
        const pluralLabel = `${element.label}s`; // Simple pluralization // TODO: Improve pluralization
        const pathCollection = `/${pluralLabel.toLowerCase()}`;
        const pathIndividual = `${pathCollection}/{${getKeyPropertyName(element)}}`; // Use actual key property name
        paths[pathCollection] = generateElementCollectionPathItem(element);
        paths[pathIndividual] = generateElementIndividualPathItem(element);
    }
    for (const relation of ir.relations) {
        const relationLabel = relation.type; // e.g., PLAN_OWNERSHIP
        const pathCollection = `/${relationLabel.toLowerCase()}s`; // e.g., /planownerships
        const pathIndividual = `${pathCollection}/{relationId}`; // Assuming relations get an ID
        paths[pathCollection] = generateRelationCollectionPathItem(relation);
        paths[pathIndividual] = generateRelationIndividualPathItem(relation); // Pass relationId parameter name
    }
    const openApiDoc = {
        openapi: '3.0.3', // Use a specific version
        info: {
            title: 'Archiverse API (Generated)',
            version: '1.0.0',
            description: 'API generated from Archiverse model definitions.',
        },
        paths: paths,
        components: {
            schemas: schemas,
            // TODO: Add securitySchemes if needed
        },
        // TODO: Add servers if applicable
    };
    // The main generation script logs the success message.
    // console.log(`${logPrefix} OpenAPI rendering complete. Generated ${Object.keys(schemas).length} schemas and ${Object.keys(paths).length} paths.`);
    return JSON.stringify(openApiDoc, null, 2);
}
// --- Helper Functions ---
function generateSchemaForElement(element, isInput = false) {
    const properties = {};
    const required = [];
    for (const prop of element.properties) {
        // Skip key properties for input schemas if they are typically generated
        const isKey = prop.flags.has('key');
        if (isInput && isKey) { // Example: Don't require ID on input
            continue;
        }
        const mapped = mapPropertyToOpenApiSchema(prop);
        properties[prop.name] = mapped.schema;
        if (mapped.required && !isInput) { // Only enforce required on output/full schema for now
            required.push(prop.name);
        }
        // Description is now handled within mapPropertyToOpenApiSchema
    }
    const schema = {
        type: 'object',
        properties: properties,
        additionalProperties: false, // Explicitly disallow additional properties
        description: element.description || `Schema for ${element.label}`,
    };
    // Apply required only for non-input schemas
    if (required.length > 0 && !isInput) {
        schema.required = required;
    }
    return schema;
}
/** Generates OpenAPI Schema for a Relation */
function generateSchemaForRelation(relation, isInput = false) {
    const properties = {};
    const required = [];
    // Add properties for source and target element references (usually their IDs)
    // Assuming relation properties defined in grammar capture these refs, e.g., 'planRef', 'ownerRef'
    // Also add any explicit properties defined on the relation itself.
    for (const prop of relation.properties) {
        // Relations might need an implicit ID if they are managed resources
        const isImplicitId = prop.name === 'relationId'; // Example implicit ID name
        if (isInput && isImplicitId) {
            continue; // Don't require implicit ID on input
        }
        const mapped = mapPropertyToOpenApiSchema(prop); // Use the same mapping logic
        properties[prop.name] = mapped.schema;
        if (mapped.required && !isInput) {
            required.push(prop.name);
        }
    }
    // Add implicit 'relationId' if managing relations as resources (optional)
    if (!isInput && !properties['relationId']) {
        properties['relationId'] = { type: 'string', format: 'uuid', readOnly: true, description: 'Unique identifier for the relationship instance.' };
    }
    const schema = {
        type: 'object',
        properties: properties,
        additionalProperties: false,
        description: relation.description || `Schema for ${relation.type} relation`,
    };
    if (required.length > 0 && !isInput) {
        schema.required = required;
    }
    return schema;
}
function mapPropertyToOpenApiSchema(prop) {
    let fullType = prop.type;
    const isOptional = fullType.endsWith('?');
    if (isOptional) {
        fullType = fullType.slice(0, -1);
    }
    const isArray = fullType.endsWith('[]');
    const baseAgasType = isArray ? fullType.slice(0, -2) : fullType;
    // Required flag is determined solely by optional '?' marker for now, unless it's a key
    const required = !isOptional || prop.flags.has('key');
    let baseSchemaDefinition; // Schema definition for the base type (before array/nullability)
    let isRef = false;
    // Determine the base schema definition
    const enumMatch = baseAgasType.match(/^enum\(([^)]+)\)$/i);
    if (enumMatch) {
        const enumValues = enumMatch[1].split('|').map(v => v.trim()).filter(v => v); // Ensure no empty strings
        baseSchemaDefinition = { type: 'string', enum: enumValues };
    }
    else {
        switch (baseAgasType.toLowerCase()) {
            case 'string':
                baseSchemaDefinition = { type: 'string' };
                break;
            case 'number':
                baseSchemaDefinition = { type: 'number', format: 'double' };
                break;
            case 'integer':
                baseSchemaDefinition = { type: 'integer', format: 'int64' };
                break;
            case 'boolean':
                baseSchemaDefinition = { type: 'boolean' };
                break;
            case 'date':
                baseSchemaDefinition = { type: 'string', format: 'date' };
                break;
            case 'datetime':
                baseSchemaDefinition = { type: 'string', format: 'date-time' };
                break;
            case 'uri':
                baseSchemaDefinition = { type: 'string', format: 'uri' };
                break;
            default:
                // Assume it's a reference to another schema if capitalized
                if (/^[A-Z]/.test(baseAgasType)) {
                    // IMPORTANT: The base definition for a ref is JUST the $ref object
                    baseSchemaDefinition = { $ref: `#/components/schemas/${baseAgasType}` };
                    isRef = true;
                }
                else {
                    // Use logPrefix here if we decide to keep this warning
                    // console.warn(`${logPrefix} WARN: OpenAPI: Unhandled AGAS base type '${baseAgasType}' for property '${prop.name}'. Defaulting to string.`);
                    baseSchemaDefinition = { type: 'string' }; // Fallback for unknown types
                }
                break;
        }
    }
    // Construct the final schema object, applying wrappers for array/optionality
    let finalSchema;
    if (isArray) {
        // Base is an array
        finalSchema = {
            type: 'array',
            items: baseSchemaDefinition // Items are the base definition ($ref or primitive/enum)
        };
        if (isOptional) {
            // If the array itself is optional (nullable)
            finalSchema.nullable = true;
        }
    }
    else {
        // Not an array
        if (isRef) {
            // Handle References
            if (isOptional || prop.description) {
                // Wrap with allOf if optional OR if required but has description
                finalSchema = { allOf: [baseSchemaDefinition] };
                if (isOptional) {
                    finalSchema.nullable = true;
                }
                if (prop.description) {
                    finalSchema.description = prop.description;
                }
            }
            else {
                // Required ref without description - use pure $ref
                finalSchema = baseSchemaDefinition;
            }
        }
        else {
            // Handle Primitives/Enums
            finalSchema = Object.assign({}, baseSchemaDefinition); // Create a copy
            if (isOptional) {
                finalSchema.nullable = true;
            }
            if (prop.description) {
                finalSchema.description = prop.description;
            }
        }
    }
    // Note: Description is now handled within the wrapping logic above
    return { schema: finalSchema, required };
}
function getKeyPropertyName(element) {
    // Find the property marked with the 'key' flag
    const keyProp = element.properties.find(p => p.flags.has('key'));
    return keyProp ? keyProp.name : 'id'; // Default to 'id' if no key flag found for elements
}
// Renamed function
function generateElementCollectionPathItem(element) {
    const elementLabel = element.label;
    const elementInputLabel = `${elementLabel}Input`;
    return {
        get: {
            summary: `List all ${elementLabel} resources`,
            operationId: `list${elementLabel}s`,
            tags: [elementLabel],
            responses: {
                '200': {
                    description: `A list of ${elementLabel} resources`,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { $ref: `#/components/schemas/${elementLabel}` }
                            }
                        }
                    }
                }
                // TODO: Add error responses (4xx, 5xx)
            }
        },
        post: {
            summary: `Create a new ${elementLabel}`,
            operationId: `create${elementLabel}`,
            tags: [elementLabel],
            requestBody: {
                description: `New ${elementLabel} object`,
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: `#/components/schemas/${elementInputLabel}` }
                    }
                }
            },
            responses: {
                '201': {
                    description: `Successfully created ${elementLabel}`,
                    content: {
                        'application/json': {
                            schema: { $ref: `#/components/schemas/${elementLabel}` }
                        }
                    }
                }
                // TODO: Add error responses (400, 5xx)
            }
        }
    };
}
// Renamed function
function generateElementIndividualPathItem(element) {
    const keyPropName = getKeyPropertyName(element);
    const keyProp = element.properties.find(p => p.name === keyPropName);
    // Default key schema if not found or mapped
    let keySchema = { type: 'string' };
    if (keyProp) {
        const mapped = mapPropertyToOpenApiSchema(keyProp);
        // If the key maps to a complex object (e.g., oneOf for nullable ref), use string as fallback for path param
        keySchema = mapped.schema.type === 'string' || mapped.schema.type === 'integer' || mapped.schema.type === 'number'
            ? mapped.schema
            : { type: 'string', description: `Identifier for ${keyPropName}` };
    }
    const elementLabel = element.label;
    const elementInputLabel = `${elementLabel}Input`;
    const pathParameter = {
        name: keyPropName,
        in: 'path',
        required: true,
        description: `The unique identifier for the ${elementLabel}`,
        schema: keySchema // Use the determined key schema
    };
    return {
        get: {
            summary: `Get a specific ${elementLabel} by its ID`,
            operationId: `get${elementLabel}ById`,
            tags: [elementLabel],
            parameters: [pathParameter],
            responses: {
                '200': {
                    description: `The requested ${elementLabel}`,
                    content: {
                        'application/json': {
                            schema: { $ref: `#/components/schemas/${elementLabel}` }
                        }
                    }
                },
                '404': { description: `${elementLabel} not found` }
                // TODO: Add other error responses
            }
        },
        put: {
            summary: `Update an existing ${elementLabel}`,
            operationId: `update${elementLabel}`,
            tags: [elementLabel],
            parameters: [pathParameter],
            requestBody: {
                description: `Updated ${elementLabel} object`,
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: `#/components/schemas/${elementInputLabel}` }
                    }
                }
            },
            responses: {
                '200': {
                    description: `Successfully updated ${elementLabel}`,
                    content: {
                        'application/json': {
                            schema: { $ref: `#/components/schemas/${elementLabel}` }
                        }
                    }
                },
                '404': { description: `${elementLabel} not found` }
                // TODO: Add other error responses (400)
            }
        },
        delete: {
            summary: `Delete a specific ${elementLabel}`,
            operationId: `delete${elementLabel}`,
            tags: [elementLabel],
            parameters: [pathParameter],
            responses: {
                '204': { description: `Successfully deleted ${elementLabel}` },
                '404': { description: `${elementLabel} not found` }
                // TODO: Add other error responses (400) // Kept this version's TODO
            }
        }
        // Removed duplicate delete block
    };
}
// --- New Helper Functions for Relations ---
function generateRelationCollectionPathItem(relation) {
    const relationLabel = relation.type; // e.g., PLAN_OWNERSHIP
    const relationInputLabel = `${relationLabel}Input`;
    const relationPlural = `${relationLabel.toLowerCase()}s`; // e.g., planownerships
    return {
        get: {
            summary: `List all ${relationLabel} relationships`,
            operationId: `list${relationPlural}`,
            tags: [relationLabel], // Tag by relation type
            responses: {
                '200': {
                    description: `A list of ${relationLabel} relationships`,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { $ref: `#/components/schemas/${relationLabel}` }
                            }
                        }
                    }
                }
                // TODO: Add error responses
            }
        },
        post: {
            summary: `Create a new ${relationLabel} relationship`,
            operationId: `create${relationLabel}`,
            tags: [relationLabel],
            requestBody: {
                description: `New ${relationLabel} object`,
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: `#/components/schemas/${relationInputLabel}` }
                    }
                }
            },
            responses: {
                '201': {
                    description: `Successfully created ${relationLabel} relationship`,
                    content: {
                        'application/json': {
                            schema: { $ref: `#/components/schemas/${relationLabel}` }
                        }
                    }
                }
                // TODO: Add error responses
            }
        }
    };
}
function generateRelationIndividualPathItem(relation) {
    const relationLabel = relation.type;
    const relationIdParamName = 'relationId'; // Consistent parameter name for relation IDs
    const pathParameter = {
        name: relationIdParamName,
        in: 'path',
        required: true,
        description: `The unique identifier for the ${relationLabel} relationship`,
        schema: { type: 'string', format: 'uuid', description: 'Implicit relationship instance ID' } // Assuming UUID for relation IDs
    };
    return {
        get: {
            summary: `Get a specific ${relationLabel} relationship by its ID`,
            operationId: `get${relationLabel}ById`,
            tags: [relationLabel],
            parameters: [pathParameter],
            responses: {
                '200': {
                    description: `The requested ${relationLabel} relationship`,
                    content: {
                        'application/json': {
                            schema: { $ref: `#/components/schemas/${relationLabel}` }
                        }
                    }
                },
                '404': { description: `${relationLabel} relationship not found` }
                // TODO: Add other error responses
            }
        },
        // PUT might not make sense for relations unless they have mutable properties.
        // Often relations are created/deleted.
        delete: {
            summary: `Delete a specific ${relationLabel} relationship`,
            operationId: `delete${relationLabel}`,
            tags: [relationLabel],
            parameters: [pathParameter],
            responses: {
                '204': { description: `Successfully deleted ${relationLabel} relationship` },
                '404': { description: `${relationLabel} relationship not found` }
                // TODO: Add other error responses
            }
        }
        // Consider PATCH if relation properties are updatable
    };
}
//# sourceMappingURL=index.js.map