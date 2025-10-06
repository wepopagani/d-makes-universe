// Fix for @react-three/fiber compatibility issues
// This script ensures that react-reconciler gets the correct instance of ReactSharedInternals

import React from 'react';

// Ensure ReactSharedInternals is globally available
if (typeof window !== 'undefined') {
  // Create the object if it doesn't exist
  if (!window.ReactSharedInternals) {
    window.ReactSharedInternals = {
      S: {}, // The problematic property
      ReactCurrentOwner: { current: null },
      ReactCurrentBatchConfig: { suspense: null },
      ReactCurrentDispatcher: { current: null },
      ReactCurrentActQueue: { current: null }
    };
  }
  
  // Make sure it has the S property
  if (window.ReactSharedInternals && !window.ReactSharedInternals.S) {
    window.ReactSharedInternals.S = {};
  }
  
  // Also ensure React internals are correct
  if (React && React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    // Add a reference to global ReactSharedInternals
    window.ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    
    // Make sure it has the S property
    if (!window.ReactSharedInternals.S) {
      window.ReactSharedInternals.S = {};
    }
  } else if (React) {
    // If React exists but doesn't have internals, add them
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = window.ReactSharedInternals;
  }
}

export default {}; 