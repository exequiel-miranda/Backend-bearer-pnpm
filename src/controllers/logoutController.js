const logoutController = {};

logoutController.logout = async (req, res) => {
  res.clearCookie("authCookie", { path: "/" });
  return res.json({ message: "Logged out" });
};

export default logoutController;
