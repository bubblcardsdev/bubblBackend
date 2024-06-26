import model from "../models/index.js";
import getTodate from "../helper/analyticsDateTImeHelper.js";
import { Op } from "sequelize";

const getDeviceID = async (deviceName) => {
  const linkId = await model.Device.findOne({
    where: { deviceUid: deviceName },
  });
  let deviceLinkId;
  if (linkId) {
    deviceLinkId = await model.AccountDeviceLink.findOne({
      where: {
        deviceId: linkId.id,
      },
    });
  }
  const deviceId = deviceLinkId;

  return deviceId;
};

const getDeviceTypes = (data) => {

  const lowerData = data.toLowerCase();
  if (lowerData.includes("android")) {
    return 0;
  } else if (lowerData.includes("iphone")) {
    return 1;
  } else {
    return 2;
  }
};

async function getDeviceTypeService(req, res, deviceName, timeRange) {
  const userId = req.user.id;

  const deviceId = await getDeviceID(deviceName);
  const Today = new Date();
  const ToDate = getTodate(timeRange);

  let getDeviceType = [];

  if (deviceName === "All") {
    getDeviceType = await model.Analytics.findAll({
      attributes: ["webHeader"],
      where: {
        userId: userId,
        createdAt: {
          [Op.between]: [ToDate, Today],
        },
      },
    });
  } else {
    getDeviceType = await model.Analytics.findAll({
      attributes: ["webHeader"],
      where: {
        deviceId: deviceId.deviceId,
        createdAt: {
          [Op.between]: [ToDate, Today],
        },
      },
    });
  }

  let iosCount = 0;
  let androidCount = 0;
  let othersCount = 0;

  const devieTyp = getDeviceType.map((data) => {
    const headerData = data["webHeader"];
    const jsonObject = JSON.parse(headerData);
    console.log(jsonObject, "d");
    const deviceTypeVal = getDeviceTypes(jsonObject["user-agent"]);
    console.log(deviceTypeVal, "deviceTypesss");
    switch (deviceTypeVal) {
      case 0: {
        androidCount += 1;
      }
      case 1: {
        iosCount += 1;
        
      }
      default: {
        othersCount += 1;
      }
    }
  });

  return res.json({
    success: true,
    iosCount,
    androidCount,
    othersCount,
  });
}

// Data for Taps Tile
async function GetTapsDataService(req, res, deviceName, timeRange) {
  const userId = req.user.id;
  let getTotalTapsData = [];
  if (deviceName === "All") {
    getTotalTapsData = await model.Analytics.findAll({
      where: {
        userId: userId,
      },
    });
  } else {
    const deviceId = await getDeviceID(deviceName);

    getTotalTapsData = await model.Analytics.findAll({
      where: {
        userId: userId,
        deviceId: deviceId.deviceId,
      },
    });
  }

  const totalTaps = getTotalTapsData.length;

  const Today = new Date();
  const ToDate = getTodate(timeRange);

  let getTotalTapsDataForTimeRange = "";
  if (deviceName === "All") {
    getTotalTapsDataForTimeRange = await model.Analytics.findAll({
      where: {
        userId: userId,
        createdAt: {
          [Op.between]: [ToDate, Today],
        },
      },
    });
  } else {
    const deviceId = await getDeviceID(deviceName);

    getTotalTapsDataForTimeRange = await model.Analytics.findAll({
      where: {
        userId: userId,
        deviceId: deviceId.deviceId,
        createdAt: {
          [Op.between]: [ToDate, Today],
        },
      },
    });
  }

  const tapsTimeRange = getTotalTapsDataForTimeRange.length;

  return res.json({
    success: true,
    totalTaps,
    tapsTimeRange,
  });
}

