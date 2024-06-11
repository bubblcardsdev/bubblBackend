/* eslint-disable no-useless-catch */
import model from "../models/index.js";

// func for getting all the services
async function planServices() {
  try {
    const planDetails = await model.BubblPlanManagement.findAll({
      // join the user table for the email id
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
      ],
      attributes: {
        // to remove unwanted the attributes from plan tables
        exclude: ["planId", "updatedAt"],
      },
    });
    return planDetails;
  } catch (error) {
    console.log(error);
  }
}

async function planPaymentServices() {
  const paymentDetails = await model.PlanPayment.findAll({
    include: [
      {
        model: model.User,
        attributes: {
          exclude: [
            // to remove unwanted the attributes from user tables
            "userImage",
            "firstName",
            "lastName",
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
            "updatedAt",
          ],
        },
      },
    ],
  });
  return paymentDetails;
}

async function updatePlanService(
  userId,
  planValidity,
  startDate,
  endDate,
  subscriptionType
) {
  try {
    const getUserDetails = await model.User.findOne({
      where: {
        id: userId,
      },
    });

    if (!getUserDetails) {
      throw new Error("User not found");
    }
    if (Number(subscriptionType) === 1) {
      const startDateParse = dateParseHelper(startDate);

      const endDateParse = dateParseHelper(endDate);
      const planValidityParse = planValidity.toLowerCase();

      const updateProPlan = await model.BubblPlanManagement.update(
        {
          planId: 2,
          subscriptionType: "pro",
          planValidity: planValidityParse,
          planStartDate: startDateParse,
          planEndDate: endDateParse,
          isValid: true,
        },
        {
          where: {
            userId: getUserDetails.id,
          },
        }
      );

      if (!updateProPlan) {
        throw new Error(
          "Plan couldnt be updated. Please contact the administrator"
        );
      }

      return updateProPlan;
    } else {
      const updateFreePlan = await model.BubblPlanManagement.update(
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
            userId: getUserDetails.id,
          },
        }
      );

      if (!updateFreePlan) {
        throw new Error(
          "Plan couldnt be updated. Please contact the administrator"
        );
      }

      return updateFreePlan;
    }
  } catch (error) {
    throw error;
  }
}

function dateParseHelper(date) {
  const dateParse = new Date(date);
  const currentDate = new Date();
  dateParse.setHours(currentDate.getHours());
  dateParse.setMinutes(currentDate.getMinutes());
  dateParse.setSeconds(currentDate.getSeconds());
  return dateParse;
}

async function getPlanDetailsService(userId) {
  try {
    const user = await model.User.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("Unable to find user");
    }

    const getPlan = await model.BubblPlanManagement.findOne({
      where: {
        userId: user.id,
      },
      attributes: [
        "planId",
        "subscriptionType",
        "planValidity",
        "planStartDate",
        "planEndDate",
        "isValid",
      ],
    });

    if (!getPlan) {
      throw new Error("Unable to find Plan Details for the user");
    }

    return getPlan;
  } catch (error) {
    throw error;
  }
}
export {
  planServices,
  planPaymentServices,
  updatePlanService,
  getPlanDetailsService,
};
