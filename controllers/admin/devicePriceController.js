import {
  devicePriceServices,
  allDevicePriceServices,
} from "../../adminServices/devicePriceServices.js";

async function devicePriceController(req, res) {
  const { devicePrice, description, deviceType } = req.body; // to get the body data
  //   call the services
  const priceUpdate = await devicePriceServices(
    res,
    devicePrice,
    description,
    deviceType
  );
  return priceUpdate;
}

async function allDevicePriceController(req, res) {
  try {
    const allDevicePrice = await allDevicePriceServices();
    return res.json({
      success: false,
      allDevicePrice,
    });
  } catch (error) {
    console.log(error);
  }
}

export { devicePriceController, allDevicePriceController };
