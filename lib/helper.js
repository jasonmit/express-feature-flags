'use strict';

function enabled(key, options) {
  if (options.data && options.data.enabled) {
    return !!options.data.enabled[key];
  }

  return false;
}

export default enabled;
