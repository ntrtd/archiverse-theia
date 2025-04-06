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
    const doParse = parseHelper(services.Archiverse);
    parse = (input) => doParse(input, { validation: true });
    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});
describe('Validating', () => {
    test('check no errors', async () => {
        var _a, _b;
        document = await parse(`
            person Langium
        `);
        expect(
        // here we first check for validity of the parsed document object by means of the reusable function
        //  'checkDocumentValid()' to sort out (critical) typos first,
        // and then evaluate the diagnostics by converting them into human readable strings;
        // note that 'toHaveLength()' works for arrays and strings alike ;-)
        checkDocumentValid(document) || ((_b = (_a = document === null || document === void 0 ? void 0 : document.diagnostics) === null || _a === void 0 ? void 0 : _a.map(diagnosticToString)) === null || _b === void 0 ? void 0 : _b.join('\n'))).toHaveLength(0);
    });
    test('check capital letter validation', async () => {
        var _a, _b;
        document = await parse(`
            person langium
        `);
        expect(checkDocumentValid(document) || ((_b = (_a = document === null || document === void 0 ? void 0 : document.diagnostics) === null || _a === void 0 ? void 0 : _a.map(diagnosticToString)) === null || _b === void 0 ? void 0 : _b.join('\n'))).toEqual(
        // 'expect.stringContaining()' makes our test robust against future additions of further validation rules
        expect.stringContaining(s `
                [1:19..1:26]: Person name should start with a capital.
            `));
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
function diagnosticToString(d) {
    return `[${d.range.start.line}:${d.range.start.character}..${d.range.end.line}:${d.range.end.character}]: ${d.message}`;
}
//# sourceMappingURL=validating.test.js.map