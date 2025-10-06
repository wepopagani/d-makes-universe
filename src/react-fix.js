import React from 'react';

// Definisce la versione corretta dell'interfaccia condivisa
if (typeof window !== 'undefined') {
  window.React = React;
  // Assicuriamoci che ReactSharedInternals sia definito correttamente
  if (React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    window.ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  }
}

export default React; 