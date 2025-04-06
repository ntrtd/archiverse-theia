import {
    createDefaultModule, createDefaultSharedModule, DefaultSharedModuleContext, inject,
    LangiumServices, LangiumSharedServices, Module, PartialLangiumServices, PartialLangiumSharedServices
} from 'langium';
import { ArchimateGeneratedModule, ArchimateGeneratedSharedModule } from './generated/module.js'; // Assume generated modules exist
import { GraphDbPersistence } from './graph-db-persistence.js';
import { ArchimateModelService } from './archimate-model-service.js';
// Placeholder for potential DocumentBuilder override
// import { GraphAwareDocumentBuilder } from './graph-aware-document-builder.js';

// --- Shared Services ---

/**
 * Declaration of custom shared services. These are accessible across all languages
 * managed by this language server instance (if multiple languages were supported).
 */
export type ArchimateAddedSharedServices = {
    /** Custom persistence layer using GraphDB */
    persistence: {
        GraphDbPersistence: GraphDbPersistence
    },
    /** RPC Facade Service */
    rpc: {
        ArchimateModelService: ArchimateModelService
    }
    // TODO: Potentially override shared services like DocumentBuilder if GraphDbPersistence affects it globally
    // workspace?: {
    //    DocumentBuilder?: GraphAwareDocumentBuilder;
    // }
}

export type ArchimateSharedServices = LangiumSharedServices & ArchimateAddedSharedServices;

/**
 * Shared services module definition. Binds implementations for shared services.
 */
export const ArchimateSharedModule: Module<ArchimateSharedServices, PartialLangiumSharedServices & ArchimateAddedSharedServices> = {
        persistence: {
            // Instantiate directly. The 'services' parameter isn't needed here as GraphDbPersistence currently has no constructor dependencies.
            GraphDbPersistence: () => new GraphDbPersistence()
        },
        rpc: {
            // Instantiate the facade, injecting the shared services container ('services').
            // The ArchimateModelService constructor will pull required services from it (like GraphDbPersistence).
            // Add type annotation to 'services' parameter.
            ArchimateModelService: (services: ArchimateSharedServices) => new ArchimateModelService(services.persistence.GraphDbPersistence /*, other injected services */)
        },
        // workspace: { // Example override
    //    DocumentBuilder: (services) => new GraphAwareDocumentBuilder(services)
    // }
};

// --- Language-Specific Services ---

/**
 * Declaration of custom language-specific services for Archimate.
 */
export type ArchimateAddedServices = {
    // Add specific services here if needed, e.g.:
    // validation: {
    //    ArchimateValidator: ArchimateValidator;
    // }
}

export type ArchimateServices = LangiumServices & ArchimateAddedServices;

/**
 * Language-specific services module definition.
 */
export function createArchimateModule(context: { shared: ArchimateSharedServices }): Module<ArchimateServices, PartialLangiumServices & ArchimateAddedServices> {
    return {
        // Add language-specific service bindings here
        // e.g., validation: { ArchimateValidator: () => new ArchimateValidator() }
        shared: () => context.shared // Reference shared services
    };
}

// --- Service Creation ---

/**
 * Creates the full set of services for the Archimate language server environment.
 */
export function createArchimateServices(context: DefaultSharedModuleContext): {
    shared: ArchimateSharedServices;
    Archimate: ArchimateServices;
} {
    const shared = inject(
        createDefaultSharedModule(context), // Start with Langium defaults
        ArchimateGeneratedSharedModule,     // Add generated shared services
        ArchimateSharedModule               // Add our custom shared services
    );
    const Archimate = inject(
        createDefaultModule({ shared }),    // Start with Langium defaults
        ArchimateGeneratedModule,           // Add generated language services
        createArchimateModule({ shared })   // Add our custom language services
    );
    // TODO: Register language if using Langium's ServiceRegistry pattern
    // shared.ServiceRegistry.register(Archimate);
    // TODO: Register validation checks if needed
    // registerValidationChecks(Archimate);
    return { shared, Archimate };
}
