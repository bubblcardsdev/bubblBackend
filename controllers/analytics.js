/* eslint-disable no-unused-vars */
import { Op } from "sequelize";
import loggers from "../config/logger.js";
import model from "../models/index.js";
import {
  AnalyticsService,
  GetTapsDataService,
  getModeUsageService,
  getSocialTapsService,
  getPaymentTapsService,
  getContactTapsService,
  getLeadGenDataService,
  getUserDevicesService,
  getDeviceTypeService,
} from "../services/analyticsService.js";
import { createLeadSchema, updateLeadSchema } from "../validations/lead.js";

//TODO: Chnage name to create tap details
async function createTapDetails(req, res) {
  const remoteIp = req.ip;
  const webHeaders = req.headers;
  const webHeaderString = JSON.stringify(webHeaders);

  const { deviceId, clickAction } = req.body;

  try {
    // check the device id
    const checkDeviceId = await model.Device.findOne({
      where: {
        deviceUid: deviceId,
      },
    });

    if (checkDeviceId) {
      // check the device id in link table
      const checkDeviceAccLinkId = await model.AccountDeviceLink.findOne({
        where: {
          deviceId: checkDeviceId.id,
        },
      });

      const accountDeviceLinkId = checkDeviceAccLinkId.id;
      // check  link id in link table
      const accountDeviceLink = await model.DeviceLink.findOne({
        where: {
          accountDeviceLinkId: accountDeviceLinkId,
        },
      });

      // if id exist means it create one record in analytics table
      if (accountDeviceLink) {
        // to check the click action

        const getActionId = await model.ActionLookUp.findOne({
          where: {
            id: clickAction,
          },
        });

        const getUserId = checkDeviceAccLinkId.userId;
        const createAnalytics = await model.Analytics.create({
          userId: getUserId,
          deviceId: checkDeviceId.id,
          modeId: accountDeviceLink.modeId,
          actionId: getActionId.id,
          ipAddress: remoteIp,
          webHeader: webHeaderString,
        });

        return res.json({
          success: true,
          message: "Tap has been recorded",
          // createAnalytics,
        });
      }
    } else {
      // check the device id in link table
      const checkDeviceAccLinkId = await model.AccountDeviceLink.findOne({
        where: {
          deviceId: deviceId,
        },
      });

      const accountDeviceLinkId = checkDeviceAccLinkId.id;
      // check  link id in link table
      const accountDeviceLink = await model.DeviceLink.findOne({
        where: {
          accountDeviceLinkId: accountDeviceLinkId,
        },
      });

      const getActionId = await model.ActionLookUp.findOne({
        where: {
          id: clickAction,
        },
      });

      const getUserId = checkDeviceAccLinkId.userId;
      const createAnalytics = await model.Analytics.create({
        userId: getUserId,
        deviceId: deviceId,
        modeId: accountDeviceLink.modeId,
        actionId: getActionId.id,
        ipAddress: remoteIp,
        webHeader: webHeaderString,
      });

      return res.json({
        success: true,
        message: "Tap has been recorded",
        // createAnalytics,
      });
    }
  } catch (error) {
    loggers.error(error + "from getTapDetails function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function createLead (req, res)  {
  const userId = req.user.id;
  const { name, emailId, mobileNumber, location, where_you_met, company } = req.body;
  try {
 const { error } = createLeadSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        data: { error: error.details },
      });
    }
    const lead = await model.LeadGen.create({
      userId,
      name,
      emailId: emailId || "",
      mobileNumber,
      location: location || null,
      where_you_met: where_you_met || null,
      company: company || null,
      isManual:true
    });

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create lead",
      error: error.message,
    });
  }
};

async function deleteLead(req, res) {
  const userId = req.user.id; 
  const { leadId } = req.query;

 if (!leadId) {
  return res.status(400).json({
    success: false,
    message: "leadId is required to delete a lead",
  });
}


  try {
    // First find the lead that belongs to the user and isManual
    const lead = await model.LeadGen.findOne({
      where: {
        id: leadId,
        userId,
        isManual: true, // Only allow deleting manual leads
      },
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found or cannot be deleted",
      });
    }

    // Delete the lead
    await lead.destroy();

    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete lead",
      error: error.message,
    });
  }
}


