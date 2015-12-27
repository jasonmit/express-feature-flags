'use strict';

function contains(contextValue, { expect, context }) {
  if (typeof expect === 'function') {
    expect = expect(context);
  }

  if (typeof expect === 'string') {
    return contextValue.includes(expect);
  }

  return expect.includes(contextValue);
}

export default contains;
