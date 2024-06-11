import {
  planServices,
  planPaymentServices,
  updatePlanService,
  getPlanDetailsService,
} from "../../adminServices/planServices.js";

async function planController(req, res) {
  try {
    const getPlanDetails = await planServices();
    return res.json({
      getPlanDetails,
    });
  } catch (error) {
    console.log(error);
  }
}

async function planPaymentController(req, res) {
  try {
    const planPaymentDetails = await planPaymentServices();
    return res.json({
      planPaymentDetails,
    });
  } catch (error) {
    console.log(error);
  }
}

async function updatePlanController(req, res) {
  try {
    const { userId, planValidity, startDate, endDate, subscriptionType } =
      req.body;

    const updatePlan = await updatePlanService(
      userId,
      planValidity,
      startDate,
      endDate,
      subscriptionType
    );

    if (updatePlan) {
      return res.json({
        success: true,
        message: "Plan updated successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "Plan not updated successfully",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: `Plan not updated successfully + ${error.message}`,
    });
  }
}

async function getPlanDetailsController(req, res) {
  try {
    const { userId } = req.body;

    const getPlan = await getPlanDetailsService(userId);

    return res.json({
      success: true,
      message: "Plan Details",
      planDetails: getPlan,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: `Unable to get plan details : ${error.message}`,
    });
  }
}

export {
  planController,
  planPaymentController,
  updatePlanController,
  getPlanDetailsController,
};
