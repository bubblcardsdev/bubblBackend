import model from "../models/index.js";

async function authorizeUserService(uid) {
  try {
    if (!uid) {
      throw new Error("Couldnt find the device");
    }

    console.log(uid);

    const user = await model.UserRd.findOne({
      where: {
        UID: uid.trim(),
      },
    });

    console.log(user.UID);
    const authorizeTime = new Date(user.AuthorizedTime);
    const currentTime = new Date();

    console.log(authorizeTime, currentTime);
    const timeDifference = currentTime - authorizeTime;

    const minutesDifference = Math.abs(timeDifference) / (1000 * 60);
    if (minutesDifference <= 2) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw error;
  }
}

export { authorizeUserService };
