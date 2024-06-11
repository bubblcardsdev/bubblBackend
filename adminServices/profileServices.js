import model from "../models/index.js";
//  to do name, command
async function getAllProfileServices() {
  const allProfiles = await model.AccountDeviceLink.findAll({
    include: [
      {
        model: model.User,
        attributes: {
          exclude: [
            // to remove unwanted the attributes from user tables
            "userImage",
            "gender",
            "DOB",
            "country",
            "countryCode",
            "phoneNumber",
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
      },
      {
        model: model.Device,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: model.DeviceLink,
        attributes: { exclude: ["createdAt", "updatedAt"] },

        include: [
          {
            model: model.Profile,
            attributes: {
              exclude: [
                "address",
                "brandingFont",
                "brandingLogo",
                "city",
                "companyAddress",
                "companyName",
                "country",
                "createdAt",
                "designation",
                "digitalMediaEnable",
                "emailEnable",
                "firstName",
                "lastName",
                "phoneNumberEnable",
                "profileImage",
                "qrCodeImage",
                "shortDescription",
                "socialMediaEnable",
                "state",
                "websiteEnable",
                "zipCode",
              ],
            },
          },
          {
            model: model.Template,
            attributes: {
              exclude: ["createdAt", "templateActiveStatus", "updatedAt"],
            },
          },
          {
            model: model.Mode,
            attributes: {
              exclude: ["activeStatus", "updatedAt", "createdAt"],
            },
          },
        ],
      },
    ],
  });
  return allProfiles;
}
export default getAllProfileServices;
