// Patch for fixing ReactSharedInternals.S issue
// Must be loaded before any React code

(function() {
  // Create a polyfill for ReactSharedInternals
  const ReactSharedInternalsPolyfill = {
    S: {},  // This is what's missing in the error
    ReactCurrentOwner: { current: null },
    ReactCurrentBatchConfig: { suspense: null },
    ReactCurrentDispatcher: { current: null },
    ReactCurrentActQueue: { current: null }
  };

  // Define it globally so it's available everywhere
  window.ReactSharedInternals = ReactSharedInternalsPolyfill;
  
  // Override the native getter for React
  const originalReactGetter = Object.getOwnPropertyDescriptor(window, 'React')?.get;
  let reactInstance = window.React;
  
  Object.defineProperty(window, 'React', {
    get: function() {
      let result = originalReactGetter ? originalReactGetter() : reactInstance;
      
      // Ensure React has the correct internals
      if (result && !result.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
        result.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternalsPolyfill;
      }
      
      // If React has internals but no S property, add it
      if (result && result.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED && 
          !result.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.S) {
        result.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.S = {};
      }
      
      return result;
    },
    set: function(value) {
      reactInstance = value;
      
      // Ensure new React value has correct internals
      if (reactInstance && !reactInstance.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
        reactInstance.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternalsPolyfill;
      }
      
      // If React has internals but no S property, add it
      if (reactInstance && reactInstance.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED && 
          !reactInstance.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.S) {
        reactInstance.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.S = {};
      }
    },
    configurable: true
  });
})();