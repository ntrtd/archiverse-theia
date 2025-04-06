/**
 * Defines the Intermediate Representation (IR) for the Archiverse schema,
 * derived from validated AGAS annotations on Langium grammars.
 */
export interface SchemaProperty {
    name: string;
    type: string;
    baseType: string;
    isArray: boolean;
    isOptional: boolean;
    description?: string;
    flags: Set<string>;
}
export interface SchemaEndpoint {
    role: 'source' | 'target';
    elementTypeLabel: string;
    navigationName: string;
    cardinality: 'one' | 'zero-one' | 'many' | 'zero-many';
}
export interface SchemaElement {
    kind: 'element';
    label: string;
    description?: string;
    properties: SchemaProperty[];
}
export interface SchemaRelation {
    kind: 'relation';
    type: string;
    description?: string;
    properties: SchemaProperty[];
    endpoints: [SchemaEndpoint, SchemaEndpoint];
}
export type SchemaItem = SchemaElement | SchemaRelation;
/**
 * The root of the Intermediate Representation.
 */
export interface IntermediateRepresentation {
    elements: SchemaElement[];
    relations: SchemaRelation[];
}
//# sourceMappingURL=ir-types.d.ts.map