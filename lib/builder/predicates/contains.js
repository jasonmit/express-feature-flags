'use strict';

function contains(contextValue, { value, context }) {
  if (typeof value === 'function') {
    value = value(context);
  }

  if (typeof value === 'string') {
    return contextValue.includes(value);
  }

  return value.includes(contextValue);
}

export default contains;
