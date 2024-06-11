import model from "../models/index.js";

async function tapCountServices() {
  const tapDetails = await model.Analytics.count();
  return tapDetails;
}
export default tapCountServices;
