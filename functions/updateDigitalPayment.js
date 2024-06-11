import model from "../models/index.js";

async function updateProfileDigitalPaymentLinks(
  digitalPaymentLinks,
  digitalPaymentLinkLength,
  profileId
) {
  const digitalPay = await digitalPaymentLinks.map((pay) => {
    return {
      profileId: profileId,
      profileDigitalPaymentLinkId: pay.profileDigitalPaymentLinkId,
      profileDigitalPaymentsId: pay.profileDigitalPaymentsId,
      digitalPaymentLink: pay.digitalPaymentLink,
      enableStatus: pay.enableStatus,
      activeStatus: pay.activeStatus,
    };
  });
  for (let k = 0; k < digitalPaymentLinkLength; k++) {
    if (digitalPay[k].profileDigitalPaymentLinkId === null) {
      await model.ProfileDigitalPaymentLink.create({
        profileId: digitalPay[k].profileId,
        profileDigitalPaymentsId: digitalPay[k].profileDigitalPaymentsId,
        digitalPaymentLink: digitalPay[k].digitalPaymentLink,
        enableStatus: digitalPay[k].enableStatus,
        activeStatus: digitalPay[k].activeStatus,
      });
    } else {
      await model.ProfileDigitalPaymentLink.update(
        {
          profileId: digitalPay[k].profileId,
          profileDigitalPaymentsId: digitalPay[k].profileDigitalPaymentsId,
          digitalPaymentLink: digitalPay[k].digitalPaymentLink,
          enableStatus: digitalPay[k].enableStatus,
          activeStatus: digitalPay[k].activeStatus,
        },
        {
          where: {
            id: digitalPay[k].profileDigitalPaymentLinkId,
          },
        }
      );
    }
  }
  return;
}

export { updateProfileDigitalPaymentLinks };
