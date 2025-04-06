/**
 * Common utility functions for rendering different output formats from the IR.
 */
// Removed unused SchemaProperty import
/**
 * Maps an Archiverse Grammar Annotation System (AGAS) type string to the corresponding
 * type representation for a specified target artifact format (e.g., OpenAPI, OData, GraphQL).
 *
 * This function handles:
 * - Basic AGAS primitive types (string, number, integer, boolean, date, datetime, uri, guid, binary).
 * - Optionality indicated by a trailing `?` in the AGAS type.
 * - Assumed references to other schema elements or enums (types starting with an uppercase letter).
 * - Specific type nuances for different target formats (e.g., `Edm.String` for OData, `Int`/`Float` for GraphQL).
 * - GraphQL's non-null indicator (`!`) for types not marked as optional in AGAS.
 *
 * Note: Array types (`[]`) are expected to be handled by the calling renderer, which should
 * call `mapType` on the base type. Renderers are also responsible for format-specific
 * referencing (e.g., OpenAPI `$ref`, OData namespaces) and handling format attributes
 * (e.g., OpenAPI `format: date-time`, OData `Nullable="false"`).
 *
 * @param {string} agasType - The AGAS type string (e.g., "string", "MyElement?", "integer").
 * @param {'openapi' | 'odata' | 'graphql' | 'graph' | 'mcp'} targetFormat - The target artifact format.
 * @returns {string} The mapped type string suitable for the target format.
 */
export function mapType(agasType, targetFormat) {
    /**
     * @codeReview The code uses a lot of `if` statements. It would be better to use a more concise way of mapping the types, such as a lookup table.
     * The code could be more robust. It currently assumes that the AGAS types are well-formed. It would be better to add more validation logic to ensure that the types are valid.
     * Maps AGAS primitive types (and references) to types used in a specific target format.
     * Handles basic primitives and assumes capitalized types are references.
     * Also handles GraphQL nullability syntax based on the AGAS '?' marker.
     */
    const isOptional = agasType.endsWith('?');
    const baseType = isOptional ? agasType.slice(0, -1) : agasType;
    let mappedType;
    // Use lowercase for primitive type matching, but preserve original case for references/enums
    switch (baseType.toLowerCase()) {
        case 'string':
            mappedType = targetFormat === 'odata' ? 'Edm.String' : 'string';
            break;
        case 'number': // Assuming generic number, specific formats might need refinement
            mappedType = targetFormat === 'odata' ? 'Edm.Double'
                : targetFormat === 'graphql' ? 'Float' // Default to Float, use 'integer' AGAS type for Int
                    : 'number'; // OpenAPI uses 'number' (float/double)
            break;
        case 'integer': // Added specific integer type
            mappedType = targetFormat === 'odata' ? 'Edm.Int64' // Default to 64-bit integer
                : targetFormat === 'graphql' ? 'Int'
                    : 'integer'; // OpenAPI uses 'integer'
            break;
        case 'boolean':
            mappedType = targetFormat === 'odata' ? 'Edm.Boolean' : 'boolean';
            break;
        case 'date':
            mappedType = targetFormat === 'openapi' ? 'string' // format: date handled by renderer
                : targetFormat === 'odata' ? 'Edm.Date'
                    : targetFormat === 'graphql' ? 'Date' // Needs custom scalar definition
                        : 'date'; // Graph/MCP default
            break;
        case 'datetime':
            mappedType = targetFormat === 'openapi' ? 'string' // format: date-time handled by renderer
                : targetFormat === 'odata' ? 'Edm.DateTimeOffset'
                    : targetFormat === 'graphql' ? 'DateTime' // Needs custom scalar definition
                        : 'datetime'; // Graph/MCP default
            break;
        case 'uri':
            mappedType = targetFormat === 'openapi' ? 'string' // format: uri handled by renderer
                : targetFormat === 'odata' ? 'Edm.String' // OData doesn't have a specific URI type
                    : targetFormat === 'graphql' ? 'URI' // Needs custom scalar definition
                        : 'string'; // Graph/MCP default
            break;
        case 'guid':
            mappedType = targetFormat === 'openapi' ? 'string' // format: uuid handled by renderer
                : targetFormat === 'odata' ? 'Edm.Guid'
                    : targetFormat === 'graphql' ? 'ID'
                        : 'string'; // Graph/MCP default
            break;
        case 'binary':
            mappedType = targetFormat === 'openapi' ? 'string' // format: byte handled by renderer
                : targetFormat === 'odata' ? 'Edm.Binary'
                    : targetFormat === 'graphql' ? 'String' // Base64 encoded string
                        : 'string'; // Graph/MCP default
            break;
        // TODO: Add other potential AGAS types if specified in AGAS
        default:
            // Handle Enums or References to other types (assuming they start with Uppercase)
            if (baseType.startsWith('enum(')) { // Inline enum definition (less common)
                console.warn(`Handling inline enum type "${baseType}" as string. Define specific enum types for better mapping.`);
                mappedType = targetFormat === 'odata' ? 'Edm.String' : 'string'; // Fallback to string
            }
            else if (/^[A-Z]/.test(baseType)) { // Assume TypeName refers to another Element or an Enum type
                // OData: Needs namespace prefix (e.g., "Self.MyElementType") - potentially handled by renderer
                // GraphQL: TypeName (Element or Enum)
                // OpenAPI: Reference path (e.g., '#/components/schemas/MyElementType') - handled by renderer
                // For mapType, just return the base type name. Renderers handle specific referencing.
                mappedType = baseType;
            }
            else {
                // Catch potential unhandled lowercase types
                console.warn(`Unmapped AGAS type: ${baseType}. Defaulting to string.`);
                mappedType = 'string'; // Default fallback
            }
            break;
    }
    // Handle nullability based on target format syntax
    if (targetFormat === 'graphql' && !isOptional) {
        // In GraphQL, non-optional types require '!'
        // Assumes all non-optional AGAS types map to non-null GraphQL types.
        return `${mappedType}!`;
    }
    else {
        // OpenAPI: nullability handled by 'nullable: true/false' or presence in 'required' array (handled by renderer).
        // OData: nullability handled by 'Nullable="true/false"' attribute (handled by renderer).
        // Graph/MCP: nullability less explicit in type system.
        return mappedType;
    }
}
/**
 * Placeholder for other common rendering utilities.
 */
//# sourceMappingURL=common.js.map