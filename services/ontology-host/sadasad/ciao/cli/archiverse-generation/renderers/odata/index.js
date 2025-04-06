import pluralize from 'pluralize';
/**
 * Renders OData v4 CSDL XML ($metadata) from the Intermediate Representation.
 * @param ir The Intermediate Representation.
 * @param logPrefix The prefix string for logging messages.
 */
export function renderODataMetadata(ir, logPrefix) {
    console.log(`${logPrefix} Rendering OData Metadata with ${ir.elements.length} entities...`);
    // TODO: Implement OData CSDL XML rendering logic using the IR
    // Use XML builder library or string templating
    // 1. Generate EntityType elements
    const entityTypeXml = ir.elements.map(el => {
        const propertiesXml = el.properties.map(prop => {
            return `          <Property Name="${prop.name}" Type="Edm.${mapType(prop.baseType, prop.isArray, prop.isOptional)}" Nullable="${!prop.isOptional}">
            ${prop.description ? `<Annotation Term="Org.OData.Core.V1.Description" String="${prop.description}" />` : ''}
          </Property>`;
        }).join('\n');
        return `      <EntityType Name="${el.label}">
        <Key>
          <PropertyRef Name="ID" />
        </Key>
${propertiesXml}
      </EntityType>`;
    }).join('\n\n');
    // 2. Generate EntitySet elements
    const entitySetXml = ir.elements.map(el => `        <EntitySet Name="${pluralize(el.label)}" EntityType="ArchiverseModel.${el.label}" />`).join('\n'); // Pluralize entity set names
    // 3. Generate Singleton elements (using relations as a placeholder)
    const singletonXml = ir.relations.map(rel => `        <Singleton Name="${rel.type}" Type="ArchiverseModel.${rel.type}" />`).join('\n');
    // 4. Construct the complete XML document string
    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">
  <edmx:DataServices>
    <Schema Namespace="ArchiverseModel" xmlns="http://docs.oasis-open.org/odata/ns/edm">
      ${entityTypeXml}

      <EntityContainer Name="DefaultContainer">
${entitySetXml}
${singletonXml}
      </EntityContainer>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>`;
    console.log(`${logPrefix} Successfully rendered OData Metadata with ${ir.elements.length} entities.`);
    return xmlContent;
}
function mapType(type, isArray, isOptional) {
    let odataType;
    switch (type) {
        case 'string':
            odataType = 'String';
            break;
        case 'number':
            odataType = 'Int32';
            break;
        case 'boolean':
            odataType = 'Boolean';
            break;
        case 'date':
            odataType = 'Date';
            break;
        case 'datetime':
            odataType = 'DateTimeOffset';
            break;
        case 'uri':
            odataType = 'String';
            break;
        default: odataType = 'String'; // Default to string for unknown types
    }
    if (isArray) {
        odataType = `Collection(${odataType})`;
    }
    return odataType;
}
//# sourceMappingURL=index.js.map