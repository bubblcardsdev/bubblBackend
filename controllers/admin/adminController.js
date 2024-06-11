import {
  adminPasswordServices,
  allAdminServices,
} from "../../adminServices/adminService.js";

async function getAllAdmin(req, res) {
  try {
    const allAdmin = await allAdminServices();
    return res.json({
      success: true,
      allAdmin,
    });
  } catch (error) {
    console.log(error);
  }
}

async function adminController(req, res) {
  const { adminId, newPassword } = req.body;
  try {
    const passWordChange = await adminPasswordServices(
      res,
      adminId,
      newPassword
    );
    return passWordChange;
  } catch (error) {
    console.log(error);
  }
}
export { adminController, getAllAdmin };
