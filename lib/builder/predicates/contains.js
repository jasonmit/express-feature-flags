'use strict';

function contains(needle, value) {
  if (typeof value === 'string') {
    return needle.includes(value);
  }

  return value.includes(needle);
}

export default contains;
