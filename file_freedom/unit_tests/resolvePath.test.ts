import { resolvePath } from '../src/utils';

test('relative files from files using `.`', () => {
    expect(resolvePath("a/b/c.x", "./d.x"))
    .toBe("a/b/d.x");
});

test('relative files from files using `..`', () => {
    expect(resolvePath("a/b/c.x", "../d.x"))
    .toBe("a/d.x");
});

test('relative directory from files using `.`', () => {
  expect(resolvePath("a/b/c.x", "./d"))
  .toBe("a/b/d");
});

test('relative directory from files using `..`', () => {
    expect(resolvePath("a/b/c.x", "../d"))
    .toBe("a/d");
});

test('relative directory from directory using `.`', () => {
    expect(resolvePath("a/b/c", "./d"))
    .toBe("a/b/c/d");
});
  
test('relative directory from directory using `..`', () => {
    expect(resolvePath("a/b/c", "../d"))
    .toBe("a/b/d");
});

test('new path from file', () => {
    expect(resolvePath("a/b/c.x", "x/y/z"))
    .toBe("x/y/z");
});

test('vanilla type texture path', () => {
    expect(resolvePath("textures", "x/y/z"))
    .toBe("x/y/z");
});

test('texture path relative to base', () => {
    expect(resolvePath("textures", "/x/y/z"))
    .toBe("textures/x/y/z");
});

test('texture path for relative in item texture', () => {
    expect(resolvePath("textures/", "/RP/powerups/textures/item_texture.json", "./hello"))
    .toBe("textures/RP/powerups/textures/hello");
});

test('vanilla alias texture ref', () => {
    expect(resolvePath("a/b/c.x", "@vanilla/textures/entity/test"))
    .toBe("textures/entity/test");
});