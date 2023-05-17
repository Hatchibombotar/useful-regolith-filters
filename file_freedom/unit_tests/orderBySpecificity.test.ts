import { orderBySpecificity } from '../src/utils';

test('order file paths by specificity', () => {
    expect(orderBySpecificity([
        "a/b/c/d",
        "a/b/c/d/e",
        "a",
        "a/b/c",
        "a/b"
    ]))
    .toEqual([
        "a",
        "a/b",
        "a/b/c",
        "a/b/c/d",
        "a/b/c/d/e",
    ]);
});