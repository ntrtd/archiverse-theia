/**
 * ArchiMate Grammar - Main Integration File
 * Imports all layer-specific modules and defines the top-level structure
 * and the main element/relationship union types.
 */
grammar Archimate // Grammar name reflects the new version/structure

// Import Base Grammar
import './common/base-grammar';

// Import Layer/Aspect Modules
import './archimate/business';
import './archimate/application';
import './archimate/technology'; // Includes Physical
import './archimate/motivation';
import './archimate/strategy';
import './archimate/implementation';
import './archimate/viewpoint'; // Added import for Viewpoint module

// Import Relationships Module (needs ArchimateElement defined below)
import './archimate/relationships';

// --- Top-Level Model Structure ---

/* @element(label="ArchimateModelContainer", description="The root container for an ArchiMate model, holding a collection of elements and relationships defined according to the ArchiMate 3.2 specification. This serves as the entry point for parsing and represents the overall scope of the architecture model being described.") */
entry ArchimateModel:
    (elements+=ArchimateElement | relationships+=ArchimateRelationship)*; // Allow models with only relationships or only elements, but require at least one concept.

// --- Main Element Union Type ---

/**
 * Defines the comprehensive union of all concrete ArchiMate elements across all layers and aspects.
 * This type is crucial for enabling cross-references between any valid ArchiMate elements
 * and serves as the primary type for collections within the ArchimateModel.
 * @element(label="ArchimateElementUnion", description="A comprehensive union type that includes every concrete element defined across all ArchiMate layers (Business, Application, Technology, Physical, Strategy, Motivation, Implementation & Migration) and aspects. This allows for generic referencing and collection management within the model.")
 */
ArchimateElement:
    // Business Layer Elements (from business.langium)
    Archimate_Business_Actor | Archimate_Business_Role | Archimate_Business_Collaboration | Archimate_Business_Interface |
    Archimate_Business_Process | Archimate_Business_Function | Archimate_Business_Interaction | Archimate_Business_Service | Archimate_Business_Event |
    Archimate_Business_Object | Archimate_Contract | Archimate_Representation | Archimate_Product |

    // Application Layer Elements (from application.langium)
    Archimate_Application_Component | Archimate_Application_Collaboration | Archimate_Application_Interface |
    Archimate_Application_Function | Archimate_Application_Interaction | Archimate_Application_Process | Archimate_Application_Event |
    Archimate_Application_Service | Archimate_Data_Object |

    // Technology Layer Elements (including Physical) (from technology.langium)
    Archimate_Node | Archimate_Device | Archimate_SystemSoftware | Archimate_Technology_Collaboration | Archimate_Technology_Interface |
    Archimate_Path | Archimate_CommunicationNetwork |
    Archimate_Technology_Function | Archimate_Technology_Process | Archimate_Technology_Interaction | Archimate_Technology_Event |
    Archimate_Technology_Service | Archimate_Artifact |
    Archimate_Equipment | Archimate_Facility | Archimate_DistributionNetwork | Archimate_Material |

    // Motivation Elements (from motivation.langium)
    Archimate_Stakeholder | Archimate_Driver | Archimate_Assessment | Archimate_Goal | Archimate_Outcome |
    Archimate_Principle | Archimate_Requirement | Archimate_Constraint | Archimate_Meaning | Archimate_Value |

    // Strategy Elements (from strategy.langium)
    Archimate_Resource | Archimate_Capability | Archimate_ValueStream | Archimate_CourseOfAction |

    // Implementation & Migration Elements (from implementation.langium)
    Archimate_WorkPackage | Archimate_Deliverable | Archimate_ImplementationEvent | Archimate_Plateau | Archimate_Gap |

    // Viewpoints (from archimate.langium - added in previous step)
    Archimate_Viewpoint;

    // Note: Generic elements like Grouping and Location would typically be defined
    // in the base-grammar or a common module if needed across multiple languages.
    // If they are ArchiMate-specific composites, they could be added here or in a separate 'composite.langium'.
    // For now, assuming they might be in base-grammar or not explicitly modeled at this level.
