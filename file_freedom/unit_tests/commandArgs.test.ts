import { commandArgs } from '../src/utils';

test('parse normal command line', () => {
    expect(commandArgs(
        "a b c",
    ))
    .toEqual([
        "a", "b", "c"
    ]);
});

test('parse normal command line w/ single quotes', () => {
    expect(commandArgs(
        `a 'b c'`,
    ))
    .toEqual([
        "a", `'b c'`
    ]);
});

test('parse normal command line w/ double quotes', () => {
    expect(commandArgs(
        `a "b c"`,
    ))
    .toEqual([
        "a", `"b c"`
    ]);
});

test('parse normal command line w/ curly brackets', () => {
    expect(commandArgs(
        `a {b c}`,
    ))
    .toEqual([
        "a", `{b c}`
    ]);
});

test('parse normal command line w/ square brackets', () => {
    expect(commandArgs(
        `a [b c]`,
    ))
    .toEqual([
        "a", `[b c]`
    ]);
});