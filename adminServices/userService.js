import model from "../models/index.js";

async function getUserDetailsServices() {
  try {
    // getting all users from the user model
    const getUser = await model.User.findAll({
      attributes: {
        exclude: [
          // remove the attributes using exclude method
          "password",
          "otp",
          "forgotPasswordId",
          "emailVerificationId",
          "otpExpiresIn",
          "phoneVerified",
          "emailVerified",
          "local",
          "google",
          "facebook",
          "linkedin",
          "signupType",
          "createdAt",
          "updatedAt",
        ],
      },
    });
    return getUser;
  } catch (error) {
    console.log(error);
  }
}
// this func for finding total count of the users

async function userCountServices() {
  const userCountVal = await model.User.count();
  return userCountVal;
}
export { getUserDetailsServices, userCountServices };
