import model from "../models/index.js";
import {
  createProfileSchema,
  createProfileSchemaLatest,
  updateProfileSchema,
  updateProfileSchemaLatest,
} from "../validations/profile.js";
import { updateProfileDigitalPaymentLinks } from "../functions/updateDigitalPayment.js";
import { updateSocialMedia } from "../functions/updateSocialMedia.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";
import loggers from "../config/logger.js";
import axios from "axios";
import { decryptProfileId } from "../helper/ccavutil.js";
import { Op, Sequelize, where } from "sequelize";
import pkg from "lodash";
const {isEmpty} = pkg

async function getProfileName(req, res) {
  try {
    const userId = req.user.id;
    const { profileName } = req.body;

    const profile = await model.Profile.findOne({
      where: {
        profileName: profileName,
        userId: userId,
      },
    });

    if (!profile) {
      return res.json({
        success: true,
        message: "name available",
      });
    }

    return res.json({
      success: false,
      message: "Name is already been taken",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: `error occurred ${error.message}`,
    });
  }
}

async function createProfile(req, res) {
  const userId = req.user.id;
  const { profileName, accountDeviceLinkId } = req.body;
  const { error } = createProfileSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }
  try {
    const profile = await model.Profile.findOne({
      where: {
        profileName,
        userId,
      },
    });
    if (profile) {
      return res.json({
        success: false,
        message: "Profile name already exists",
      });
    }

    const checkAccountDeviceLink = await model.AccountDeviceLink.findOne({
      where: {
        id: accountDeviceLinkId,
        userId,
      },
    });
    if (checkAccountDeviceLink === null) {
      const create = await model.Profile.create({
        userId,
        profileName,
      });

      if (create) {
        // await model.ProfileInfo.create({
        //   userId:userId,
        //   profileId: create.id,
        //   templateId:1
        // });
        return res.json({
          success: true,
          message: "profile created",
          create,
        });
      }
    } else {
      const checkDeviceLink = await model.DeviceLink.findOne({
        where: {
          userId,
          accountDeviceLinkId: checkAccountDeviceLink.id,
        },
      });
      if (checkDeviceLink) {
        const create = await model.Profile.create({
          userId,
          profileName,
        });
        await model.DeviceLink.update(
          {
            profileId: create.id,
          },
          {
            where: {
              accountDeviceLinkId: checkAccountDeviceLink.id,
              userId,
            },
          }
        );
        let createDeviceLink = await model.DeviceLink.findOne({
          where: {
            accountDeviceLinkId,
            userId,
          },
        });
        return res.json({
          success: true,
          message: "Profile created successfully",
          createDeviceLink,
        });
      } else {
        const createProfile = await model.Profile.create({
          userId,
          profileName,
        });
        const createDeviceLink = await model.DeviceLink.create({
          userId,
          accountDeviceLinkId: checkAccountDeviceLink.id,
          profileId: createProfile.id,
          activeStatus: true,
          templateId: 1,
          modeId: 2,
        });
        return res.json({
          success: true,
          message: "Profile created and linked with Device",
          createDeviceLink,
        });
      }
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from createProfile function");
    return res.json({
      success: false,
      message: error,
    });
  }
}


async function createProfileLatest(req, res) {
  const userId = req.user.id;

  // 1. Validate body
  const { error } = createProfileSchemaLatest.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  const {
    phoneNumbers,
    emailIds,
    websites,
    socialMediaNames,
    digitalPaymentLinks,
     brandingFontColor, // nned to  insert it later if needed 
      brandingBackGroundColor,
      brandingAccentColor,
      darkMode,
    ...profileDetails
  } = req.body;

  profileDetails.userId = userId;

  try {
    // 3. Check user plan
    const bubblPlan = await model.BubblPlanManagement.findOne({ where: { userId } });

    if (!bubblPlan) {
      return res.status(400).json({
        success: false,
        message: "No subscription plan found",
      });
    }

    const planId = bubblPlan.planId;
    const limit = planId === 1 ? 2 : 5;

    const profileCount = await model.Profile.count({ where: { userId } });

    if (profileCount >= limit) {
      return res.status(400).json({
        success: false,
        message: "You have already reached your profile limit",
      });
    }

    // 4. Create Profile
    const newProfile = await model.Profile.create(profileDetails);
    const profileId = newProfile.id;


   if (newProfile?.id) {
  try {
    const brandingData = {
      profileId: newProfile.id,
      darkMode,
      brandingFontColor,
      brandingBackGroundColor,
      brandingAccentColor,
    };

    // Remove any fields with null or undefined
    const cleanedData = Object.fromEntries(
      Object.entries(brandingData).filter(([_, v]) => v !== null && v !== undefined)
    );

    await model.DeviceBranding.create(cleanedData);
  } catch (err) {
    console.error(err);
    loggers.error(err + " while inserting in the device brandings.");

    return res.status(500).json({
      success: false,
      message: "Something went wrong while inserting in the device brandings.",
    });
  }
}
else{
 return res.status(500).json({
      success: false,
      message: "No profileId is found",
    });
}

      const insertMany = async (arr, modelRef, key) => {
      if (!Array.isArray(arr) || arr.length === 0) return;

      const cleaned = arr
        .filter(item => item !== undefined && item !== null && item !== '')
        .map(item => ({
          profileId,
          [key]: item,
        }));

      if (cleaned.length > 0) {
        await modelRef.bulkCreate(cleaned);
      }
    };

    // 6. Insert mapping tables
    await insertMany(phoneNumbers, model.ProfilePhoneNumber, 'phoneNumber');
    await insertMany(emailIds, model.ProfileEmail, 'email');
    await insertMany(digitalPaymentLinks, model.ProfileDigitalPaymentLink, 'link');
    await insertMany(websites, model.ProfileWebsite, 'url');
    await insertMany(socialMediaNames, model.ProfileSocialMediaLink, 'socialMedia');

const createdProfile = await model.Profile.findOne({
  where: { id: newProfile?.id },
  include: [
    { model: model.ProfilePhoneNumber, as: "profilePhoneNumbers" },
    { model: model.ProfileEmail, as: "profileEmails" },
    { model: model.ProfileWebsite, as: "profileWebsites" },
    { model: model.ProfileSocialMediaLink, as: "profileSocialMediaLinks" },
    { model: model.ProfileDigitalPaymentLink, as: "profileDigitalPaymentLinks" },
    {model:model.DeviceBranding, as: "DeviceBranding" }
  ]
});



const data={
  createdProfile:createdProfile,
  // deviceBrandings:
}
    // 7. Done
    return res.status(200).json({
      success: true,
      message: "Profile created successfully",
      profile: createdProfile,
    });

  } catch (err) {
    console.error(err);
    loggers.error(err + " from createProfileLatest function");

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the profile.",
    });
  }
}

