import RevenueServices from "../../adminServices/revenueServices.js";

// calling the revenue servcies for getting all the revenue
async function totalRevenueController(req, res) {
  const totalRevenue = await RevenueServices();
  return res.json({
    totalRevenue,
  });
}
export default totalRevenueController;
