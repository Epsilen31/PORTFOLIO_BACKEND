export const catchAsynError = (func) => {
  return async (req, res, next) => {
    try {
      await func(req, res, next);
    } catch (error) {
      console.error("An error occurred:", error.message);
      next(error);
    }
  };
};
