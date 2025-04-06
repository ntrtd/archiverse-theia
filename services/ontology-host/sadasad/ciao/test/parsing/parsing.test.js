import { beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem } from "langium";
import { expandToString as s } from "langium/generate";
import { parseHelper } from "langium/test";
import { createArchiverseServices } from "../../src/language/archiverse-module.js";
import { Model, isModel } from "../../src/language/generated/ast.js";
let services;
let parse;
let document;
beforeAll(async () => {
    services = createArchiverseServices(EmptyFileSystem);
    parse = parseHelper(services.Archiverse);
    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});
describe('Parsing tests', () => {
    test('parse simple model', async () => {
        var _a, _b, _c, _d, _e, _f;
        document = await parse(`
            person Langium
            Hello Langium!
        `);
        // check for absence of parser errors the classic way:
        //  deactivated, find a much more human readable way below!
        // expect(document.parseResult.parserErrors).toHaveLength(0);
        expect(
        // here we use a (tagged) template expression to create a human readable representation
        //  of the AST part we are interested in and that is to be compared to our expectation;
        // prior to the tagged template expression we check for validity of the parsed document object
        //  by means of the reusable function 'checkDocumentValid()' to sort out (critical) typos first;
        checkDocumentValid(document) || s `
                Persons:
                  ${(_c = (_b = (_a = document.parseResult.value) === null || _a === void 0 ? void 0 : _a.persons) === null || _b === void 0 ? void 0 : _b.map(p => p.name)) === null || _c === void 0 ? void 0 : _c.join('\n  ')}
                Greetings to:
                  ${(_f = (_e = (_d = document.parseResult.value) === null || _d === void 0 ? void 0 : _d.greetings) === null || _e === void 0 ? void 0 : _e.map(g => g.person.$refText)) === null || _f === void 0 ? void 0 : _f.join('\n  ')}
            `).toBe(s `
            Persons:
              Langium
            Greetings to:
              Langium
        `);
    });
});
function checkDocumentValid(document) {
    return document.parseResult.parserErrors.length && s `
        Parser errors:
          ${document.parseResult.parserErrors.map(e => e.message).join('\n  ')}
    `
        || document.parseResult.value === undefined && `ParseResult is 'undefined'.`
        || !isModel(document.parseResult.value) && `Root AST object is a ${document.parseResult.value.$type}, expected a '${Model}'.`
        || undefined;
}
//# sourceMappingURL=parsing.test.js.map