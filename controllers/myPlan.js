/* eslint-disable no-case-declarations */
import model from "../models/index.js";
import { generateETag } from "../helper/hash.js";
import lruCache from "../helper/lruCache.js";

async function getPlan(req, res) {
  try {
    const getPlans = await model.Plan.findAll({});
    return res.json({
      success: true,
      message: "Plans",
      getPlans,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function getPlanDescription(_req, res) {
  try {
    const plans = await model.Plan.findAll({
      include: [
        {
          model: model.PlanDescription,
          as: "PlanDescriptions", // must match your association alias
          attributes: ["id", "description"],
        },
      ],
      attributes: [
        ["id", "planId"],
        "planName",
        "monthlyPrice",
        "annualPrice",
        "shortDescription",
      ],
      order: [["id", "ASC"]],
    });

    return res.json({
      success: true,
      message: "Plans with Descriptions",
      data: plans,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function getPlanDetails(req, res) {
  const userId = req.user.id;
  const currentDate = new Date();

  try {
    let checkPlan = await model.BubblPlanManagement.findAll({
      where: {
        userId,
      },
    });
    let getPlans = checkPlan[checkPlan.length - 1];
    if (getPlans.planId === 2) {
      if (currentDate > getPlans.planEndDate) {
        getPlans = await model.BubblPlanManagement.update(
          {
            planId: 1,
            subscriptionType: "free",
            planValidity: null,
            planStartDate: null,
            planEndDate: null,
            isValid: false,
          },
          {
            where: {
              userId,
            },
          }
        );
      }
    }

    return res.json({
      success: true,
      message: "Plan Found",
      getPlans,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function updatePlanDetails(req, res) {
  const userId = req.user.id;
  const { planId, planValidity } = req.body;
  try {
    const plan = await model.Plan.findOne({
      where: {
        id: planId,
      },
    });

    if (plan) {
      switch (plan.id) {
        case 1:
          return await model.BubblPlanManagement.update({
            subscriptionType: "Free",
          });
        case 2:
          const checkPayment = await model.PlanPayment.findOne({
            where: {
              userId,
              paymentStatus: true,
            },
            order: [["updatedAt", "DESC"]],
          });
          if (checkPayment) {
            const checkPaymentStatus = checkPayment.paymentStatus;
            const planStartDateM = new Date();
            let planEndDateM = new Date();
            planEndDateM = planEndDateM.setMonth(planStartDateM.getMonth() + 1);
            if (checkPaymentStatus === true) {
              if (planValidity === "monthly") {
                const updatePlanValidity =
                  await model.BubblPlanManagement.update(
                    {
                      planId,
                      planValidity: planValidity,
                      planStartDate: planStartDateM,
                      planEndDate: planEndDateM,
                      subscriptionType: "pro",
                      isValid: true,
                    },
                    {
                      where: {
                        userId,
                      },
                    }
                  );

                return res.json({
                  success: true,
                  message: "Plan has been updated to Monthly",
                  updatePlanValidity,
                });
              } else {
                const planStartDateY = new Date();
                let planEndDateY = new Date();
                planEndDateY = planEndDateY.setFullYear(
                  planStartDateY.getFullYear() + 1
                );
                const updatePlanValidity =
                  await model.BubblPlanManagement.update(
                    {
                      planId,
                      planValidity: planValidity,
                      planStartDate: planStartDateY,
                      planEndDate: planEndDateY,
                      subscriptionType: "pro",
                    },
                    {
                      where: {
                        userId,
                      },
                    }
                  );
                return res.json({
                  success: true,
                  message: "Plan has been updated to Yearly",
                  updatePlanValidity,
                });
              }
            } else {
              return res.json({
                success: false,
                message: "Plan cannot be updated",
              });
            }
          } else {
            return res.json({
              success: false,
              message: "Initiate payment",
            });
            //   //initiate payment
            //   const createPayment = await model.PlanPayment.create({
            //     planId,
            //     userId,
            //     transactionId: "",
            //     totalPrice: 0,
            //     paymentStatus: "initiated",
            //     failureMessage: "",
            //   });
            //   if (createPayment) {
            //     const planStartDateM = new Date();
            //     let planEndDateM = new Date();
            //     planEndDateM = planStartDateM.setMonth(
            //       planStartDateM.getMonth() + 1
            //     );
            //     if (planValidity === "monthly") {
            //       const updatePlanValidity =
            //         await model.BubblPlanManagement.update(
            //           {
            //             planId,
            //             planValidity,
            //             planStartDate: planStartDateM,
            //             planEndDate: planEndDateM,
            //             subscriptionType: "pro",
            //           },
            //           {
            //             where: {
            //               userId,
            //               planId,
            //             },
            //           }
            //         );

            //       return res.json({
            //         success: true,
            //         message: "Plan Monthly has been updated",
            //         updatePlanValidity,
            //       });
            //     } else {
            //       const planStartDateY = new Date();
            //       let planEndDateY = new Date();
            //       planEndDateY = planEndDateY.setFullYear(
            //         planStartDateY.getFullYear() + 1
            //       );
            //       const updatePlanValidity =
            //         await model.BubblPlanManagement.update(
            //           {
            //             planId,
            //             planValidity: planValidity,
            //             planStartDate: planStartDateY,
            //             planEndDate: planEndDateY,
            //             subscriptionType: "pro",
            //           },
            //           {
            //             where: {
            //               userId,
            //             },
            //           }
            //         );
            //       return res.json({
            //         success: true,
            //         message: "Plan Yearly has been updated",
            //         updatePlanValidity,
            //       });
            //     }
            //   }
          }
      }
    } else {
      return res.json({
        success: false,
        message: "user not found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function deactivatePlan(req, res) {
  const userId = req.user.id;
  try {
    const user = await model.User.findOne({
      where: {
        id: userId,
      },
    });
    if (user) {
      const checkUserId = await model.BubblPlanManagement.findOne({
        where: {
          userId: user.id,
        },
      });
      if (checkUserId) {
        await model.BubblPlanManagement.update(
          {
            planId: 1,
            subscriptionType: "free",
            planValidity: null,
            planStartDate: null,
            planEndDate: null,
          },
          {
            where: {
              userId: user.id,
            },
          }
        );
        return res.json({
          success: true,
          message: "Plan Cancelled",
        });
      }
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function createPlanPayment(req, res) {
  const { planId } = req.body;
  const userId = req.user.id;
  try {
    const createOrder = await model.PlanPayment.create({
      userId,
      planId,
      transactionId: "",
      totalPrice: 0,
      paymentStatus: false,
      failureMessage: "",
    });
    return res.json({
      success: true,
      message: "payment initiated",
      createOrder,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function getAllPlan(req, res) {
  try {
    const plan = await model.Plan.findAll({
      attributes: [
        "id",
        "planName",
        "monthlyPrice",
        "annualPrice",
        "shortDescription",
        "discountPercentage",
      ],
      where: {
        isActive: true,
      },
      include: [{ model: model.PlanDescription, attributes: ["description"] }],
    });
    return res.json({
      success: true,
      message: "Plan details",
      data: plan,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function getUserPlan(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const clientEtag = req.headers["if-none-match"]; // FIXED

    const isCached = lruCache.get(`etag:${userId}`);

    if (isCached && isCached === clientEtag)  return res.sendStatus(304);

    const plan = await model.BubblPlanManagement.findOne({ where: { userId } });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "No plan found for this user",
      });
    }

    const plainObj = plan.get({ plain: true });
    const ETag = generateETag(plainObj.updatedAt);

    lruCache.set(`etag:${userId}`, ETag);

    res.setHeader("ETag", ETag);

    return res.status(200).json({
      success: true,
      message: "User plan fetched successfully",
      plan,
    });
  } catch (error) {
    console.error("Error fetching user plan:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export {
  getPlan,
  getPlanDetails,
  updatePlanDetails,
  deactivatePlan,
  createPlanPayment,
  getAllPlan,
  getPlanDescription,
  getUserPlan,
};
