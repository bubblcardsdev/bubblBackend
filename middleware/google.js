/* eslint-disable no-useless-catch */
import { OAuth2Client } from "google-auth-library";
import config from "../config/config.js";

const googleClient = new OAuth2Client(config.googleOauthClient);

async function verifyGoogleAccount(credential) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleOauthClient,
    });

    const payload = ticket.getPayload();

    return payload;
  } catch (error) {
    throw error;
  }
}

export { verifyGoogleAccount };
