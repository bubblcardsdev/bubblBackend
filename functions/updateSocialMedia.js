import model from "../models/index.js";

async function updateSocialMedia(
  socialMediaNames,
  socialMediaLength,
  profileId
) {
  const socialMedia = await socialMediaNames.map((social) => {
    return {
      profileId: profileId,
      profileSocialMediaLinkId: social.profileSocialMediaLinkId,
      profileSocialMediaId: social.profileSocialMediaId,
      socialMediaName: social.socialMediaName,
      enableStatus: social.enableStatus,
      activeStatus: social.activeStatus,
    };
  });
  for (let l = 0; l < socialMediaLength; l++) {
    if (socialMedia[l].profileSocialMediaLinkId === null) {
      await model.ProfileSocialMediaLink.create({
        profileId: socialMedia[l].profileId,
        profileSocialMediaId: socialMedia[l].profileSocialMediaId,
        socialMediaName: socialMedia[l].socialMediaName,
        enableStatus: socialMedia[l].enableStatus,
        activeStatus: socialMedia[l].activeStatus,
      });
    } else {
      await model.ProfileSocialMediaLink.update(
        {
          profileId: socialMedia[l].profileId,
          profileSocialMediaId: socialMedia[l].profileSocialMediaId,
          socialMediaName: socialMedia[l].socialMediaName,
          enableStatus: socialMedia[l].enableStatus,
          activeStatus: socialMedia[l].activeStatus,
        },
        {
          where: {
            id: socialMedia[l].profileSocialMediaLinkId,
          },
        }
      );
    }
  }
  return;
}
export { updateSocialMedia };