async function updateProfileLatest(req, res) {
  const userId = req.user.id;

  // Destructure excluded fields and keep the rest in profileDetails
  const {
    profileId,
    deviceLinkId,
    phoneNumbers,
    emailIds,
    websites,
    socialMediaNames,
    digitalPaymentLinks,
    brandingFontColor, // you want to insert this later
    brandingBackGroundColor,
    brandingAccentColor,
    ...profileDetails
  } = req.body;

  const { error } = updateProfileSchemaLatest.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  const profileExist = await model.Profile.findOne({  
    where: { id: profileId },
  });

  if (!profileExist) {
    return res.status(400).json({
      success: false,
      data: { error: "Profile does not exist" },
    });
  }

  const updateData = {};
   const brandingData ={}
   

  if (profileDetails.profileName !== undefined && profileDetails.profileName !== null)
    updateData.profileName = profileDetails.profileName;

  if (profileDetails.templateId !== undefined && profileDetails.templateId !== null)
    updateData.templateId = profileDetails.templateId;

  if (profileDetails.darkMode !== undefined && profileDetails.darkMode !== null)
    updateData.darkMode = profileDetails.darkMode;

  if (profileDetails.firstName !== undefined && profileDetails.firstName !== null)
    updateData.firstName = profileDetails.firstName;

  if (profileDetails.lastName !== undefined && profileDetails.lastName !== null)
    updateData.lastName = profileDetails.lastName;

  if (profileDetails.designation !== undefined && profileDetails.designation !== null)
    updateData.designation = profileDetails.designation;

  if (profileDetails.companyName !== undefined && profileDetails.companyName !== null)
    updateData.companyName = profileDetails.companyName;

  if (profileDetails.companyAddress !== undefined && profileDetails.companyAddress !== null)
    updateData.companyAddress = profileDetails.companyAddress;

  if (profileDetails.shortDescription !== undefined && profileDetails.shortDescription !== null)
    updateData.shortDescription = profileDetails.shortDescription;

  if (profileDetails.address !== undefined && profileDetails.address !== null)
    updateData.address = profileDetails.address;

  if (profileDetails.city !== undefined && profileDetails.city !== null)
    updateData.city = profileDetails.city;

  if (profileDetails.zipCode !== undefined && profileDetails.zipCode !== null)
    updateData.zipCode = profileDetails.zipCode;

  if (profileDetails.state !== undefined && profileDetails.state !== null)
    updateData.state = profileDetails.state;

  if (profileDetails.country !== undefined && profileDetails.country !== null)
    updateData.country = profileDetails.country;


  if (profileDetails.brandingFont !== undefined && profileDetails.brandingFont !== null)
    updateData.brandingFont = profileDetails.brandingFont;

  if (profileDetails.phoneNumberEnable !== undefined && profileDetails.phoneNumberEnable !== null)
    updateData.phoneNumberEnable = profileDetails.phoneNumberEnable;

  if (profileDetails.emailEnable !== undefined && profileDetails.emailEnable !== null)
    updateData.emailEnable = profileDetails.emailEnable;

  if (profileDetails.websiteEnable !== undefined && profileDetails.websiteEnable !== null)
    updateData.websiteEnable = profileDetails.websiteEnable;

  if (profileDetails.socialMediaEnable !== undefined && profileDetails.socialMediaEnable !== null)
    updateData.socialMediaEnable = profileDetails.socialMediaEnable;

  if (profileDetails.digitalMediaEnable !== undefined && profileDetails.digitalMediaEnable !== null)
    updateData.digitalMediaEnable = profileDetails.digitalMediaEnable;

  if (brandingBackGroundColor !== undefined && brandingBackGroundColor !== null)
    brandingData.brandingBackGroundColor = brandingBackGroundColor;

  if (brandingFontColor !== undefined && brandingFontColor !== null)
    brandingData.brandingFontColor = brandingFontColor;

  if (brandingAccentColor !== undefined && brandingAccentColor !== null)
    brandingData.brandingAccentColor = brandingAccentColor;

  if(!isEmpty(updateData)){
await model.Profile.update(updateData, {
    where: { id: profileId },
  });
  }
// 1. Social Media (only one allowed)
if (socialMediaNames?.length > 0) {
  try {
    const { profileSocialMediaLinkId, ...social } = socialMediaNames[0];
    const data = { ...social, profileId };

    if (profileSocialMediaLinkId) {
      await model.ProfileSocialMediaLink.update(data, {
        where: { id: profileSocialMediaLinkId },
      });
    } else {
      await model.ProfileSocialMediaLink.create(data);
    }
  } catch (err) {
    console.error("Error upserting social media link:", err);
  }
}

// 2. Phone Numbers (2 allowed)
if (phoneNumbers?.length > 0) {
  try {
    await Promise.all(
      phoneNumbers.map(async phone => {
        const { phoneNumbersId, ...rest } = phone;
        const data = { ...rest, profileId };

        if (phoneNumbersId) {
          await model.ProfilePhoneNumber.update(data, { where: { id:phoneNumbersId } });
        } else {
          await model.ProfilePhoneNumber.create(data);
        }
      })
    );
  } catch (err) {
    console.error("Error upserting phone numbers:", err);
  }
}

// 3. Email IDs (2 allowed)
if (emailIds?.length > 0) {
  try {
    await Promise.all(
      emailIds.map(async email => {
        const { emailIdNumber, ...rest } = email;
        const data = { ...rest, profileId };

        if (emailIdNumber) {
          await model.ProfileEmail.update(data, { where: { id:emailIdNumber } });
        } else {
          await model.ProfileEmail.create(data);
        }
      })
    );
  } catch (err) {
    console.error("Error upserting email IDs:", err);
  }
}

// 4. Digital Payment Link (only one allowed)
if (digitalPaymentLinks?.length > 0) {
  try {
    const { profileDigitalPaymentLinkId, ...payment } = digitalPaymentLinks[0];
    const data = { ...payment, profileId };

    if (profileDigitalPaymentLinkId) {
      await model.ProfileDigitalPaymentLink.update(data, {
        where: { id:profileDigitalPaymentLinkId },
      });
    } else {
      await model.ProfileDigitalPaymentLink.create(data);
    }
  } catch (err) {
    console.error("Error upserting digital payment link:", err);
  }
}

// 5. Website (only one allowed)
if (websites?.length > 0) {
  try {
    const { websiteId, ...website } = websites[0];
    const data = { ...website, profileId };

    if (websiteId) {
      await model.ProfileWebsite.update(data, {
        where: { id: websiteId },
      });
    } else {
      await model.ProfileWebsite.create(data);
    }
  } catch (err) {
    console.error("Error upserting website:", err);
  }
}


  if(!isEmpty(brandingData)){
    brandingData.profileId = profileId;
    brandingData.deviceLinkId = deviceLinkId;
    await model.DeviceBranding.update(brandingData, {
    where: { id: profileId },
  });
  }


  const updatedProfile = await model.Profile.findOne({
  where: { id: profileId },
  include: [
    { model: model.ProfilePhoneNumber, as: "profilePhoneNumbers" },
    { model: model.ProfileEmail, as: "profileEmails" },
    { model: model.ProfileWebsite, as: "profileWebsites" },
    { model: model.ProfileSocialMediaLink, as: "profileSocialMediaLinks" },
    { model: model.ProfileDigitalPaymentLink, as: "profileDigitalPaymentLinks" },
    {model:model.DeviceBranding, as: "DeviceBranding" }

  ]
});
  

  return res.status(200).json({
    success: true,
    updatedData:updatedProfile,
    data: { message: "Profile updated successfully" },
  });
}