async function updateLead(req, res) {
  const userId = req.user.id;
  const { id, name, emailId, mobileNumber, location, where_you_met, company } = req.body;

  try {
     const { error } = updateLeadSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        data: { error: error.details },
      });
    }

    const [rowsUpdated] = await model.LeadGen.update(
      {
        name,
        emailId: emailId || "",
        mobileNumber,
        location: location || null,
        where_you_met: where_you_met || null,
        company: company || null,
      },
      {
        where: { id, userId }, // make sure the lead belongs to this user
      }
    );

    if (rowsUpdated === 0) {
      return res.status(404).json({
        success: false,
        message: `Lead with id ${id} not found or you don't have permission`,
      });
    }

    // Fetch the updated record manually (since MySQL doesn’t return it)
    const updatedLead = await model.LeadGen.findOne({ where: { id, userId } });

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update lead",
      error: error.message,
    });
  }
}

async function getLeadsDetails(req, res) {
  try {
    const getLeads = await model.LeadGen.findAll();
    return res.json({
      success: true,
      getLeads,
    });
  } catch (e) {
    console.log(e);
    loggers.error(e + "from getLeadsDetails function");
  }
}

async function getLeadsById(req, res) {
  const userId =req.user.id
  try {
    const getLeads = await model.LeadGen.findAll({
      where:{
        userId:userId
      }
    });
    return res.json({
      success: true,
      getLeads,
    });
  } catch (e) {
    console.log(e);
    loggers.error(e + "from getLeadsDetails function");
  }
}

async function getSupportFormLeads(req,res){

  try{
const leads = await model.SupportForm.findAll({
  order:[['createdAt','DESC']]
})
return res.status(200).json({
  success:true,
  data:leads
})
  }
  catch(err){
loggers.error(err + "from getSupportFormLeads function");
return res.status(400).json({
  success:false,
  error:err
})
  }
}

async function getAnalyticsDetails(req, res) {
  const deviceId = req.body;
  try {
    const getAnalytics = await AnalyticsService(req, res, deviceId);
    return getAnalytics;
  } catch (e) {
    console.log(e);
    loggers.error(e + "from getAnalyticsDetails function");
  }
}

// Data for Taps Tile
async function getTapsDataByDevice(req, res) {
  const deviceName = req.body.deviceId;
  const timeRange = req.body.range;
  try {
    const getTapsData = await GetTapsDataService(
      req,
      res,
      deviceName,
      timeRange
    );
    return getTapsData;
  } catch (e) {
    console.log(e);
    loggers.error(e + "from getTapsDataByDevice function");
  }
}

async function getModeUsageByDevice(req, res) {
  const deviceName = req.body.deviceId;
  const timeRange = req.body.range;
  try {
    const getTapsData = await getModeUsageService(
      req,
      res,
      deviceName,
      timeRange
    );
    return getTapsData;
  } catch (e) {
    console.log(e);
    loggers.error(e + "from getModeUsageByDevice function");
  }
}

async function getSocailTapsByDevice(req, res) {
  const deviceName = req.body.deviceId;
  const timeRange = req.body.range;
  try {
    const getSocialTaps = await getSocialTapsService(
      req,
      res,
      deviceName,
      timeRange
    );
    return getSocialTaps;
  } catch (e) {
    console.log(e);
    loggers.error(e + "from getSocailTapsByDevice function");
  }
}

async function getPaymentsTaps(req, res) {
  const deviceName = req.body.deviceId;
  const timeRange = req.body.range;
  try {
    const getSocialTaps = await getPaymentTapsService(
      req,
      res,
      deviceName,
      timeRange
    );
    return getSocialTaps;
  } catch (e) {
    console.log(e);
    loggers.error(e + "from getPaymentsTaps function");
  }
}

async function getContactsTapsByDevice(req, res) {
  const deviceName = req.body.deviceId;
  const timeRange = req.body.range;
  try {
    const getSocialTaps = await getContactTapsService(
      req,
      res,
      deviceName,
      timeRange
    );
    return getSocialTaps;
  } catch (e) {
    console.log(e);
    loggers.error(e + "from getContactsTapsByDevice function");
  }
}

