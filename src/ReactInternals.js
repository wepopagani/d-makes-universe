// Questo file risolve il problema specifico con ReactSharedInternals.S

// Creazione di un oggetto fittizio con la proprietà S
const ReactSharedInternals = {
  S: {},  // S è la proprietà che sta causando l'errore
  // Altre proprietà che potrebbero essere necessarie
  ReactCurrentOwner: {},
  ReactCurrentBatchConfig: {},
  ReactCurrentDispatcher: {
    current: null
  }
};

// Esporta l'oggetto per l'uso globale
if (typeof window !== 'undefined') {
  window.ReactSharedInternals = ReactSharedInternals;
}

export default ReactSharedInternals; 