const lang = require('../src/lang');

test('parse lang file', () => {
    expect(lang.parse(
        "this.thing=Test String       #",
    ))
    .toEqual({
        "this.thing": "Test String       #"
    });
});

test('stringify lang file', () => {
    expect(lang.stringify({
        "this.thing": "Test String       #"
    }))
    .toBe(
        "this.thing=Test String       #"
    );
});