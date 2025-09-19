/* eslint-disable no-useless-catch */
import axios from "axios";
import config from "../config/config.js";

async function getLinkedInAccessToken(authorizationCode) {
  try {
    const { data } = await axios({
      url: "https://www.linkedin.com/oauth/v2/accessToken",
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        grant_type: "authorization_code",
        code: authorizationCode,
        client_id: config.linkedinClientId,
        client_secret: config.linkedinClientSecret,
        redirect_uri: config.linkedinRedirectUri,
      },
    });

    return data.access_token;
  } catch (error) {
    throw error;
  }
}

async function verifyLinkedinAccount(authorizationCode) {
  try {
    let accessToken = await getLinkedInAccessToken(authorizationCode);
    const { data } = await axios({
      url: "https://api.linkedin.com/v2/userinfo",
      method: "get",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return data;
  } catch (error) {
    throw error;
  }
}

export { verifyLinkedinAccount };
