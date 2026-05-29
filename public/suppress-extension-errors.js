// Forward extension errors to console instead of silencing them
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    originalError.apply(console, args);
  };
}
