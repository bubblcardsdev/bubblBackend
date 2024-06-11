import tapCountServices from "../../adminServices/tapServices.js";

async function tapController(req, res) {
  const totalTapCount = await tapCountServices();
  return res.json({
    totalTapCount,
  });
}
export default tapController;
