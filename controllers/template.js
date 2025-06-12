import loggers from "../config/logger.js";
import model from "../models/index.js";
import { template } from "../validations/template.js";

async function findAllTemplate(req, res) {
  try {
    const template = await model.Template.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    return res.json({
      success: true,
      message: "Templates Found",
      template,
    });
  } catch (error) {
    loggers.error(error + "from findAllTemplate function");
    return res.json({
      success: false,
      message: error,
    });
  }
}

async function selectTemplate(req, res) {
  const { deviceId, profileId, templateNameId } = req.body;
  const { error } = template.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    if (deviceId) {
      let deviceLink = await model.DeviceLink.findOne({
        where: {
          id: deviceId,
        },
      });

      if (deviceLink) {
        let checkTemplate = await model.Template.findOne({
          where: {
            templateNameId: templateNameId,
          },
        });

        if (!checkTemplate) {
          return res.json({
            success: false,
            message: "cannot find the template you have defined",
          });
        }

        await model.DeviceLink.update(
          {
            templateId: checkTemplate.id,
          },
          { where: { id: deviceLink.id } }
        );
        const checkDeviceBrandingForTemplate =
          await model.DeviceBranding.findOne({
            where: {
              profileId: profileId,
              templateId: checkTemplate.id,
            },
          });
        if (!checkDeviceBrandingForTemplate) {
          console.log("Inside if");
          await model.DeviceBranding.create({
            templateId: checkTemplate.id,
            deviceLinkId: deviceId,
            profileId: profileId,
          });
          // await model.DeviceBranding.update(
          //   {
          //     templateId: checkTemplate.id,
          //   },
          //   {
          //     where: {
          //       deviceLinkId: deviceId,
          //       profileId: profileId,
          //     },
          //   }
          // );
          // } else {
          //   console.log("Inside else");
          //   // await model.DeviceBranding.create({
          //   //   templateId: checkTemplate.id,
          //   //   deviceLinkId: deviceId,
          //   //   profileId: profileId,
          //   // });
        }

        if (profileId) {
          await model.Profile.update(
            {
              templateId: checkTemplate.id,
            },
            {
              where: {
                id: profileId,
              },
            }
          );
        }
        return res.json({
          success: true,
          message: "Template Updated Successfully",
        });
      } else {
        return res.json({
          success: false,
          message: "cannot find the template you have defined",
        });
      }
    } else {
      let checkTemplate = await model.Template.findOne({
        where: {
          templateNameId: templateNameId,
        },
      });
      if (!checkTemplate) {
        return res.json({
          success: false,
          message: "cannot find the template you have defined",
        });
      }
      if (profileId) {
        await model.Profile.update(
          {
            templateId: checkTemplate.id,
          },
          {
            where: {
              id: profileId,
            },
          }
        );
        const checkDeviceBrandingForTemplate =
          await model.DeviceBranding.findOne({
            where: {
              profileId: profileId,
              templateId: checkTemplate.id,
            },
          });
        if (checkDeviceBrandingForTemplate) {
          await model.DeviceBranding.update(
            {
              templateId: checkTemplate.id,
            },
            {
              where: {
                profileId: profileId,
              },
            }
          );
        } else {
          await model.DeviceBranding.create({
            templateId: checkTemplate.id,
            profileId: profileId,
          });
        }
      }
      return res.json({
        success: true,
        message: "Template Updated Successfully",
      });
    }
  } catch (error) {
    console.log(error.message);
    loggers.error(error + "from selectTemplate function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function switchTemplate(req, res) {
  const { deviceId, templateNameId, profileId } = req.body;

  try {
    const device = await model.Device.findOne({
      where: {
        id: deviceId,
      },
    });
    const checkAccLinkId = await model.AccountDeviceLink.findOne({
      where: {
        deviceId: device.id,
      },
    });
    if (device) {
      const accountDeviceLinkId = checkAccLinkId.id;
      const checkProfileDeviceLink = await model.DeviceLink.findOne({
        where: {
          accountDeviceLinkId: accountDeviceLinkId,
        },
      });
      if (checkProfileDeviceLink) {
        const checkTemplate = await model.Template.findOne({
          where: {
            templateNameId: templateNameId,
          },
        });
        if (checkTemplate) {
          const deviceTemplate = await model.DeviceLink.findOne({
            where: {
              // templateId: checkTemplate.id,
              id: checkProfileDeviceLink.id,
              profileId: profileId,
            },
          });
          if (deviceTemplate) {
            await model.DeviceLink.update(
              {
                templateId: checkTemplate.id,
              },
              {
                where: {
                  profileId: profileId,
                  id: checkProfileDeviceLink.id,
                },
              }
            );
            await model.Profile.update(
              {
                templateId: checkTemplate.id,
              },
              {
                where: {
                  id: profileId,
                },
              }
            );

            return res.json({
              success: true,
              message: "Successfully updated",
            });
          } else {
            console.log("inside else");
            await model.DeviceLink.update(
              {
                templateId: checkTemplate.id,
              },
              {
                where: {
                  profileId: profileId,
                },
              }
            );
            await model.Profile.update(
              {
                templateId: checkTemplate.id,
              },
              {
                where: {
                  id: profileId,
                },
              }
            );

            return res.json({
              success: true,
              message: "Successfully updated",
            });
          }
        } else {
          return res.status(500).json({
            success: false,
            message: " Invalid template",
          });
        }
      } else {
        return res.status(500).json({
          success: false,
          message: " Invalid device",
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        message: "Check your Device Number",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from switchTemplate function");
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
}
export { findAllTemplate, switchTemplate, selectTemplate };
