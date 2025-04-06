/**
 * Renders Graph Schema documentation/config snippets from the Intermediate Representation.
 * @param ir The Intermediate Representation.
 * @param logPrefix The prefix string for logging messages (unused in placeholder).
 */
export function renderGraphSchema(ir, logPrefix) {
    let output = `// Generated Archiverse Graph Schema for JanusGraph\n`;
    output += `// This file can be executed in the Gremlin console to create the schema\n\n`;
    output += `mgmt = graph.openManagement()\n\n`;
    // Property Keys
    const propertyKeys = new Set();
    for (const el of ir.elements) {
        for (const prop of el.properties) {
            if (!propertyKeys.has(prop.name)) {
                output += `if (!mgmt.containsPropertyKey('${prop.name}')) {\n`;
                output += `  mgmt.makePropertyKey('${prop.name}').dataType(String.class).cardinality(Cardinality.SINGLE).make()\n`;
                output += `}\n`;
                propertyKeys.add(prop.name);
            }
        }
    }
    for (const rel of ir.relations) {
        for (const prop of rel.properties) {
            if (!propertyKeys.has(prop.name)) {
                output += `if (!mgmt.containsPropertyKey('${prop.name}')) {\n`;
                output += `  mgmt.makePropertyKey('${prop.name}').dataType(String.class).cardinality(Cardinality.SINGLE).make()\n`;
                output += `}\n`;
                propertyKeys.add(prop.name);
            }
        }
    }
    output += `\n`;
    // Vertex Labels
    const vertexLabels = new Set();
    for (const el of ir.elements) {
        if (!vertexLabels.has(el.label)) {
            output += `if (!mgmt.containsVertexLabel('${el.label}')) {\n`;
            output += `  mgmt.makeVertexLabel('${el.label}').make()\n`;
            output += `}\n`;
            vertexLabels.add(el.label);
        }
    }
    output += `\n`;
    // Edge Labels
    const edgeLabels = new Set();
    for (const rel of ir.relations) {
        if (!edgeLabels.has(rel.type)) {
            output += `if (!mgmt.containsEdgeLabel('${rel.type}')) {\n`;
            output += `  mgmt.makeEdgeLabel('${rel.type}').multiplicity(Multiplicity.MULTI).make()\n`;
            output += `}\n`;
            edgeLabels.add(rel.type);
        }
    }
    output += `\nmgmt.commit()\n`;
    return output;
}
//# sourceMappingURL=index.js.map