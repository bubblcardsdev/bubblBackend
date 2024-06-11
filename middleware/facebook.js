/* eslint-disable no-useless-catch */
import axios from "axios";

async function verifyFacebookAccount(accesstoken) {
  try {
    const { data } = await axios({
      url: "https://graph.facebook.com/me",
      method: "get",
      params: {
        fields: "id,email,first_name,last_name",
        access_token: accesstoken,
      },
    });

    return data;
  } catch (error) {
    throw error;
  }
}

export { verifyFacebookAccount };
