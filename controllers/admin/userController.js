import {
  getUserDetailsServices,
  userCountServices,
} from "../../adminServices/userService.js";

async function getUserDetailsController(req, res) {
  try {
    // calling the user service file to get all users
    const getUser = await getUserDetailsServices();
    return res.json({
      getUser,
    });
  } catch (error) {
    console.log(error);
  }
}

async function userCountController(req, res) {
  try {
    const getUserCount = await userCountServices();
    return res.json({
      getUserCount,
    });
  } catch (error) {
    console.log(error);
  }
}
export { getUserDetailsController, userCountController };
