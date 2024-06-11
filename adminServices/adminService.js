import model from "../models/index.js";

async function adminPasswordServices(res, adminId, newPassword) {
  // check admin Id
  const checkAdminId = await model.Admin.findOne({
    where: {
      id: adminId,
    },
  });
  // if admin id is exist means, it update the password
  if (checkAdminId) {
    const passwordChangeFunction = await model.Admin.update(
      {
        password: newPassword,
      },
      {
        where: {
          id: adminId,
        },
      }
    );
    return res.json({
      success: true,
      message: "updated",
    });
  } else {
    return res.json({
      success: false,
      message: "Admin not found",
    });
  }
}

async function allAdminServices() {
  const allAdminServices = await model.Admin.findAll();
  return allAdminServices;
}
export { adminPasswordServices, allAdminServices };