async function getLeadGenDataByDeviceId(req, res) {
  const deviceName = req.body.deviceId;
  const timeRange = req.body.range;
  try {
    const getSocialTaps = await getLeadGenDataService(
      req,
      res,
      deviceName,
      timeRange
    );
    return getSocialTaps;
  } catch (e) {
    console.log(e);
    loggers.error(e + "from getLeadGenDataByDeviceId function");
  }
}

async function getUserDevices(req, res) {
  try {
    const getUserDevices = await getUserDevicesService(req, res);
    return getUserDevices;
  } catch (e) {
    console.log(e);
    loggers.error(e + "from getUserDevices function");
  }
}

async function getDeviceTypes(req, res) {
  const deviceName = req.body.deviceId;
  const timeRange = req.body.range;
  try {
    const getDeviceType = await getDeviceTypeService(
      req,
      res,
      deviceName,
      timeRange
    );
    return getDeviceType;
  } catch (e) {
    console.log(e);
    loggers.error(e + "from getDeviceTypes function");
  }
}

async function getOverView(req, res) {
  const userId = req.user.id;
console.log(userId);

  try {
    // --- Profiles & Devices ---
    const totalProfiles = await model.Profile.count({ where: { userId } });
    const totalDevices = await model.DeviceLink.count({ where: { userId } });

    // --- Date Ranges ---
    const now = new Date();
    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);   // last 7 days
    const prev7Days = new Date(now - 14 * 24 * 60 * 60 * 1000);  // 7–14 days ago

    // --- Leads (Current & Previous 7 days) ---
    const currentLeads = await model.LeadGen.count({
      where: {
        userId,
        createdAt: {
          [Op.gte]: last7Days,
          [Op.lte]: now,
        },
      },
    });

    const previousLeads = await model.LeadGen.count({
      where: {
        userId,
        createdAt: {
          [Op.gte]: prev7Days,
          [Op.lt]: last7Days,
        },
      },
    });

    let leadGenerationIncrementPercentage = 0;
    if (previousLeads > 0) {
      leadGenerationIncrementPercentage =
        ((currentLeads - previousLeads) / previousLeads) * 100;
    } else if (currentLeads > 0) {
      leadGenerationIncrementPercentage = 100;
    }

    // --- Taps (from Analytics table, Current & Previous 7 days) ---
    const currentTaps = await model.Analytics.count({
      where: {
        userId,
        createdAt: {
          [Op.gte]: last7Days,
          [Op.lte]: now,
        },
      },
    });

    const previousTaps = await model.Analytics.count({
      where: {
        userId,
        createdAt: {
          [Op.gte]: prev7Days,
          [Op.lt]: last7Days,
        },
      },
    });

    let totalTapIncrementPercentage = 0;
    if (previousTaps > 0) {
      totalTapIncrementPercentage =
        ((currentTaps - previousTaps) / previousTaps) * 100;
    } else if (currentTaps > 0) {
      totalTapIncrementPercentage = 100;
    }

    // --- Response ---
    return res.json({
      success: true,
      message: "Account overview fetched successfully",
      data: {
        totalProfiles,
        totalDevices,
        leadGenerationCountLast7days: currentLeads,
        leadGenerationIncrementPercentage,
        totalTapCountLast7days: currentTaps,
        totalTapIncrementPercentage,
      },
    });
  } catch (err) {
    console.error("Error in getOverView:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch account overview",
      error: err.message,
      
    });
  }
}

export {
  getLeadsDetails,
  getAnalyticsDetails,
  getTapsDataByDevice,
  getModeUsageByDevice,
  getSocailTapsByDevice,
  getPaymentsTaps,
  getContactsTapsByDevice,
  getLeadGenDataByDeviceId,
  getUserDevices,
  getDeviceTypes,
  getOverView,
  createTapDetails,
  getSupportFormLeads,
  createLead,
  updateLead,
  getLeadsById,
  deleteLead
};
