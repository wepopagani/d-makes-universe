// Patch di emergenza per React
(function() {
  if (typeof window !== 'undefined') {
    // Assicuriamoci che React sia definito globalmente
    if (!window.React && typeof React !== 'undefined') {
      window.React = React;
    }
    
    // Crea una nuova versione di ReactSharedInternals
    window.ReactSharedInternals = {
      S: {}, // La proprietà che sta causando il problema
      ReactCurrentOwner: {},
      ReactCurrentBatchConfig: {},
      ReactCurrentDispatcher: { current: null },
      ReactCurrentActQueue: { current: null },
      ReactCurrentActQueue: { current: null }
    };
    
    // Se React ha già un'interfaccia interna, la usa
    if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      window.ReactSharedInternals = {
        ...window.ReactSharedInternals,
        ...window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
        S: {} // Assicuriamoci che S sia sempre definito
      };
    }
  }
})(); 