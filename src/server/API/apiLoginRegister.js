const apiLoginRegister = (status_code, result, message, res) => {
  res.status(status_code).json({
    payload: {
      status_code: status_code,
      data: result,
      message: message,
    },
  });
};

module.exports = apiLoginRegister;
