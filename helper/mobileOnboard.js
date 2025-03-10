import model from "../models/index.js";

export default async function MobileOnboardingProfileCreate(
  firstName,
  lastName,
  email,
  profileName,
  phoneNumber,
  companyName,
  templateId,
  designation,
  userId
) {
  const profile = await model.Profile.findOne({
    where: {
      profileName,
      userId,
    },
  });
  
  if (profile) {
    throw new Error("Profile name already exists");
  }

  const create = await model.Profile.create({
    userId:userId,
    profileName:profileName,
    firstName:firstName,
    lastName: lastName,
    designation: designation,
    companyName:companyName,
    templateId:templateId
  });
  

  if (create) {
    // await model.ProfileInfo.create({
    //   userId: userId,
    //   profileId: create.id,
    //   templateId: templateId,
    // });
    await model.ProfilePhoneNumber.create({
      profileId: create.id,
      phoneNumber: phoneNumber,
      phoneNumberType: "",
      countryCode: "+91",
      checkBoxStatus: true,
      activeStatus: true,
    });
    await model.ProfileEmail.create({
      profileId: create.id,
      emailId: email,
      emailType: profileName,
      checkBoxStatus: true,
      activeStatus: true,
    });
    return create;
  }
}
