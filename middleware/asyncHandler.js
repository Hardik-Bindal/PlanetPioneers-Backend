/**
 * 🔧 Async Handler Utility
 * Wraps async functions to avoid repetitive try/catch
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
