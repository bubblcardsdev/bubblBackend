import model from "../models/index.js";

async function devicePriceServices(res, devicePrice, description, deviceType) {
  //  to check the id for the table
  const checkDeviceId = await model.DeviceInventory.findOne({
    where: {
      deviceType: deviceType,
    },
  });

  //   checkDeviceId is not null means , it updates the value of the table
  if (checkDeviceId) {
    const updateDeviceDetails = await model.DeviceInventory.update(
      // update query
      {
        price: devicePrice,
        deviceDescription: description,
      },
      {
        where: {
          deviceType: deviceType,
        },
      }
    );
    return res.json({
      success: true,
      message: "Updated",
      updateDeviceDetails,
    });

    // if the checkDeviceId is not null means, throws the error
  } else {
    return res.json({
      success: false,
      message: "Device not found",
    });
  }
}

async function allDevicePriceServices() {
  const priceFunction = await model.DeviceInventory.findAll();
  return priceFunction;
}
export { devicePriceServices, allDevicePriceServices };
