import { parse, stringify } from '../src/lang';

test('parse lang file', () => {
    expect(parse(
        "this.thing=Test String       #",
    ))
    .toEqual({
        "this.thing": "Test String       #"
    });
});

test('stringify lang file', () => {
    expect(stringify({
        "this.thing": "Test String       #"
    }))
    .toBe(
        "this.thing=Test String       #"
    );
});