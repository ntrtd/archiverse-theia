/**
 * Placeholder type definition for the serializable root of an Archimate model.
 * This should be replaced with the actual structure generated or defined
 * based on the language grammar and serialization needs.
 */
export interface ArchimateModelRoot {
    // Example properties - replace with actual structure
    uri: string;
    type: string; // e.g., 'ApplicationComponent', 'BusinessActor'
    name?: string;
    properties?: { [key: string]: any };
    elements?: ArchimateModelRoot[]; // For composite elements
    relationships?: any[]; // Define relationship structure
    // Add other necessary fields based on the model structure
}

// Placeholder for ElementDescriptor used in QueryService
export interface ElementDescriptor {
    uri: string;
    name: string;
    type: string; // Archimate element type
    // Add icon identifier or other display properties if needed
}
