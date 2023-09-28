const apiProduct = (status_code, data, message, res) => {
  res.status(status_code).json({
    status_code: status_code,
    payload: data,
    message: message,
  });
};
module.exports = apiProduct;
