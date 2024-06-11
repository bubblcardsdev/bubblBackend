/* eslint-disable no-useless-catch */
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import config from "./../config/config.js";

const client = new SNSClient({ region: config.awsRegion });

async function sendMessage(message, phoneNumber) {
  try {
    const data = await client.send(
      new PublishCommand({
        Message: message,
        PhoneNumber: phoneNumber,
      })
    );
    return data;
  } catch (error) {
    throw error;
  }
}

export { sendMessage };