async function updateProfile(req, res) {
  const userId = req.user.id;

  const {
    profileId,
    deviceLinkId,
    templateId,
    profileImage,
    darkMode,
    firstName,
    lastName,
    designation,
    companyName,
    companyAddress,
    shortDescription,
    address,
    city,
    zipCode,
    state,
    country,
    brandingFontColor,
    brandingBackGroundColor,
    brandingAccentColor,
    brandingFont,
    phoneNumbers,
    phoneNumberEnable,
    emailIds,
    emailEnable,
    websites,
    websiteEnable,
    socialMediaNames,
    socialMediaEnable,
    digitalPaymentLinks,
    digitalMediaEnable,
  } = req.body;

  const { error } = updateProfileSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  const phoneNumbersLength = phoneNumbers.length;
  const emailIdLength = emailIds.length;
  const websiteLength = websites.length;
  const socialMediaLength = socialMediaNames.length;
  const digitalPaymentLinkLength = digitalPaymentLinks.length;

  try {
    const profile = await model.Profile.findOne({
      where: {
        id: profileId,
        userId,
      },
    });

    if (profile) {
      await model.Profile.update(
        {
          id: profileId,
          darkMode,
          firstName,
          lastName,
          designation,
          companyName,
          companyAddress,
          shortDescription,
          address,
          city,
          zipCode,
          state,
          country,
          brandingFontColor,
          brandingBackGroundColor,
          brandingAccentColor,
          brandingFont,
          phoneNumberEnable,
          emailEnable,
          websiteEnable,
          socialMediaEnable,
          digitalMediaEnable,
          profileImage,
          templateId: templateId,
        },
        {
          where: {
            id: profileId,
            userId: userId,
          },
        }
      );

      if (templateId !== null) {
        const deviceLink = await model.DeviceLink.findOne({
          where: { id: deviceLinkId, userId: userId },
        });

        if (deviceLink) {
          const deviceBranding = await model.DeviceBranding.findOne({
            where: {
              deviceLinkId: deviceLink.id,
              profileId: profileId,
              templateId: templateId,
            },
          });
          console.log("Came in if device", deviceBranding);
          if (deviceBranding) {
            await model.DeviceBranding.update(
              {
                darkMode: darkMode,
                brandingFontColor: brandingFontColor,
                brandingBackGroundColor: brandingBackGroundColor,
                brandingAccentColor: brandingAccentColor,
              },
              {
                where: {
                  deviceLinkId: deviceLink.id,
                  profileId: profileId,
                  templateId: templateId,
                },
              }
            );
          } else {
            await model.DeviceBranding.create({
              deviceLinkId: deviceLink.id,
              profileId: profileId,
              templateId: templateId,
              darkMode: darkMode,
              brandingFontColor: brandingFontColor,
              brandingBackGroundColor: brandingBackGroundColor,
              brandingAccentColor: brandingAccentColor,
            });
          }
        } else {
          console.log("Came in else device");
          const deviceBrandingWithoutProfile =
            await model.DeviceBranding.findOne({
              where: {
                profileId: profileId,
                templateId: templateId,
              },
            });
          if (deviceBrandingWithoutProfile) {
            await model.DeviceBranding.update(
              {
                darkMode: darkMode,
                brandingFontColor: brandingFontColor,
                brandingBackGroundColor: brandingBackGroundColor,
                brandingAccentColor: brandingAccentColor,
              },
              {
                where: {
                  // deviceLinkId: deviceLink.id,
                  profileId: profileId,
                  templateId: templateId,
                },
              }
            );
          } else {
            await model.DeviceBranding.create({
              // deviceLinkId: deviceLink.id,
              profileId: profileId,
              templateId: templateId,
              darkMode: darkMode,
              brandingFontColor: brandingFontColor,
              brandingBackGroundColor: brandingBackGroundColor,
              brandingAccentColor: brandingAccentColor,
            });
          }
        }
      }

      if (phoneNumbersLength > 0) {
        const phoneNumber = await phoneNumbers.map((phone) => {
          return {
            profileId: profileId,
            phoneNumberId: phone.phoneNumberId,
            countryCode: phone.countryCode,
            phoneNumber: phone.phoneNumber,
            phoneNumberType: phone.phoneNumberType,
            checkBoxStatus: phone.checkBoxStatus,
            activeStatus: phone.activeStatus,
          };
        });
        for (let i = 0; i < phoneNumbersLength; i++) {
          if (phoneNumber[i].phoneNumberId === null) {
            await model.ProfilePhoneNumber.create({
              profileId: phoneNumber[i].profileId,
              phoneNumber: phoneNumber[i].phoneNumber,
              phoneNumberType: phoneNumber[i].phoneNumberType,
              countryCode: phoneNumber[i].countryCode,
              checkBoxStatus: phoneNumber[i].checkBoxStatus,
              activeStatus: phoneNumber[i].activeStatus,
            });
          } else {
            await model.ProfilePhoneNumber.update(
              {
                profileId: phoneNumber[i].profileId,
                phoneNumber: phoneNumber[i].phoneNumber,
                phoneNumberType: phoneNumber[i].phoneNumberType,
                countryCode: phoneNumber[i].countryCode,
                checkBoxStatus: phoneNumber[i].checkBoxStatus,
                activeStatus: phoneNumber[i].activeStatus,
              },
              {
                where: {
                  id: phoneNumber[i].phoneNumberId,
                },
              }
            );
          }
        }
      }

      if (emailIdLength > 0) {
        const emailId = await emailIds.map((email) => {
          return {
            profileId: profileId,
            emailIdNumber: email.emailIdNumber,
            emailId: email.emailId,
            emailType: email.emailType,
            checkBoxStatus: email.checkBoxStatus,
            activeStatus: email.activeStatus,
          };
        });
        for (let j = 0; j < emailIdLength; j++) {
          if (emailId[j].emailIdNumber === null) {
            await model.ProfileEmail.create({
              profileId: emailId[j].profileId,
              emailId: emailId[j].emailId,
              emailType: emailId[j].emailType,
              checkBoxStatus: emailId[j].checkBoxStatus,
              activeStatus: emailId[j].activeStatus,
            });
          } else {
            await model.ProfileEmail.update(
              {
                profileId: emailId[j].profileId,
                emailId: emailId[j].emailId,
                emailType: emailId[j].emailType,
                checkBoxStatus: emailId[j].checkBoxStatus,
                activeStatus: emailId[j].activeStatus,
              },
              {
                where: {
                  id: emailId[j].emailIdNumber,
                },
              }
            );
          }
        }
      }

      if (websiteLength > 0) {
        const website = await websites.map((web) => {
          return {
            profileId: profileId,
            websiteId: web.websiteId,
            website: web.website,
            websiteType: web.websiteType,
            checkBoxStatus: web.checkBoxStatus,
            activeStatus: web.activeStatus,
          };
        });
        for (let k = 0; k < websiteLength; k++) {
          if (website[k].websiteId === null) {
            await model.ProfileWebsite.create({
              profileId: website[k].profileId,
              website: website[k].website,
              websiteType: website[k].websiteType,
              checkBoxStatus: website[k].checkBoxStatus,
              activeStatus: website[k].activeStatus,
            });
          } else {
            await model.ProfileWebsite.update(
              {
                profileId: website[k].profileId,
                website: website[k].website,
                websiteType: website[k].websiteType,
                checkBoxStatus: website[k].checkBoxStatus,
                activeStatus: website[k].activeStatus,
              },
              {
                where: {
                  id: website[k].websiteId,
                },
              }
            );
          }
        }
      }

      if (socialMediaLength > 0) {
        await updateSocialMedia(socialMediaNames, socialMediaLength, profileId);
      }

      if (digitalPaymentLinkLength > 0) {
        await updateProfileDigitalPaymentLinks(
          digitalPaymentLinks,
          digitalPaymentLinkLength,
          profileId
        );
      }
      const profile = await model.Profile.findOne({
        where: {
          id: profileId,
          userId,
        },
        include: [
          {
            model: model.ProfilePhoneNumber,
            as: "profilePhoneNumbers",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfileEmail,
            as: "profileEmails",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfileWebsite,
            as: "profileWebsites",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfileSocialMediaLink,
            as: "profileSocialMediaLinks",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfileDigitalPaymentLink,
            as: "profileDigitalPaymentLinks",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        ],
      });
      let deviceLink;
      if (deviceLinkId) {
        deviceLink = await model.DeviceLink.findOne({
          where: {
            id: deviceLinkId,
          },
          include: {
            model: model.DeviceBranding,
          },
        });
      }

      return res.json({
        success: true,
        message: "updated",
        profile,
        deviceLink,
      });
    } else {
      return res.json({
        success: false,
        message: "Profile not found",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from updateProfile fun");
    return res.json({
      success: false,
      message: error,
    });
  }
}

async function getProfileByDevice(req, res) {
  const { deviceUid, uniqueName } = req.query;
  console.log(deviceUid, uniqueName, "query");
  try {
    if (deviceUid) {
      const device = await model.Device.findOne({
        where: {
          deviceUid: deviceUid,
        },
      });
      if (device) {
        const checkUserDeviceLink = await model.AccountDeviceLink.findOne({
          where: {
            deviceId: device.id,
            isDeleted: false,
          },
        });
        if (checkUserDeviceLink) {
          const checkProfileDeviceLink = await model.DeviceLink.findOne({
            where: {
              accountDeviceLinkId: checkUserDeviceLink.id,
              activeStatus: true,
            },
          });
          if (checkProfileDeviceLink) {
            const checkDeviceStatus = await model.DeviceLink.findOne({
              where: {
                activeStatus: true,
              },
            });
            if (checkDeviceStatus) {
              const profileId = checkProfileDeviceLink.profileId;
              const deviceLinkId = checkProfileDeviceLink.id;
              const profile = await model.Profile.findOne({
                where: {
                  id: profileId,
                },
                attributes: { exclude: ["createdAt", "updatedAt"] },
                include: [
                  {
                    model: model.ProfilePhoneNumber,
                    as: "profilePhoneNumbers",
                    // where: {
                    //   activeStatus: true,
                    //   checkBoxStatus: true,
                    // },
                  },
                  {
                    model: model.ProfileEmail,
                    as: "profileEmails",
                    // where: {
                    //   activeStatus: true,
                    //   checkBoxStatus: true,
                    // },
                  },
                  {
                    model: model.ProfileWebsite,
                    as: "profileWebsites",
                    // where: {
                    //   activeStatus: true,
                    //   checkBoxStatus: true,
                    // },
                  },
                  {
                    model: model.ProfileSocialMediaLink,
                    as: "profileSocialMediaLinks",
                    // where: {
                    //   activeStatus: true,
                    //   // deleteStatus: true,
                    // },
                  },
                  {
                    model: model.ProfileDigitalPaymentLink,
                    as: "profileDigitalPaymentLinks",
                    // where: {
                    //   activeStatus: true,
                    //   deleteStatus: true,
                    // },
                  },
                  {
                    model: model.DeviceLink,
                    where: {
                      id: deviceLinkId,
                      activeStatus: true,
                    },
                    include: [
                      {
                        model: model.Template,
                      },
                      {
                        model: model.Mode,
                        where: {
                          id: checkProfileDeviceLink.modeId,
                        },
                      },
                      {
                        model: model.AccountDeviceLink,
                        where: {
                          isDeleted: false,
                        },
                      },
                    ],
                  },
                ],
              });
              const userId = checkUserDeviceLink.userId;
              const user = await model.User.findOne({
                where: {
                  id: userId,
                },
                attributes: ["id", "firstName", "lastName"],
                include: [
                  {
                    model: model.ClaimLink,
                  },
                  {
                    model: model.BubblPlanManagement,
                  },
                ],
              });

              const deviceBranding = await model.DeviceBranding.findAll({
                where: {
                  deviceLinkId: deviceLinkId,
                  profileId: profileId,
                },
              });

              const profileImages = await model.ProfileImages.findAll({
                where: {
                  profileId: profileId,
                },
              });

              return res.json({
                success: true,
                message: "Your Profile",
                profile,
                user,
                deviceBranding,
                profileImages,
              });
            } else {
              return res.json({
                success: false,
                message:
                  "Device can be either Deleted or Deactivated. Check for it",
              });
            }
          } else {
            return res.json({
              success: false,
              message: "Device is not Attached with the profile",
            });
          }
        } else {
          return res.json({
            success: false,
            message:
              "Something went wrong while attaching to the account . Contact Administrator",
          });
        }
      }
      if (!device) {
        const checkWithoutDevice = decryptProfileId(deviceUid);
        if (checkWithoutDevice) {
          const profile = await model.Profile.findOne({
            where: {
              id: checkWithoutDevice,
            },
            attributes: { exclude: ["createdAt", "updatedAt"] },
            include: [
              {
                model: model.ProfilePhoneNumber,
                as: "profilePhoneNumbers",
                // where: {
                //   activeStatus: true,
                //   checkBoxStatus: true,
                // },
              },
              {
                model: model.ProfileEmail,
                as: "profileEmails",
                // where: {
                //   activeStatus: true,
                //   checkBoxStatus: true,
                // },
              },
              {
                model: model.ProfileWebsite,
                as: "profileWebsites",
                // where: {
                //   activeStatus: true,
                //   checkBoxStatus: true,
                // },
              },
              {
                model: model.ProfileSocialMediaLink,
                as: "profileSocialMediaLinks",
                // where: {
                //   activeStatus: true,
                //   // deleteStatus: true,
                // },
              },
              {
                model: model.ProfileDigitalPaymentLink,
                as: "profileDigitalPaymentLinks",
                // where: {
                //   activeStatus: true,
                //   deleteStatus: true,
                // },
              },
              // {
              //   model: model.DeviceLink,
              //   where: {
              //     id: deviceLinkId,
              //     activeStatus: true,
              //   },
              //   include: [
              //     {
              //       model: model.Template,
              //     },
              //     {
              //       model: model.Mode,
              //       where: {
              //         id: checkProfileDeviceLink.modeId,
              //       },
              //     },
              //     {
              //       model: model.AccountDeviceLink,
              //       where: {
              //         isDeleted: false,
              //       },
              //     },
              //   ],
              // },
            ],
          });
          const profileImages = await model.ProfileImages.findAll({
            where: {
              profileId: checkWithoutDevice,
            },
          });
          const deviceBranding = await model.DeviceBranding.findAll({
            where: {
              profileId: checkWithoutDevice,
            },
          });
          return res.json({
            success: true,
            message: "Your Profile",
            profile,
            // user,
            deviceBranding,
            profileImages,
          });
        }
      } else {
        return res.json({
          success: false,
          message: "Unable to find the Device",
        });
      }
    } else if (uniqueName) {
      const claimedName = await model.UniqueNameDeviceLink.findOne({
        where: {
          uniqueName: uniqueName,
        },
      });

      if (!claimedName) {
        return res.json({
          success: false,
          message: "cannot find the uniqueName",
        });
      }

      const deviceLinkId = claimedName.deviceLinkId;

      const checkDeviceLink = await model.DeviceLink.findOne({
        where: {
          id: deviceLinkId,
          activeStatus: true,
        },
      });

      if (checkDeviceLink) {
        const getDeviceAccountLink = await model.AccountDeviceLink.findOne({
          where: {
            id: checkDeviceLink.accountDeviceLinkId,
          },
        });

        if (!getDeviceAccountLink) {
          return res.json({
            success: false,
            message: "cannot find the uniqueName",
          });
        }
        const deviceLinkId = checkDeviceLink.id;
        const profileId = checkDeviceLink.profileId;
        const userId = checkDeviceLink.userId;
        const profile = await model.Profile.findOne({
          where: {
            id: profileId,
          },
          attributes: { exclude: ["createdAt", "updatedAt"] },
          include: [
            {
              model: model.ProfilePhoneNumber,
              as: "profilePhoneNumbers",
              // where: {
              //   activeStatus: true,
              //   checkBoxStatus: true,
              // },
            },
            {
              model: model.ProfileEmail,
              as: "profileEmails",
              // where: {
              //   activeStatus: true,
              //   checkBoxStatus: true,
              // },
            },
            {
              model: model.ProfileWebsite,
              as: "profileWebsites",
              // where: {
              //   activeStatus: true,
              //   checkBoxStatus: true,
              // },
            },
            {
              model: model.ProfileSocialMediaLink,
              as: "profileSocialMediaLinks",
            },
            {
              model: model.ProfileDigitalPaymentLink,
              as: "profileDigitalPaymentLinks",
              // where: {
              //   activeStatus: true,
              //   deleteStatus: true,
              // },
            },
            {
              model: model.DeviceLink,
              where: {
                id: deviceLinkId,
                activeStatus: true,
              },
              include: [
                {
                  model: model.Template,
                },
                {
                  model: model.Mode,
                  where: {
                    id: checkDeviceLink.modeId,
                  },
                },
                {
                  model: model.AccountDeviceLink,
                  where: {
                    isDeleted: false,
                  },
                  include: [
                    {
                      model: model.Device,
                    },
                  ],
                },
              ],
            },
          ],
        });
        const user = await model.User.findOne({
          where: {
            id: userId,
          },
          attributes: ["id", "firstName", "lastName"],
          include: [
            {
              model: model.ClaimLink,
            },
            {
              model: model.BubblPlanManagement,
            },
          ],
        });

        const deviceBranding = await model.DeviceBranding.findAll({
          where: {
            deviceLinkId: deviceLinkId,
            profileId: profileId,
          },
        });

        const profileImages = await model.ProfileImages.findAll({
          where: {
            profileId: profileId,
          },
        });

        return res.json({
          success: true,
          message: "Your Profile",
          profile,
          user,
          deviceBranding,
          profileImages,
        });
      } else {
        return res.json({
          success: false,
          message: "Couldnt find the device that is linked with the profile",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "Please specify the either of two required parameters",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from getProfileByDevice function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function getProfileImage(req, res) {
  try {
    const profileId = req.body.profileId;
    const profileImages = await model.ProfileImages.findAll({
      where: {
        profileId: profileId,
      },
    });
    return res.json({
      success: true,
      profileImages,
    });
  } catch (err) {
    console.log(err);
    loggers.error(err + "from getProfileImage function");
    return res.json({
      success: false,
      message: err,
    });
  }
}

async function getProfileImageForLeadGen(req, res) {
  try {
    const deviceName = req.body.deviceId;
    const deviceId = await model.Device.findOne({
      where: {
        deviceUid: deviceName,
      },
    });

    const accountDeviceLinkData = await model.AccountDeviceLink.findOne({
      where: {
        deviceId: deviceId.id,
      },
    });

    const DeviceLinksData = await model.DeviceLink.findOne({
      where: {
        accountDeviceLinkId: accountDeviceLinkData.id,
      },
    });

    const profileImages = await model.ProfileImages.findAll({
      where: {
        profileId: DeviceLinksData.profileId,
      },
    });

    return res.json({
      success: true,
      profileImages,
    });
  } catch (err) {
    console.log(err);
    loggers.error(err + "from getProfileImageForLeadGen function");
    res.json({
      success: false,
      message: err,
    });
  }
}

async function findAllProfiles(req, res) {
  const userId = req.user.id;
  try {
    const profiles = await model.Profile.findAll({
      where: {
        userId: userId,
      },
      attributes: [
        "id",
        "profileName",
        "firstName",
        "lastName",
        "designation",
        "companyName",
        "address",
      ],
      include: [
        {
          model: model.DeviceLink,
          include: [
            {
              model: model.Template,
            },
            {
              model: model.Mode,
            },
            {
              model: model.DeviceBranding,
            },
            {
              model: model.UniqueNameDeviceLink,
            },
            {
              model: model.AccountDeviceLink,
              where: {
                isDeleted: false,
              },
              include: [
                {
                  model: model.Device,
                },
              ],
            },
          ],
        },
        {
          model: model.ProfilePhoneNumber,
          as: "profilePhoneNumbers",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: model.ProfileEmail,
          as: "profileEmails",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: model.ProfileWebsite,
          as: "profileWebsites",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: model.ProfileSocialMediaLink,
          as: "profileSocialMediaLinks",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: model.ProfileDigitalPaymentLink,
          as: "profileDigitalPaymentLinks",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],

      hooks: false,
    });

    const devices = await model.AccountDeviceLink.findAll({
      include: [
        {
          model: model.Device,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: model.DeviceLink,
          include: [
            {
              model: model.Profile,
            },
            {
              model: model.Template,
            },
            {
              model: model.Mode,
            },
            {
              model: model.DeviceBranding,
            },
            {
              model: model.AccountDeviceLink,
              where: {
                isDeleted: false,
              },
              include: [
                {
                  model: model.Device,
                },
              ],
            },
          ],
        },
      ],
      where: {
        userId: userId,
        isDeleted: false,
      },
    });
    // if (devices) {
    //   const imgPath = devices[0].DeviceLink.Profile.dataValues.profileImage;

    //   if (imgPath !== "") {
    //     const SignedImage = await generateSignedUrl(imgPath);
    //     devices[0].DeviceLink.Profile.dataValues.profileImage = SignedImage;
    //   }
    // }

    const profileImages = model.ProfileImages.findOne({
      where: {
        profileId: 4,
      },
    });

    return res.json({
      success: true,
      data: {
        message: "Profiles found",
        profiles,
        profileImages,
        devices,
      },
    });
  } catch (error) {
    console.log(error);
    loggers.error(error + "from findAllProfiles function");
    return res.json({
      success: false,
      data: {
        message: error.message,
      },
    });
  }
}

async function findAllProfilesForMob(req, res) {
  const userId = req.user.id;
  try {
    const allProfile = await model.Profile.findAll({
      where: { userId: userId },
      attributes: [
        "id",
        "profileName",
        "profileImage",
        "firstName",
        "lastName",
        "designation",
        "companyName",
        "address",
      ],
      raw: false,
      hooks: false,
      // subQuery: true,
      include: [
        {
          model: model.ProfilePhoneNumber,
          as: "profilePhoneNumbers",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: model.ProfileEmail,
          as: "profileEmails",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: model.ProfileWebsite,
          as: "profileWebsites",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: model.ProfileSocialMediaLink,
          as: "profileSocialMediaLinks",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          // where: {
          //   activeStatus: true,
          //   enableStatus: true,
          //   socialMediaName: { [Op.ne]: "" },
          // },
        },
        {
          model: model.ProfileDigitalPaymentLink,
          as: "profileDigitalPaymentLinks",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },

          // order: [["id", "DESC"]],
          // limit: 3,
        },
      ],
    });

    for (const profile of allProfile) {
      if (profile) {
        const profImages = await model.ProfileImages.findOne({
          where: {
            profileId: profile.id,
            type: 0,
          },
        });
        // console.log(profImages.image);
        // throw new Error(":dfd");
        // const signedUrl = await generateSignedUrl(profImages.image);

        profile.profileImage = profImages?.image || "";
      }

      profile.profileSocialMediaLinks.reverse();
      profile.profileDigitalPaymentLinks.reverse();
      let profileSocialMediaLinksArr = [];
      let profileDigitalPaymentLinksArr = [];

      if (profile.profileSocialMediaLinks.length > 0) {
        for (let i = 0; i < profile.profileSocialMediaLinks.length; i++) {
          const element = profile.profileSocialMediaLinks[i];
          if (
            !profileSocialMediaLinksArr.some(
              (a) => a.profileSocialMediaId === element.profileSocialMediaId
            )
          ) {
            profileSocialMediaLinksArr.push(element);
          }
        }
      }

      if (profile.profileDigitalPaymentLinks.length > 0) {
        for (let i = 0; i < profile.profileDigitalPaymentLinks.length; i++) {
          const element = profile.profileDigitalPaymentLinks[i];
          if (
            !profileDigitalPaymentLinksArr.some(
              (a) =>
                a.profileDigitalPaymentsId === element.profileDigitalPaymentsId
            )
          ) {
            profileDigitalPaymentLinksArr.push(element);
          }
        }
      }

      // Set to an empty array
      profile.setDataValue(
        "profileSocialMediaLinks",
        profileSocialMediaLinksArr
      );
      profile.setDataValue(
        "profileDigitalPaymentLinks",
        profileDigitalPaymentLinksArr
      );
    }

    const plainProfiles = allProfile.map((profile) => profile.toJSON());

    const profileIds = plainProfiles.map((profile) => profile.id);
    const deviceLinks = await model.DeviceLink.findAll({
      where: { profileId: profileIds },
      include: [
        { model: model.Template },
        { model: model.Mode },
        { model: model.DeviceBranding },
        { model: model.UniqueNameDeviceLink },
        {
          model: model.AccountDeviceLink,
          where: { isDeleted: false },
          include: [{ model: model.Device }],
        },
      ],
      raw: false,
    });

    const plainDeviceLinks = deviceLinks.map((device) => device.toJSON());

    // const profiles = plainDeviceLinks.map((device) => {
    //   const profile = plainProfiles.find((p) => p.id === device.profileId);

    //   if (!profile) return null;

    //   return {
    //     ...profile,
    //     DeviceLink: device,
    //   };
    // });

    // console.log(profiles);

    const profiles = plainProfiles.flatMap((profile) => {
      const devices = plainDeviceLinks.filter(
        (device) => device.profileId === profile.id
      );

      if (devices.length === 0) {
        return {
          ...profile,
          DeviceLink: null,
        };
      }

      return devices.map((device) => ({
        ...profile,
        DeviceLink: device,
      }));
    });

    console.log(profiles);

    const devices = await model.AccountDeviceLink.findAll({
      include: [
        {
          model: model.Device,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: model.DeviceLink,
          include: [
            {
              model: model.Profile,
            },
            {
              model: model.Template,
            },
            {
              model: model.Mode,
            },
            {
              model: model.DeviceBranding,
            },
            {
              model: model.AccountDeviceLink,
              where: {
                isDeleted: false,
              },
              include: [
                {
                  model: model.Device,
                },
              ],
            },
          ],
        },
      ],
      where: {
        userId: userId,
        isDeleted: false,
      },
    });
    // if (devices) {
    //   const imgPath = devices[0].DeviceLink.Profile.dataValues.profileImage;

    //   if (imgPath !== "") {
    //     const SignedImage = await generateSignedUrl(imgPath);
    //     devices[0].DeviceLink.Profile.dataValues.profileImage = SignedImage;
    //   }
    // }

    const profileImages = model.ProfileImages.findOne({
      where: {
        profileId: 4,
      },
    });

    return res.json({
      success: true,
      data: {
        message: "Profiles found",
        profiles,
        profileImages,
        devices,
      },
    });
  } catch (error) {
    console.log(error);
    loggers.error(error + "from findAllProfiles function");
    return res.json({
      success: false,
      data: {
        message: error.message,
      },
    });
  }
}

async function getProfile(req, res) {
  // const userId = req.user.id;
  const { profileId } = req.body;

  const userId = req.user.id;

  try {
    const profile = await model.Profile.findOne({
      where: {
        id: profileId,
        userId: userId,
      },
      include: [
        {
          model: model.DeviceLink,
          include: [
            {
              model: model.Template,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: model.Mode,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
        {
          model: model.Template,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: model.Mode,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: model.ProfilePhoneNumber,
          as: "profilePhoneNumbers",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: model.ProfileEmail,
          as: "profileEmails",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: model.ProfileWebsite,
          as: "profileWebsites",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: model.ProfileSocialMediaLink,
          as: "profileSocialMediaLinks",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: model.ProfileDigitalPaymentLink,
          as: "profileDigitalPaymentLinks",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
      required: false,
    });

    if (!profile) {
      throw new Error("Unable to find profile");
    }

    // console.log(profile,"prof data");

    const brandImgPath = profile.dataValues.brandingLogo;
    if (brandImgPath !== "") {
      const SignedImage = await generateSignedUrl(brandImgPath);
      profile.dataValues.brandingLogo = SignedImage;
    }

    const deviceBranding = await model.DeviceBranding.findAll({
      where: {
        profileId: profileId,
      },
    });

    const profileImgs = await model.ProfileImages.findAll({
      where: {
        profileId: profileId,
      },
    });

    const checkProfileId = await model.Profile.findOne({
      where: {
        id: profileId,
      },
    });
    let deviceUid;
    if (checkProfileId) {
      const checkDeviceLinkId = await model.DeviceLink.findOne({
        where: {
          profileId: checkProfileId.id,
        },
      });
      if (checkDeviceLinkId) {
        const checkAccountId = await model.AccountDeviceLink.findOne({
          where: {
            id: checkDeviceLinkId.accountDeviceLinkId,
          },
        });
        if (checkAccountId) {
          deviceUid = await model.Device.findOne({
            where: {
              id: checkAccountId.deviceId,
            },
          });
        }
      }
    }

    return res.json({
      success: true,
      data: {
        message: "Profile found",
        profile,
        profileImgs,
        deviceBranding,
        deviceUid,
      },
    });
  } catch (error) {
    console.log(error);
    loggers.error(error + "from getProfile function");
    return res.json({
      success: false,
      data: {
        message: error.message,
      },
    });
  }
}

async function getProfileOne(req, res) {
  // const userId = req.user.id;
  const { profileId, deviceLinkId } = req.body;

  const userId = req.user.id;

  try {
    let profile;
    if (deviceLinkId) {
      profile = await model.Profile.findOne({
        where: {
          id: profileId,
          userId: userId,
        },
        include: [
          {
            model: model.DeviceLink,
            where: {
              id: deviceLinkId,
            },
            include: [
              {
                model: model.Template,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
              },
              {
                model: model.Mode,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
              },
            ],
          },
          {
            model: model.Template,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.Mode,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfilePhoneNumber,
            as: "profilePhoneNumbers",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfileEmail,
            as: "profileEmails",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfileWebsite,
            as: "profileWebsites",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfileSocialMediaLink,
            as: "profileSocialMediaLinks",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            order: [["id", "DESC"]],
          },
          {
            model: model.ProfileDigitalPaymentLink,
            as: "profileDigitalPaymentLinks",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            order: [["id", "DESC"]],
          },
        ],
        required: false,
      });
    } else {
      console.log("inside else");
      profile = await model.Profile.findOne({
        where: {
          id: profileId,
          userId: userId,
        },
        include: [
          {
            model: model.DeviceLink,
            include: [
              {
                model: model.Template,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
              },
              {
                model: model.Mode,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
              },
            ],
          },
          {
            model: model.Template,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.Mode,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfilePhoneNumber,
            as: "profilePhoneNumbers",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfileEmail,
            as: "profileEmails",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfileWebsite,
            as: "profileWebsites",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfileSocialMediaLink,
            as: "profileSocialMediaLinks",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            order: [["id", "DESC"]],
          },
          {
            model: model.ProfileDigitalPaymentLink,
            as: "profileDigitalPaymentLinks",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            order: [["id", "DESC"]],
          },
        ],
        required: false,
      });
    }

    if (!profile) {
      throw new Error("Unable to find profile");
    }

    // console.log(profile,"prof data");

    const brandImgPath = profile.dataValues.brandingLogo;
    if (brandImgPath !== "") {
      const SignedImage = await generateSignedUrl(brandImgPath);
      profile.dataValues.brandingLogo = SignedImage;
    }

    profile.profileSocialMediaLinks.reverse();
    profile.profileDigitalPaymentLinks.reverse();
    let profileSocialMediaLinksArr = [];
    let profileDigitalPaymentLinksArr = [];

    if (profile?.profileSocialMediaLinks?.length) {
      for (let i = 0; i < profile.profileSocialMediaLinks.length; i++) {
        const element = profile.profileSocialMediaLinks[i];
        if (
          !profileSocialMediaLinksArr.some(
            (a) => a.profileSocialMediaId === element.profileSocialMediaId
          )
        ) {
          profileSocialMediaLinksArr.push(element);
        }
      }
    }

    if (profile?.profileDigitalPaymentLinks?.length) {
      for (let i = 0; i < profile.profileDigitalPaymentLinks.length; i++) {
        const element = profile.profileDigitalPaymentLinks[i];
        if (
          !profileDigitalPaymentLinksArr.some(
            (a) =>
              a.profileDigitalPaymentsId === element.profileDigitalPaymentsId
          )
        ) {
          profileDigitalPaymentLinksArr.push(element);
        }
      }
    }

    // Set to an empty array
    profile.setDataValue("profileSocialMediaLinks", profileSocialMediaLinksArr);
    profile.setDataValue(
      "profileDigitalPaymentLinks",
      profileDigitalPaymentLinksArr
    );

    let deviceBranding;
    if (deviceLinkId) {
      deviceBranding = await model.DeviceBranding.findAll({
        where: {
          profileId: profileId,
          deviceLinkId: deviceLinkId,
          brandingBackGroundColor: {
            [Op.ne]: "",
          },
        },
      });
    } else {
      deviceBranding = await model.DeviceBranding.findAll({
        where: {
          profileId: profileId,
          brandingBackGroundColor: {
            [Op.ne]: "",
          },
        },
      });
    }

    const profileImgs = await model.ProfileImages.findAll({
      where: {
        profileId: profileId,
      },
    });

    let deviceUid;
    if (profile) {
      let checkDeviceLinkId;
      if (deviceLinkId) {
        checkDeviceLinkId = await model.DeviceLink.findOne({
          where: {
            profileId: profile.id,
            id: deviceLinkId,
          },
        });
      } else {
        checkDeviceLinkId = await model.DeviceLink.findOne({
          where: {
            profileId: profile.id,
          },
        });
      }

      if (checkDeviceLinkId) {
        const checkAccountId = await model.AccountDeviceLink.findOne({
          where: {
            id: checkDeviceLinkId.accountDeviceLinkId,
          },
        });
        if (checkAccountId) {
          deviceUid = await model.Device.findOne({
            where: {
              id: checkAccountId.deviceId,
            },
          });
        }
      }
    }

    return res.json({
      success: true,
      data: {
        message: "Profile found",
        profile,
        profileImgs,
        deviceBranding,
        deviceUid,
      },
    });
  } catch (error) {
    console.log(error);
    loggers.error(error + "from getProfile function");
    return res.json({
      success: false,
      data: {
        message: error.message,
      },
    });
  }
}

async function changeProfile(req, res) {
  const userId = req.user.id;
  const { deviceId, profileId } = req.body;

  try {
    const checkProfile = await model.Profile.findOne({
      where: {
        id: profileId,
        userId,
      },
    });
    if (checkProfile) {
      const accountDeviceLink = await model.AccountDeviceLink.findOne({
        where: {
          deviceId,
          userId,
        },
      });
      if (accountDeviceLink) {
        const findAccountDeviceLinkId = await model.DeviceLink.findOne({
          where: {
            accountDeviceLinkId: accountDeviceLink.id,
            userId,
          },
        });
        if (findAccountDeviceLinkId) {
          await model.DeviceLink.update(
            {
              profileId,
            },
            {
              where: {
                accountDeviceLinkId: accountDeviceLink.id,
                userId,
              },
            }
          );
          return res.json({
            success: true,
            message: "Profile Changed Successfully",
          });
        } else {
          return res.json({
            success: false,
            message: "Link profile with a device",
          });
        }
      } else {
        return res.json({
          success: false,
          message: "Invalid Device",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "Profile Id  does not exists",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from changeProfile function");
    return res.json({
      success: false,
      message: error,
    });
  }
}

async function phoneNumberDelete(req, res) {
  const { phoneNumberId } = req.body;
  try {
    const checkPhoneNumber = await model.ProfilePhoneNumber.findOne({
      where: {
        id: phoneNumberId,
      },
    });
    if (checkPhoneNumber) {
      await model.ProfilePhoneNumber.update(
        {
          activeStatus: false,
        },
        {
          where: {
            id: phoneNumberId,
          },
        }
      );
      return res.json({
        success: true,
        message: "PhoneNumber Deleted Successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "PhoneNumber not found",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from phoneNumberDelete function");
    return res.json({
      success: false,
      message: error,
    });
  }
}

async function emailDelete(req, res) {
  const { emailIdNumber } = req.body;
  try {
    const checkEmail = await model.ProfileEmail.findOne({
      where: {
        id: emailIdNumber,
      },
    });
    if (checkEmail) {
      await model.ProfileEmail.update(
        {
          activeStatus: false,
        },
        {
          where: {
            id: emailIdNumber,
          },
        }
      );
      return res.json({
        success: true,
        message: "Email Deleted Successfully",
      });
    }
    return res.json({
      success: false,
      message: "Email not found",
    });
  } catch (error) {
    console.log(error);
    loggers.error(error + "from emailDelete function");
    return res.json({
      success: false,
      message: error,
    });
  }
}

async function websiteDelete(req, res) {
  const { websiteId } = req.body;
  try {
    const checkWebsite = await model.ProfileWebsite.findOne({
      where: {
        id: websiteId,
      },
    });
    if (checkWebsite) {
      await model.ProfileWebsite.update(
        {
          activeStatus: false,
        },
        {
          where: {
            id: websiteId,
          },
        }
      );
      return res.json({
        success: true,
        message: "Website Deleted Successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "Website not found",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from websiteDelete function");
    return res.json({
      success: false,
      message: error,
    });
  }
}

async function deleteSocialMedia(req, res) {
  const { profileSocialMediaLinkId } = req.body;
  try {
    const checkSocialMedia = await model.ProfileSocialMediaLink.findOne({
      where: {
        id: profileSocialMediaLinkId,
      },
    });
    if (checkSocialMedia) {
      const updateStatus = await model.ProfileSocialMediaLink.update(
        {
          activeStatus: false,
        },
        {
          where: {
            id: profileSocialMediaLinkId,
          },
        }
      );
      return res.json({
        success: true,
        message: "Social Media Deleted Successfully",
        updateStatus,
      });
    } else {
      return res.json({
        success: false,
        message: "Social Media not found",
      });
    }
  } catch (error) {
    loggers.error(error + "from deleteSocialMedia function");
    return res.json({
      success: false,
      message: error,
    });
  }
}

async function findSocialMediaId(req, res) {
  try {
    const socialMediaId = await model.ProfileSocialMedia.findAll({});
    return res.json({
      success: true,
      message: "Social Media Found Successfully",
      socialMediaId,
    });
  } catch (error) {
    console.log(error);
    loggers.error(error + "from findSocialMediaId function");
    return res.json({
      success: false,
      message: error,
    });
  }
}

async function deleteDigitalPayment(req, res) {
  const { profileDigitalPaymentLinkId } = req.body;
  try {
    const checkDigitalPayment = await model.ProfileDigitalPaymentLink.findOne({
      where: {
        id: profileDigitalPaymentLinkId,
      },
    });
    if (checkDigitalPayment) {
      await model.ProfileDigitalPaymentLink.update(
        {
          activeStatus: false,
        },
        {
          where: {
            id: profileDigitalPaymentLinkId,
          },
        }
      );

      return res.json({
        success: true,
        message: "Digital Payment deleted Successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "Digital Payment not found",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from deleteDigitalPayment function");
    return res.json({
      success: false,
      message: error,
    });
  }
}

async function getBase64ImageFromUrl(req, res) {
  const { profileId } = req.body;
  console.log(profileId, "uu");
  try {
    const checkDeviceId = await model.Device.findOne({
      where: {
        deviceUid: profileId,
      },
    });

    console.log(checkDeviceId.id, "aac id");
    const checkAccountDeviceLink = await model.AccountDeviceLink.findOne({
      where: {
        deviceId: checkDeviceId.id,
      },
    });
    console.log(checkAccountDeviceLink.id, "aac2 id");
    const checkDeviceLinks = await model.DeviceLink.findOne({
      where: {
        accountDeviceLinkId: checkAccountDeviceLink.id,
      },
    });
    console.log(checkDeviceLinks.id, "aac3 id");
    const checkProfileId = await model.ProfileImages.findOne({
      where: {
        profileId: checkDeviceLinks.profileId,
      },
    });

    if (!checkProfileId) {
      return res.json({
        success: false,
        message: "Unable to find the image",
      });
    }

    const profileImage = await model.ProfileImages.findAll({
      where: {
        profileId: checkProfileId.profileId,
      },
    });
    if (profileImage.length !== 0) {
      const lastItem = profileImage[profileImage.length - 2];
      if (lastItem) {
        let resp = await axios.get(lastItem.image, {
          responseType: "arraybuffer",
        });
        const baseUrl = Buffer.from(resp?.data, "binary").toString("base64");
        return res.json({
          success: true,
          baseUrl,
        });
      } else {
        let resp = await axios.get(profileImage[0].image, {
          responseType: "arraybuffer",
        });
        const baseUrl = Buffer.from(resp?.data, "binary").toString("base64");
        return res.json({
          success: true,
          baseUrl,
        });
      }
    } else {
      return res.json({
        success: false,

        message: "Something went wrong",
      });
    }
  } catch (e) {
    console.log(e);
    return res.json({
      success: false,
      message: e.message,
    });
  }
}

async function deleteBrandingImage(req, res) {
  const { profileId } = req.body;
  try {
    const checkProfileId = await model.Profile.findOne({
      where: {
        id: profileId,
      },
    });
    if (checkProfileId) {
      const getBrandingImage = await model.Profile.update(
        {
          brandingLogo: "",
        },
        {
          where: {
            id: profileId,
          },
        }
      );
      // if (getBrandingImage) {
      return res.json({
        success: true,
        message: "Image Deleted Successfully",
      });
      // }
    } else {
      return res.json({
        success: false,
        message: "profileId not Found",
      });
    }
  } catch (e) {
    console.log(e);
  }
}

async function deleteQrImage(req, res) {
  const { profileId } = req.body;
  try {
    const checkProfileId = await model.Profile.findOne({
      where: {
        id: profileId,
      },
    });
    if (checkProfileId) {
      const getQrImage = await model.Profile.update(
        {
          qrCodeImage: "",
        },
        {
          where: {
            id: profileId,
          },
        }
      );
      // if (getBrandingImage) {
      return res.json({
        success: true,
        message: "Image Deleted Successfully",
      });
      // }
    } else {
      return res.json({
        success: false,
        message: "Profile not Found",
      });
    }
  } catch (e) {
    console.log(e);
  }
}

async function deleteProfileImage(req, res) {
  const { profileId } = req.body;
  try {
    const checkProfileId = await model.ProfileImages.findAll({
      where: {
        profileId: profileId,
      },
    });
    if (checkProfileId) {
      const deleteImg = await model.ProfileImages.destroy({
        where: {
          profileId: profileId,
        },
      });
      if (deleteImg) {
        return res.json({
          success: true,
          message: "Delete Successfully",
        });
      } else {
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "Profile Not Found",
      });
    }
  } catch (e) {
    console.log(e);
  }
}

async function getUserDetails(req, res) {
  try {
    const userId = req.user.id;

    const user = await model.User.findOne({
      where: {
        id: userId,
      },
      attributes: [
        "firstName",
        "lastName",
        "phoneNumber",
        "email",
        "userImage",
      ],
    });

    if (!user) {
      return res.json({
        success: false,
        message: "Unable to get the user details",
      });
    }
    user.userImage = await generateSignedUrl(user.userImage);

    return res.json({
      success: true,
      message: "User information",
      user,
    });
  } catch (error) {
    loggers.error(error.message + "from get user details function");
    return res.json({
      success: false,
      message: `Something went wrong while getting th details : ${error.message}`,
    });
  }
}

async function updateProfileName(req, res) {
  try {
    const { profileId, profileName } = req.body;
    const userId = req.user.id;

    const availability = await model.Profile.findOne({
      where: {
        id: profileId,
        profileName: profileName,
        userId: userId,
      },
    });

    if (availability) {
      return res.json({
        success: false,
        message: "The profile name is already taken.",
      });
    } else {
      const updateProfileName = await model.Profile.update(
        {
          profileName: profileName,
        },
        {
          where: {
            id: profileId,
          },
        }
      );

      if (!updateProfileName) {
        return res.json({
          success: false,
          message: "Cannot update the profile. Contact Admin",
        });
      }

      return res.json({
        success: true,
        message: "Successfully updated",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function createAccountLink(data, userId) {
  try {
    const { deviceUid } = data;
    const device = await model.Device.findOne({
      where: {
        deviceUid: deviceUid,
      },
    });
    if (device) {
      const deviceId = device.id;
      //find if device ever bound to user
      const accountDeviceLink = await model.AccountDeviceLink.findOne({
        where: {
          deviceId,
        },
      });

      //device never linked before
      if (accountDeviceLink === null) {
        const createAccountLink = await model.AccountDeviceLink.create({
          deviceId,
          userId,
          isDeleted: false,
        });
        return {
          success: true,
          message: "Device Created Successfully",
          createAccountLink,
        };
      } else {
        //device already linked once and not deleted
        const checkDeviceStatus = await model.AccountDeviceLink.findOne({
          where: {
            deviceId,
            isDeleted: false,
          },
        }); //get the device row with deviceID

        //if never linked before or deleted atleast once
        if (checkDeviceStatus == null) {
          //check if same user
          const checkDeviceStatusForUser =
            await model.AccountDeviceLink.findOne({
              where: {
                deviceId,
                userId,
              },
            });

          if (checkDeviceStatusForUser) {
            // update the existing entry for the current user
            await model.AccountDeviceLink.update(
              {
                isDeleted: false,
              },
              {
                where: {
                  userId: checkDeviceStatusForUser.userId,
                  deviceId: checkDeviceStatusForUser.deviceId,
                },
              }
            );

            const createAccountLink = await model.AccountDeviceLink.findOne({
              where: {
                userId,
              },
            });
            return {
              success: true,
              message: "Device link updated successfully",
              createAccountLink,
            };
          } else {
            const createAccountLink = await model.AccountDeviceLink.create({
              deviceId,
              userId,
              isDeleted: false,
            });
            return {
              success: true,
              message: "Device Created Successfully",
              createAccountLink,
            };
          }
        } else {
          return {
            success: false,
            message: "device is already linked to another user",
          };
        }
      }
    }
  } catch (e) {
    console.log("Create complete profile error------", e);
  }
}

async function createProfile2(data, userId, accountDeviceLinkId) {
  const { profileName } = data;
  try {
    const profile = await model.Profile.findOne({
      where: {
        profileName,
        userId,
      },
    });
    if (profile) {
      return {
        success: false,
        message: "Profile name already exists",
      };
    }

    const checkAccountDeviceLink = await model.AccountDeviceLink.findOne({
      where: {
        id: accountDeviceLinkId,
        userId,
      },
    });
    if (checkAccountDeviceLink === null) {
      const create = await model.Profile.create({
        userId,
        profileName,
      });

      if (create) {
        return {
          success: true,
          message: "profile created",
          create,
        };
      }
    } else {
      const checkDeviceLink = await model.DeviceLink.findOne({
        where: {
          userId,
          accountDeviceLinkId: checkAccountDeviceLink.id,
        },
      });
      if (checkDeviceLink) {
        const create = await model.Profile.create({
          userId,
          profileName,
        });
        await model.DeviceLink.update(
          {
            profileId: create.id,
          },
          {
            where: {
              accountDeviceLinkId: checkAccountDeviceLink.id,
              userId,
            },
          }
        );
        let createDeviceLink = await model.DeviceLink.findOne({
          where: {
            accountDeviceLinkId,
            userId,
          },
        });
        return {
          success: true,
          message: "Profile created successfully",
          createDeviceLink,
        };
      } else {
        const createProfile = await model.Profile.create({
          userId,
          profileName,
        });
        const createDeviceLink = await model.DeviceLink.create({
          userId,
          accountDeviceLinkId: checkAccountDeviceLink.id,
          profileId: createProfile.id,
          activeStatus: true,
          templateId: 1,
          modeId: 2,
        });
        return {
          success: true,
          message: "Profile created and linked with Device",
          createDeviceLink,
        };
      }
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from createProfile function");
    return {
      success: false,
      message: error,
    };
  }
}

async function updateProfile2(data, userId, deviceLinkId, profileId) {
  const {
    templateId,
    profileImage,
    darkMode,
    firstName,
    lastName,
    designation,
    companyName,
    companyAddress,
    shortDescription,
    address,
    city,
    zipCode,
    state,
    country,
    brandingFontColor,
    brandingBackGroundColor,
    brandingAccentColor,
    brandingFont,
    phoneNumbers,
    phoneNumberEnable,
    emailIds,
    emailEnable,
    websites,
    websiteEnable,
    socialMediaNames,
    socialMediaEnable,
    digitalPaymentLinks,
    digitalMediaEnable,
  } = data;

  const phoneNumbersLength = phoneNumbers.length;
  const emailIdLength = emailIds.length;
  const websiteLength = websites.length;
  const socialMediaLength = socialMediaNames.length;
  const digitalPaymentLinkLength = digitalPaymentLinks.length;

  try {
    const profile = await model.Profile.findOne({
      where: {
        id: profileId,
        userId,
      },
    });

    if (profile) {
      await model.Profile.update(
        {
          id: profileId,
          darkMode,
          firstName,
          lastName,
          designation,
          companyName,
          companyAddress,
          shortDescription,
          address,
          city,
          zipCode,
          state,
          country,
          brandingFontColor,
          brandingBackGroundColor,
          brandingAccentColor,
          brandingFont,
          phoneNumberEnable,
          emailEnable,
          websiteEnable,
          socialMediaEnable,
          digitalMediaEnable,
          profileImage,
          templateId: templateId,
        },
        {
          where: {
            id: profileId,
            userId: userId,
          },
        }
      );

      if (templateId !== null) {
        const deviceLink = await model.DeviceLink.findOne({
          where: { id: deviceLinkId, userId: userId },
        });

        if (deviceLink) {
          const deviceBranding = await model.DeviceBranding.findOne({
            where: {
              deviceLinkId: deviceLink.id,
              profileId: profileId,
              templateId: templateId,
            },
          });
          console.log("Came in if device", deviceBranding);
          if (deviceBranding) {
            await model.DeviceBranding.update(
              {
                darkMode: darkMode,
                brandingFontColor: brandingFontColor,
                brandingBackGroundColor: brandingBackGroundColor,
                brandingAccentColor: brandingAccentColor,
              },
              {
                where: {
                  deviceLinkId: deviceLink.id,
                  profileId: profileId,
                  templateId: templateId,
                },
              }
            );
          } else {
            await model.DeviceBranding.create({
              deviceLinkId: deviceLink.id,
              profileId: profileId,
              templateId: templateId,
              darkMode: darkMode,
              brandingFontColor: brandingFontColor,
              brandingBackGroundColor: brandingBackGroundColor,
              brandingAccentColor: brandingAccentColor,
            });
          }
        } else {
          console.log("Came in else device");
          const deviceBrandingWithoutProfile =
            await model.DeviceBranding.findOne({
              where: {
                profileId: profileId,
                templateId: templateId,
              },
            });
          if (deviceBrandingWithoutProfile) {
            await model.DeviceBranding.update(
              {
                darkMode: darkMode,
                brandingFontColor: brandingFontColor,
                brandingBackGroundColor: brandingBackGroundColor,
                brandingAccentColor: brandingAccentColor,
              },
              {
                where: {
                  // deviceLinkId: deviceLink.id,
                  profileId: profileId,
                  templateId: templateId,
                },
              }
            );
          } else {
            await model.DeviceBranding.create({
              // deviceLinkId: deviceLink.id,
              profileId: profileId,
              templateId: templateId,
              darkMode: darkMode,
              brandingFontColor: brandingFontColor,
              brandingBackGroundColor: brandingBackGroundColor,
              brandingAccentColor: brandingAccentColor,
            });
          }
        }
      }

      if (phoneNumbersLength > 0) {
        const phoneNumber = await phoneNumbers.map((phone) => {
          return {
            profileId: profileId,
            phoneNumberId: phone.phoneNumberId,
            countryCode: phone.countryCode,
            phoneNumber: phone.phoneNumber,
            phoneNumberType: phone.phoneNumberType,
            checkBoxStatus: phone.checkBoxStatus,
            activeStatus: phone.activeStatus,
          };
        });
        for (let i = 0; i < phoneNumbersLength; i++) {
          if (phoneNumber[i].phoneNumberId === null) {
            await model.ProfilePhoneNumber.create({
              profileId: phoneNumber[i].profileId,
              phoneNumber: phoneNumber[i].phoneNumber,
              phoneNumberType: phoneNumber[i].phoneNumberType,
              countryCode: phoneNumber[i].countryCode,
              checkBoxStatus: phoneNumber[i].checkBoxStatus,
              activeStatus: phoneNumber[i].activeStatus,
            });
          } else {
            await model.ProfilePhoneNumber.update(
              {
                profileId: phoneNumber[i].profileId,
                phoneNumber: phoneNumber[i].phoneNumber,
                phoneNumberType: phoneNumber[i].phoneNumberType,
                countryCode: phoneNumber[i].countryCode,
                checkBoxStatus: phoneNumber[i].checkBoxStatus,
                activeStatus: phoneNumber[i].activeStatus,
              },
              {
                where: {
                  id: phoneNumber[i].phoneNumberId,
                },
              }
            );
          }
        }
      }

      if (emailIdLength > 0) {
        const emailId = await emailIds.map((email) => {
          return {
            profileId: profileId,
            emailIdNumber: email.emailIdNumber,
            emailId: email.emailId,
            emailType: email.emailType,
            checkBoxStatus: email.checkBoxStatus,
            activeStatus: email.activeStatus,
          };
        });
        for (let j = 0; j < emailIdLength; j++) {
          if (emailId[j].emailIdNumber === null) {
            await model.ProfileEmail.create({
              profileId: emailId[j].profileId,
              emailId: emailId[j].emailId,
              emailType: emailId[j].emailType,
              checkBoxStatus: emailId[j].checkBoxStatus,
              activeStatus: emailId[j].activeStatus,
            });
          } else {
            await model.ProfileEmail.update(
              {
                profileId: emailId[j].profileId,
                emailId: emailId[j].emailId,
                emailType: emailId[j].emailType,
                checkBoxStatus: emailId[j].checkBoxStatus,
                activeStatus: emailId[j].activeStatus,
              },
              {
                where: {
                  id: emailId[j].emailIdNumber,
                },
              }
            );
          }
        }
      }

      if (websiteLength > 0) {
        const website = await websites.map((web) => {
          return {
            profileId: profileId,
            websiteId: web.websiteId,
            website: web.website,
            websiteType: web.websiteType,
            checkBoxStatus: web.checkBoxStatus,
            activeStatus: web.activeStatus,
          };
        });
        for (let k = 0; k < websiteLength; k++) {
          if (website[k].websiteId === null) {
            await model.ProfileWebsite.create({
              profileId: website[k].profileId,
              website: website[k].website,
              websiteType: website[k].websiteType,
              checkBoxStatus: website[k].checkBoxStatus,
              activeStatus: website[k].activeStatus,
            });
          } else {
            await model.ProfileWebsite.update(
              {
                profileId: website[k].profileId,
                website: website[k].website,
                websiteType: website[k].websiteType,
                checkBoxStatus: website[k].checkBoxStatus,
                activeStatus: website[k].activeStatus,
              },
              {
                where: {
                  id: website[k].websiteId,
                },
              }
            );
          }
        }
      }

      if (socialMediaLength > 0) {
        await updateSocialMedia(socialMediaNames, socialMediaLength, profileId);
      }

      if (digitalPaymentLinkLength > 0) {
        await updateProfileDigitalPaymentLinks(
          digitalPaymentLinks,
          digitalPaymentLinkLength,
          profileId
        );
      }
      const profile = await model.Profile.findOne({
        where: {
          id: profileId,
          userId,
        },
        include: [
          {
            model: model.ProfilePhoneNumber,
            as: "profilePhoneNumbers",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfileEmail,
            as: "profileEmails",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfileWebsite,
            as: "profileWebsites",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfileSocialMediaLink,
            as: "profileSocialMediaLinks",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: model.ProfileDigitalPaymentLink,
            as: "profileDigitalPaymentLinks",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        ],
      });
      let deviceLink;
      if (deviceLinkId) {
        deviceLink = await model.DeviceLink.findOne({
          where: {
            id: deviceLinkId,
          },
          include: {
            model: model.DeviceBranding,
          },
        });
      }

      return {
        success: true,
        message: "updated",
        profile,
        deviceLink,
      };
    } else {
      return {
        success: false,
        message: "Profile not found",
      };
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from updateProfile fun");
    return {
      success: false,
      message: error,
    };
  }
}

async function createCompleteProfile(data, userId) {
  const { email } = data;
  const accountLinkResponse = await createAccountLink(data, userId);
  if (accountLinkResponse?.success) {
    const createProfileResponse = await createProfile2(
      data,
      userId,
      accountLinkResponse?.createAccountLink?.id
    );
    if (createProfileResponse?.success) {
      const updateResponse = await updateProfile2(
        data,
        userId,
        createProfileResponse?.createDeviceLink?.id,
        createProfileResponse?.createDeviceLink?.profileId
      );
      if (updateResponse?.success) {
        return { email: email, message: "Profile updated successfully" };
      } else {
        return { email: email, message: "Profile updated failed" };
      }
    } else {
      return {
        email: email,
        message: createProfileResponse?.message,
      };
    }
  } else {
    return {
      email: email,
      message: accountLinkResponse?.message,
    };
  }
}

async function createCompleteProfileBulk(req, res) {
  let response = [];
  try {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const { profileData } = req?.body;
    if (profileData?.length > 0) {
      response = await Promise.all(
        profileData.map(async (record) => {
          const user = await model.User.findOne({
            where: { email: record?.email },
          });
          if (user?.id) {
            const response = await createCompleteProfile(record, user?.id);
            return response;
          } else {
            return {
              email: record?.email,
              message: "User Not found",
            };
          }
        })
      );
      res.json(response);
    } else {
      res.json({
        message: "Invalid Data",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from updateProfile fun");
    return res.json({
      success: false,
      message: error,
    });
  }
}

export {
  updateProfileLatest,
  createProfile,
  getProfileByDevice,
  updateProfile,
  findAllProfiles,
  getProfile,
  changeProfile,
  phoneNumberDelete,
  emailDelete,
  websiteDelete,
  deleteSocialMedia,
  deleteDigitalPayment,
  findSocialMediaId,
  getProfileImage,
  getProfileImageForLeadGen,
  getBase64ImageFromUrl,
  deleteBrandingImage,
  deleteQrImage,
  deleteProfileImage,
  getUserDetails,
  getProfileName,
  updateProfileName,
  createCompleteProfileBulk,
  getProfileOne,
  findAllProfilesForMob,
  createProfileLatest
};
