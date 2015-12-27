'use strict';

function contains(contextValue, { comparison, context }) {
  if (typeof comparison === 'function') {
    comparison = comparison(context);
  }

  if (typeof comparison === 'string') {
    return contextValue.includes(comparison);
  }

  return comparison.includes(contextValue);
}

export default contains;
