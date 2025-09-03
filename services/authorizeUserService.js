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

    if (!user) {
      return false;
    }

    return true;
  } catch (error) {
    throw error;
  }
}

export { authorizeUserService };