//Data for ModeUsage Pie Chart
async function getModeUsageService(req, res, deviceName, timeRange) {
  const userId = req.user.id;
  const Today = new Date();
  const ToDate = getTodate(timeRange);

  let getAnalyticsData = [];
  if (deviceName === "All") {
    getAnalyticsData = await model.Analytics.findAll({
      where: {
        userId: userId,
        createdAt: {
          [Op.between]: [ToDate, Today],
        },
      },
    });
  } else {
    const deviceId = await getDeviceID(deviceName);
    getAnalyticsData = await model.Analytics.findAll({
      where: {
        userId: userId,
        deviceId: deviceId.deviceId,
        createdAt: {
          [Op.between]: [ToDate, Today],
        },
      },
    });
  }

  const modeData = await model.Mode.findAll();

  const modeCounts = modeData.map((data) => {
    const usageCount = getAnalyticsData.filter(
      (dt) => dt.modeId === data.id
    ).length;
    return { modeName: data.mode, count: usageCount };
  });

  return res.json({
    success: true,
    counts: modeCounts,
  });
}

//Data for SocailTaps Pie Chart
async function getSocialTapsService(req, res, deviceName, timeRange) {
  const userId = req.user.id;
  const Today = new Date();
  const ToDate = getTodate(timeRange);

  const actionsIdLookUpData = await model.ActionLookUp.findAll({
    where: {
      id: {
        [Op.in]: [8, 9, 10, 11, 12],
      },
    },
  });
  let socailTapsData = [];
  if (deviceName === "All") {
    socailTapsData = await model.Analytics.findAll({
      where: {
        userId: userId,
        modeId: {
          [Op.in]: [1, 2],
        },
        actionId: {
          [Op.in]: [8, 9, 10, 11, 12],
        },
        createdAt: {
          [Op.between]: [ToDate, Today],
        },
      },
    });
  } else {
    const deviceId = await getDeviceID(deviceName);
    socailTapsData = await model.Analytics.findAll({
      where: {
        userId: userId,
        modeId: {
          [Op.in]: [1, 2],
        },
        actionId: {
          [Op.in]: [8, 9, 10, 11, 12],
        },
        deviceId: deviceId.deviceId,
        createdAt: {
          [Op.between]: [ToDate, Today],
        },
      },
    });
  }

  const finalData = actionsIdLookUpData.map((data) => {
    const tapsCount = socailTapsData.filter(
      (dt) => dt.actionId === data.id
    ).length;
    return { name: data.actionName, count: tapsCount };
  });

  return res.json({
    success: true,
    finalData,
  });
}

// for payments Taps Pie Chart
async function getPaymentTapsService(req, res, deviceName, timeRange) {
  const userId = req.user.id;
  const Today = new Date();
  const ToDate = getTodate(timeRange);

  const actionsIdLookUpData = await model.ActionLookUp.findAll({
    where: {
      id: {
        [Op.in]: [13, 14, 15],
      },
    },
  });
  let paymentsTapsData = [];
  if (deviceName === "All") {
    paymentsTapsData = await model.Analytics.findAll({
      where: {
        userId: userId,
        modeId: {
          [Op.in]: [1, 2],
        },
        actionId: {
          [Op.in]: [13, 14, 15],
        },
        createdAt: {
          [Op.between]: [ToDate, Today],
        },
      },
    });
  } else {
    const deviceId = await getDeviceID(deviceName);
    paymentsTapsData = await model.Analytics.findAll({
      where: {
        userId: userId,
        modeId: {
          [Op.in]: [1, 2],
        },
        actionId: {
          [Op.in]: [13, 14, 15],
        },
        deviceId: deviceId.deviceId,
        createdAt: {
          [Op.between]: [ToDate, Today],
        },
      },
    });
  }

  const finalData = actionsIdLookUpData.map((data) => {
    const tapsCount = paymentsTapsData.filter(
      (dt) => dt.actionId === data.id
    ).length;
    return { name: data.actionName, count: tapsCount };
  });

  return res.json({
    success: true,
    finalData,
  });
}

