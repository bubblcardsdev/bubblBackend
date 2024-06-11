function health(req, res) {
  try {
    const healthCheck = {
      message: "OK",
    };
    res.json({
      success: true,
      data: healthCheck,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      data: {
        error,
      },
    });
  }
}

export { health };
