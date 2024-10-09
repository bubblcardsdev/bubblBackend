import model from "../models/index.js";
import {
  createProfileSchema,
  updateProfileSchema,
} from "../validations/profile.js";
import { updateProfileDigitalPaymentLinks } from "../functions/updateDigitalPayment.js";
import { updateSocialMedia } from "../functions/updateSocialMedia.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";
import loggers from "../config/logger.js";
import axios from "axios";

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
      attributes: ["id", "profileName"],
      include: {
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

async function updateProfile2(data, userId, deviceLinkId,profileId) {
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

async function createCompleteProfile(data,userId) {
  const { email } = data;
  const accountLinkResponse = await createAccountLink(data,userId);
  if (accountLinkResponse?.success) {
    const createProfileResponse = await createProfile2(data,userId,accountLinkResponse?.createAccountLink?.id);
    if (createProfileResponse?.success) {
      const updateResponse = await updateProfile2(
        data,
        userId,
        createProfileResponse?.createDeviceLink?.id,
        createProfileResponse?.createDeviceLink?.profileId
      );
      return { email: email, message: updateResponse?.message };
      
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
  try {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const { profileData } = req?.body;
    if (profileData?.length > 0) {
      profileData.map(async (record) => {
        const user = await model.User.findOne({
          where: { email: record?.email },
        });
        if (user?.id) {
          const response = await createCompleteProfile(record, user?.id);
          res.json(response);
        } else {
          res.json({
            email: record?.email,
            message: "User Not found",
          });
        }
      });
    }
    else{
      res.json({
        message:"Invalid Data"
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
};
