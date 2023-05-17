import { deepMerge } from '../src/utils';

test('simple merge object properties', () => {
    const obj1 = {
        "hello": 2
    }
    const obj2 = {
        "world": "!"
    }
    const result = {
        "hello": 2,
        "world": "!"
    }
    expect(deepMerge([obj1, obj2]))
        .toEqual(result);
});

test('merge sub-object properties', () => {
    const obj1 = {
        "message": {
            "hello": 2
        }
    }
    const obj2 = {
        "message": {
            "world": "!"
        }
    }
    const result = {
        "message": {
            "hello": 2,
            "world": "!"
        }
    }
    expect(deepMerge([obj1, obj2]))
        .toEqual(result);
});


test('merge array', () => {
    const obj1 = {
        "messages": [
            "hello"
        ]
    }
    const obj2 = {
        "messages": [
            "world"
        ]
    }
    const result = {
        "messages": [
            "hello",
            "world"
        ]
    }
    expect(deepMerge([obj1, obj2]))
        .toEqual(result);
});