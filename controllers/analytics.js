/* eslint-disable no-unused-vars */
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

//TODO: Chnage name to create tap details
async function getTapDetails(req, res) {
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

export {
  getTapDetails,
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
};
