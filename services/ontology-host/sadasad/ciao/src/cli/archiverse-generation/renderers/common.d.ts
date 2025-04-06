/**
 * Common utility functions for rendering different output formats from the IR.
 */
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
export declare function mapType(agasType: string, targetFormat: 'openapi' | 'odata' | 'graphql' | 'graph' | 'mcp'): string;
/**
 * Placeholder for other common rendering utilities.
 */
//# sourceMappingURL=common.d.ts.map