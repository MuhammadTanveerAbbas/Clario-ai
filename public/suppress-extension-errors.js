// Suppress Chrome extension errors that are not related to our app
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const errorMessage = args[0]?.toString() || '';
    // Filter out Chrome extension errors
    if (errorMessage.includes('onMessage listener') || 
        errorMessage.includes('went out of scope')) {
      return;
    }
    originalError.apply(console, args);
  };
}