// Data for contact taps pie chart
async function getContactTapsService(req, res, deviceName, timeRange) {
  const userId = req.user.id;
  const Today = new Date();
  const ToDate = getTodate(timeRange);

  const actionsIdLookUpData = await model.ActionLookUp.findAll({
    where: {
      id: {
        [Op.in]: [3, 4, 5, 6],
      },
    },
  });
  let paymentsTapsData = [];
  if (deviceName === "All") {
    paymentsTapsData = await model.Analytics.findAll({
      where: {
        userId: userId,
        modeId: {
          [Op.in]: [1, 2],
        },
        actionId: {
          [Op.in]: [3, 4, 5, 6],
        },
        createdAt: {
          [Op.between]: [ToDate, Today],
        },
      },
    });
  } else {
    const deviceId = await getDeviceID(deviceName);
    paymentsTapsData = await model.Analytics.findAll({
      where: {
        userId: userId,
        modeId: {
          [Op.in]: [1, 2],
        },
        actionId: {
          [Op.in]: [3, 4, 5, 6],
        },
        deviceId: deviceId.deviceId,
        createdAt: {
          [Op.between]: [ToDate, Today],
        },
      },
    });
  }

  const finalData = actionsIdLookUpData.map((data) => {
    const tapsCount = paymentsTapsData.filter(
      (dt) => dt.actionId === data.id
    ).length;
    return { name: data.actionName, count: tapsCount };
  });

  return res.json({
    success: true,
    finalData,
  });
}

// Data fro leadGen Form  TODO: add deviceID to table and filter accordingly
async function getLeadGenDataService(req, res, deviceName, timeRange) {
  const userId = req.user.id;
  const Today = new Date();
  const ToDate = getTodate(timeRange);

  const leadGenData = await model.LeadGen.findAll({
    where: {
      userId: userId, // add deviceID when done
      createdAt: {
        [Op.between]: [ToDate, Today],
      },
    },
  });

  return res.json({
    success: true,
    leadGenData,
  });
}

// Data to get User devices
async function getUserDevicesService(req, res) {
  const userId = req.user.id;
  const userDevices = await model.AccountDeviceLink.findAll({
    where: {
      userId: userId,
      isDeleted: false,
    },
  });

  const deviceName = await Promise.all(
    userDevices.map(async (deviceData) => {
      const deviceName = await model.Device.findOne({
        where: {
          id: deviceData.deviceId,
        },
      });
      return {
        deviceID: deviceData.deviceId,
        deviceName: deviceName.deviceUid,
      };
    })
  );

  return res.json({
    success: true,
    deviceName,
  });
}

// TODO: Priya please check and remove this
async function AnalyticsService(req, res, deviceId) {
  // const userId = req.user.id;
  const userId = 2;

  const getLeadsData = await model.LeadGen.findAll();

  // get tap count by device id
  const getTapCount = await model.Analytics.findAll({
    where: {
      userId: userId,
      deviceId: deviceId.deviceId,
    },
  });
  const getTaps = getTapCount.length;

  // get lead count
  const getLeads = await model.LeadGen.findAll();
  const leadCount = getLeads.length;

  const getAllMode = await model.Mode.findAll();

  const modeNames = {
    1: "profile",
    2: "url",
    3: "leads",
    4: "contact",
  };

  // mode length
  let modeCounts = {};
  for (let itemIndex in getAllMode) {
    const getMode = getAllMode[itemIndex].id;

    const mode = await model.Mode.findByPk(getMode);
    const modeCount = await model.Analytics.count({
      where: { modeId: getMode, userId: userId },
    });
    // const modeName = modeNames[getMode]; // Get the mode name using the mode ID

    // modeCounts[modeName] = modeCount;
    const modeName = mode.mode;
    modeCounts[modeName] = modeCount;
  }

  // actions length
  let actionLength = {};
  const getAllActions = await model.ActionLookUp.findAll();

  for (let itemIndex in getAllActions) {
    const getActions = getAllActions[itemIndex].id;

    const actionValues = await model.ActionLookUp.findByPk(getActions);

    const actionCount = await model.Analytics.count({
      where: { actionId: getActions, userId: userId },
    });
    const modeName = actionValues.actionName;
    actionLength[modeName] = actionCount;
  }

  return res.json({
    success: true,
    getTaps,
    modeCounts,
    actionLength,
    leadCount,
    getAllMode,
    getLeadsData,
  });
}

export {
  AnalyticsService,
  GetTapsDataService,
  getModeUsageService,
  getSocialTapsService,
  getPaymentTapsService,
  getContactTapsService,
  getLeadGenDataService,
  getUserDevicesService,
  getDeviceTypeService,
};
