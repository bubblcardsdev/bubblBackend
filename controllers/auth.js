import { nanoid } from "nanoid";
import model from "../models/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
  issueToken,
} from "../middleware/token.js";
import { sendMail } from "../middleware/email.js";
import { UniqueConstraintError } from "sequelize";
import {
  loginSchema,
  createUserSchema,
  verifyGoogleUserSchema,
  verifyFacebookUserSchema,
  verifyLinkedinUserSchema,
  addPhoneNumberSchema,
  verifyOtpSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  changePasswordSchema,
  resendOtpSchema,
  updateUserSchema,
  verifyEmailOtpSchema,
  resendMailOtpSchema,
  createMobileUserSchema,
  verifyLinkedinUserSchemaMobile,
} from "../validations/auth.js";
// import { createProfile } from "../controllers/profile.js";
import config from "../config/config.js";
import { sendMessage } from "../middleware/sms.js";
// import NameCustomEmail from "./namCustomEmail.js";
// import OrderConfirmationMail from "./orderEmail.js";

import { hashPassword, comparePassword } from "../middleware/secure.js";
import { verifyGoogleAccount } from "../middleware/google.js";
import { verifyFacebookAccount } from "../middleware/facebook.js";
import { verifyLinkedinAccount } from "../middleware/linkedin.js";
import loggers from "../config/logger.js";
import MobileOnboardingProfileCreate from "../helper/mobileOnboard.js";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}

async function issueNewToken(req, res) {
  const token = req.headers.authorization;
  if (token) {
    try {
      const accessToken = issueToken(token);
      const accessTokenExpiryInSeconds = `${config.accessTokenExpiration}`;
      return res.json({
        accessToken,
        accessTokenExpiryInSeconds,
      });
    } catch (error) {
      loggers.error(error + "from issueNewToken function");
      return res.json({
        success: false,
        data: {
          error,
        },
      });
    }
  } else {
    return res.json({
      success: false,
      data: {
        message: "authorization not provided",
      },
    });
  }
}

async function login(req, res) {
  const { email, password, isMobile } = req.body;
  const { error } = loginSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    // logger.error(error.message);
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    const checkUser = await model.User.findOne({ where: { email } });
    if (!checkUser) {
      return res.json({
        success: false,
        data: {
          message: "Email or password is incorrect",
        },
      });
    }
    // For Mobile
    const Profile = await model.Profile.findOne({
      where: { userId: checkUser.id },
    });
    const comparedPassword = await comparePassword(
      password,
      checkUser.password
    );
    if (checkUser && comparedPassword) {
      const {
        id,
        firstName,
        lastName,
        email,
        phoneNumber,
        phoneVerified,
        emailVerified,
      } = checkUser;
      const user = {
        id,
        firstName,
        lastName,
        email,
      };

      if (phoneVerified === false || emailVerified === false) {
        if (phoneVerified === false) {
          return res.json({
            success: false,
            data: {
              message: "Please verify your Phone Number",
              phoneVerified,
              emailVerified,
            },
          });
        } else {
          const otp = generateOtp();

          await model.User.update({ otp }, { where: { email } });
          const emailParse = email.toLowerCase();
          const subject = "Welcome to Bubbl.cards – Let’s Get Started!";
          const emailMessage = `
      
          <h2>Hello <strong>${firstName}</strong>,</h2>
      
          <p>Welcome to Bubbl.cards! We’re thrilled to have you with us and can’t wait for you to experience the future of networking with our innovative digital business cards.</p>
      
          <p>To finish your account setup simply enter the verification OTP below.  <strong>${otp}</strong></p>
      
          <p>Once verified, you can complete your profile setup!</p>
      
          <p>Check out our range of bubbl products and discover how we can streamline and enhance your professional connections today!</p>
      
          <p>Should you have any questions or need support, our team is here for you. Welcome to the future of Networking!</p>
      
          <p>Best wishes,</p>
      
          <p>The Bubbl.cards Team</p>`;

          await sendMail(emailParse, subject, emailMessage);
          return res.json({
            success: true,
            data: {
              message: "Please verify your Email",
              phoneVerified,
              emailVerified,
            },
          });
        }
      }

      const accessToken = await generateAccessToken(user);
      const accessTokenExpiryInSeconds = `${config.accessTokenExpiration}`;
      const refreshToken = await generateRefreshToken(user);
      const refreshTokenExpiryInSeconds = `${config.refreshTokenExpiration}`;
      if (isMobile) {
        if (Profile) {
          return res.json({
            success: true,
            data: {
              message: "Logged in successfully",
              firstName,
              lastName,
              email,
              phoneNumber,
              phoneVerified,
              emailVerified,
              token: {
                accessToken,
                accessTokenExpiryInSeconds,
                refreshToken,
                refreshTokenExpiryInSeconds,
              },
              profileId: Profile.id,
              isProfileAvailable: true,
            },
          });
        } else {
          return res.json({
            success: true,
            data: {
              message: "Logged in successfully",
              firstName,
              lastName,
              email,
              phoneNumber,
              phoneVerified,
              emailVerified,
              token: {
                accessToken,
                accessTokenExpiryInSeconds,
                refreshToken,
                refreshTokenExpiryInSeconds,
              },
              isProfileAvailable: false,
            },
          });
        }
      }
      return res.json({
        success: true,
        data: {
          message: "Logged in successfully",
          firstName,
          lastName,
          email,
          phoneNumber,
          phoneVerified,
          emailVerified,
          token: {
            accessToken,
            accessTokenExpiryInSeconds,
            refreshToken,
            refreshTokenExpiryInSeconds,
          },
        },
      });
    } else {
      return res.json({
        success: false,
        data: {
          message: "Check the Credentials",
        },
      });
    }
  } catch (error) {
    loggers.error(error + "from login function");
    return res.json({
      success: false,
      data: {
        error,
      },
    });
  }
}

async function createUser(req, res) {
  const { firstName, lastName, email, password, deviceID } = req.body;
  const { error } = createUserSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }
  const emailParse = email.toLowerCase();
  const emailVerificationId = nanoid();

  try {
    const checkUser = await model.User.findOne({
      where: {
        email: emailParse,
      },
    });

    if (checkUser) {
      return res.json({
        success: false,
        data: {
          message: "Email already exists",
          phoneVerified: checkUser.phoneVerified,
          emailVerified: checkUser.emailVerified,
        },
      });
    }
    const hashedPassword = await hashPassword(password);

    const user = await model.User.create({
      firstName: firstName,
      lastName: lastName,
      email: emailParse,
      password: hashedPassword,
      emailVerificationId: emailVerificationId,
      local: true,
      phoneVerified: true,
    });
    if (user) {
      await model.BubblPlanManagement.create({
        userId: user.id,
        planId: 1,
        subscriptionType: "free",
        isValid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await model.ClaimLink.create({
        userId: user.id,
      });
      await model.UniqueNameDeviceLink.create({
        userId: user.id,
      });
    }
    const otp = generateOtp();

    await model.User.update({ otp }, { where: { email } });

    //aws issue removed email content
    //<p>To verify your Bubbl registration email please click this <a target="_blank" href="${config.frontEndUrl}/verify/${emailVerificationId}">link</a>.</p>

    // const subject = "Bubbl Registration";
    // const emailMessage = `

    // <h2>Dear <strong>${firstName}</strong>,</h2>

    // <p>Thank you for registering with Bubbl.cards! We are thrilled to have you on board and can't wait for you to experience the ease and convenience of our touch-enabled tech essentials.</p>

    // <p>Please use the link given below to verify your account and start exploring our range of cutting-edge products.</p>

    // <p>Verification Link: <a target="_blank" href="${config.frontEndUrl}/verify/${emailVerificationId}?deviceID=${deviceID}">link</a>.</p>

    // <p>Best regards,</p>

    // <p>The Bubbl.cards team.</p>`;
    const subject = `Welcome to Bubbl.cards – Let’s Get Started!`;
    const emailMessage = `

    <h2>Hello <strong>${firstName}</strong>,</h2>

    <p>Welcome to Bubbl.cards! We’re thrilled to have you with us and can’t wait for you to experience the future of networking with our innovative digital business cards.</p>

    <p>To finish your account setup simply enter the verification OTP below.  <strong>${otp}</strong></p>

    <p>Once verified, you can complete your profile setup!</p>

    <p>Check out our range of bubbl products and discover how we can streamline and enhance your professional connections today!</p>

    <p>Should you have any questions or need support, our team is here for you. Welcome to the future of Networking!</p>

    <p>Best wishes,</p>

    <p>The Bubbl.cards Team</p>`;

    await sendMail(emailParse, subject, emailMessage);
    return res.json({
      success: true,
      data: {
        message: "User created successfully",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
        local: user.local,
        signupType: user.signupType,
      },
    });
  } catch (error) {
    console.log(error.message, "ee");
    loggers.error(error + "from createUser function");
    if (error instanceof UniqueConstraintError) {
      await model.User.findOne({ where: { email } });
      return res.json({
        success: false,
        data: {
          message: `${error.errors[0].path} already exists`,
        },
      });
    }
    return res.json({
      success: false,
      data: {
        error,
      },
    });
  }
}

async function createUser2(firstName, lastName, email, password) {
  try {
    const emailParse = email.trim().toLowerCase();
    const checkUser = await model.User.findOne({
      where: {
        email: emailParse,
      },
    });

    if (checkUser) {
      return { email: email, response: "User Already Exists" };
    }
    const hashedPassword = await hashPassword(password);

    const user = await model.User.create({
      firstName: firstName,
      lastName: lastName,
      email: emailParse,
      password: hashedPassword,
      emailVerified: true,
      local: true,
      phoneVerified: true,
    });
    if (user) {
      await model.BubblPlanManagement.create({
        userId: user.id,
        planId: 1,
        subscriptionType: "free",
        isValid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await model.ClaimLink.create({
        userId: user.id,
      });
      await model.UniqueNameDeviceLink.create({
        userId: user.id,
      });
      return { email: email, response: "User Created Successfully" };
    }
  } catch (error) {
    console.log(error.message, "ee");
    loggers.error(error + "from createUser2 function");
  }
}

async function createUserBulkController(req, res) {
  const { userData } = req.body;
  let response = [];

  try {
    if (userData.length !== 0) {
      // Use Promise.all to wait for all async operations to finish
      response = await Promise.all(
        userData.map(async (record) => {
          const { firstName, lastName, email, password } = record;
          const creteDeviceFunction = await createUser2(
            firstName,
            lastName,
            email,
            password
          );
          console.log("creteUserFunction-----------", creteDeviceFunction);
          return creteDeviceFunction;
        })
      );

      console.log(response);
      return res.json({
        success: true,
        message: "Success",
        data: response,
      });
    } else {
      return res.json({
        success: false,
        message: "Invalid Data",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

async function createUserMobile(req, res) {
  const {
    firstName,
    lastName,
    email,
    password,
    profileName,
    phoneNumber,
    countryCode,
    companyName,
    templateId,
    designation,
  } = req.body;
  const { error } = createMobileUserSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    console.log(error);
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }
  const emailParse = email.toLowerCase();

  try {
    const checkUser = await model.User.findOne({
      where: {
        email: emailParse,
      },
    });
    const hashedPassword = await hashPassword(password);
    // For new user logic
    if (!checkUser) {
      const user = await model.User.create({
        firstName: firstName,
        lastName: lastName,
        email: emailParse,
        password: hashedPassword,
        local: true,
        phoneVerified: true,
        emailVerified: true,
      });
      let createProfileMobile;
      if (user) {
        await model.BubblPlanManagement.create({
          userId: user.id,
          planId: 1,
          subscriptionType: "free",
          isValid: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await model.ClaimLink.create({
          userId: user.id,
        });
        await model.UniqueNameDeviceLink.create({
          userId: user.id,
        });
        const userId = user.id;
        createProfileMobile = await MobileOnboardingProfileCreate(
          firstName,
          lastName,
          email,
          profileName,
          phoneNumber,
          countryCode,
          companyName,
          templateId,
          designation,
          userId
        );
      }

      const userInfo = {
        id: user.id,
        firstName,
        lastName,
        email,
      };

      const accessToken = await generateAccessToken(userInfo);
      const accessTokenExpiryInSeconds = `${config.accessTokenExpiration}`;
      const refreshToken = await generateRefreshToken(userInfo);
      const refreshTokenExpiryInSeconds = `${config.refreshTokenExpiration}`;

      return res.json({
        success: true,
        data: {
          message: "User and Profile created successfully",
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneVerified: user.phoneVerified,
          emailVerified: user.emailVerified,
          local: user.local,
          signupType: user.signupType,
          profileId: createProfileMobile && createProfileMobile.id,
          verifying: true,
          accessToken: accessToken,
          accessTokenExpiryInSeconds: accessTokenExpiryInSeconds,
          refreshToken: refreshToken,
          refreshTokenExpiryInSeconds: refreshTokenExpiryInSeconds,
        },
      });
    }
    // For existing user logics
    else {
      // check profile available for the existing user
      const checkProfile = await model.Profile.findOne({
        where: { userId: checkUser.id },
      });

      // throw error if user and the profile is already exist
      if (checkProfile) {
        return res.json({
          success: false,
          data: {
            message: "Email and profile already exists",
            phoneVerified: checkUser.phoneVerified,
            emailVerified: checkUser.emailVerified,
          },
        });
      }

      // update user details and create profile
      const userId = checkUser.id;
      await model.User.update(
        {
          password: hashedPassword,
        },
        { where: { id: userId } }
      );
      const createProfileMobile = await MobileOnboardingProfileCreate(
        firstName,
        lastName,
        email,
        profileName,
        phoneNumber,
        countryCode,
        companyName,
        templateId,
        designation,
        userId
      );

      const userInfo = {
        id: checkUser.id,
        firstName,
        lastName,
        email,
      };

      const accessToken = await generateAccessToken(userInfo);
      const accessTokenExpiryInSeconds = `${config.accessTokenExpiration}`;
      const refreshToken = await generateRefreshToken(userInfo);
      const refreshTokenExpiryInSeconds = `${config.refreshTokenExpiration}`;

      return res.json({
        success: true,
        data: {
          message:
            "Profile created successfully and User password updated successfully",
          firstName: createProfileMobile.firstName,
          lastName: createProfileMobile.lastName,
          email: checkUser.email,
          phoneVerified: checkUser.phoneVerified,
          emailVerified: checkUser.emailVerified,
          local: checkUser.local,
          signupType: checkUser.signupType,
          profileId: createProfileMobile.id,
          verifying: false,
          accessToken: accessToken,
          accessTokenExpiryInSeconds: accessTokenExpiryInSeconds,
          refreshToken: refreshToken,
          refreshTokenExpiryInSeconds: refreshTokenExpiryInSeconds,
        },
      });
    }
  } catch (error) {
    loggers.error(error + "from createUser function");
    if (error instanceof UniqueConstraintError) {
      await model.User.findOne({ where: { email } });
      return res.json({
        success: false,
        data: {
          message: `${error.errors[0].path} already exists`,
        },
      });
    }
    return res.json({
      success: false,
      data: {
        error,
      },
    });
  }
}

async function verifyGoogleUser(req, res) {
  const { credential, isMobile } = req.body;

  const { error } = verifyGoogleUserSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    const payload = await verifyGoogleAccount(credential);

    const payloadEmail = payload.email;
    const payloadFirstName = payload.given_name;
    const payloadLastName = payload.family_name;

    const checkEmail = await model.User.findOne({
      where: { email: payloadEmail },
    });

    if (checkEmail === null) {
      const user = await model.User.create({
        firstName: payloadFirstName,
        lastName: payloadLastName,
        email: payloadEmail,
        emailVerified: true,
        phoneVerified: true,
        google: true,
        signupType: "social",
      });

      await model.BubblPlanManagement.create({
        userId: user.id,
        planId: 1,
        subscriptionType: "free",
      });
      await model.ClaimLink.create({
        userId: user.id,
      });
    } else {
      await model.User.update(
        { google: true, signupType: "social", emailVerified: true },
        { where: { email: payloadEmail } }
      );
    }

    const checkUser = await model.User.findOne({
      where: { email: payloadEmail },
    });
    // For Mobile
    const Profile = await model.Profile.findOne({
      where: { userId: checkUser.id },
    });

    const { id, firstName, lastName, email, emailVerified } = checkUser;
    const user = { id, firstName, lastName, email };

    const accessToken = await generateAccessToken(user);
    const accessTokenExpiryInSeconds = `${config.accessTokenExpiration}`;
    const refreshToken = await generateRefreshToken(user);
    const refreshTokenExpiryInSeconds = `${config.refreshTokenExpiration}`;

    if (isMobile) {
      if (Profile) {
        return res.json({
          success: true,
          data: {
            message: "Google Account verified successfully",
            firstName,
            lastName,
            email,
            emailVerified,
            token: {
              accessToken,
              accessTokenExpiryInSeconds,
              refreshToken,
              refreshTokenExpiryInSeconds,
            },
            profileId: Profile.id,
            isProfileAvailable: true,
          },
        });
      } else {
        return res.json({
          success: true,
          data: {
            message: "Google Account verified successfully",
            firstName,
            lastName,
            email,
            emailVerified,
            token: {
              accessToken,
              accessTokenExpiryInSeconds,
              refreshToken,
              refreshTokenExpiryInSeconds,
            },
            isProfileAvailable: false,
          },
        });
      }
    }
    return res.json({
      success: true,
      data: {
        message: "Google Account verified successfully",
        firstName,
        lastName,
        email,
        emailVerified,
        token: {
          accessToken,
          accessTokenExpiryInSeconds,
          refreshToken,
          refreshTokenExpiryInSeconds,
        },
      },
    });
  } catch (error) {
    loggers.error(error + "from verifyGoogleUser function");
    return res.json({
      success: false,
      data: {
        message: "Check the Credentials",
      },
    });
  }
}

async function verifyFacebookUser(req, res) {
  const { accesstoken, isMobile } = req.body;

  const { error } = verifyFacebookUserSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    const payload = await verifyFacebookAccount(accesstoken);

    const payloadEmail = payload.email;
    const payloadFirstName = payload.first_name;
    const payloadLastName = payload.last_name;

    const checkEmail = await model.User.findOne({
      where: { email: payloadEmail },
    });

    if (checkEmail === null) {
      const user = await model.User.create({
        firstName: payloadFirstName,
        lastName: payloadLastName,
        email: payloadEmail,
        emailVerified: true,
        phoneVerified: true,
        facebook: true,
        signupType: "social",
      });

      await model.BubblPlanManagement.create({
        userId: user.id,
        planId: 1,
        subscriptionType: "free",
      });
      await model.ClaimLink.create({
        userId: user.id,
      });
    } else {
      await model.User.update(
        { facebook: true, signupType: "social", emailVerified: true },
        { where: { email: payloadEmail } }
      );
    }

    const checkUser = await model.User.findOne({
      where: { email: payloadEmail },
    });

    // For Mobile
    const Profile = await model.Profile.findOne({
      where: { userId: checkUser.id },
    });

    const { id, firstName, lastName, email, emailVerified } = checkUser;
    const user = { id, firstName, lastName, email };

    const accessToken = await generateAccessToken(user);
    const accessTokenExpiryInSeconds = `${config.accessTokenExpiration}`;
    const refreshToken = await generateRefreshToken(user);
    const refreshTokenExpiryInSeconds = `${config.refreshTokenExpiration}`;

    if (isMobile) {
      if (Profile) {
        return res.json({
          success: true,
          data: {
            message: "Facebook Account verified successfully",
            firstName,
            lastName,
            email,
            emailVerified,
            token: {
              accessToken,
              accessTokenExpiryInSeconds,
              refreshToken,
              refreshTokenExpiryInSeconds,
            },
            isProfileAvailable: true,
          },
        });
      } else {
        return res.json({
          success: true,
          data: {
            message: "Facebook Account verified successfully",
            firstName,
            lastName,
            email,
            emailVerified,
            token: {
              accessToken,
              accessTokenExpiryInSeconds,
              refreshToken,
              refreshTokenExpiryInSeconds,
            },
            isProfileAvailable: false,
          },
        });
      }
    }

    return res.json({
      success: true,
      data: {
        message: "Facebook Account verified successfully",
        firstName,
        lastName,
        email,
        emailVerified,
        token: {
          accessToken,
          accessTokenExpiryInSeconds,
          refreshToken,
          refreshTokenExpiryInSeconds,
        },
      },
    });
  } catch (error) {
    loggers.error(error + "from verifyFacebookUser function");
    return res.json({
      success: false,
      data: {
        message: "Check the Credentials",
      },
    });
  }
}

async function verifyLinkedinUser(req, res) {
  const { authorizationCode, given_name, family_name, Email, isMobile } =
    req.body;

  const { error } = !isMobile
    ? verifyLinkedinUserSchema.validate(req.body, {
        abortEarly: false,
      })
    : verifyLinkedinUserSchemaMobile.validate(req.body, {
        abortEarly: false,
      });

  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    const payload = !isMobile
      ? await verifyLinkedinAccount(authorizationCode)
      : { email: Email, given_name: given_name, family_name: family_name };

    const payloadEmail = payload.email;
    const payloadFirstName = payload.given_name;
    const payloadLastName = payload.family_name;

    const checkEmail = await model.User.findOne({
      where: { email: payloadEmail },
    });

    if (!checkEmail) {
      const user = await model.User.create({
        firstName: payloadFirstName,
        lastName: payloadLastName,
        email: payloadEmail,
        emailVerified: true,
        phoneVerified: true,
        linkedin: true,
        signupType: "social",
      });

      await model.BubblPlanManagement.create({
        userId: user.id,
        planId: 1,
        subscriptionType: "free",
      });
      await model.ClaimLink.create({
        userId: user.id,
      });
    } else {
      await model.User.update(
        { linkedin: true, signupType: "social", emailVerified: true },
        { where: { email: payloadEmail } }
      );
    }

    const checkUser = await model.User.findOne({
      where: { email: payloadEmail },
    });
    // For Mobile
    const Profile = await model.Profile.findOne({
      where: { userId: checkUser.id },
    });

    const { id, firstName, lastName, email, emailVerified } = checkUser;
    const user = { id, firstName, lastName, email };

    const accessToken = await generateAccessToken(user);
    const accessTokenExpiryInSeconds = `${config.accessTokenExpiration}`;
    const refreshToken = await generateRefreshToken(user);
    const refreshTokenExpiryInSeconds = `${config.refreshTokenExpiration}`;

    if (isMobile) {
      if (Profile) {
        return res.json({
          success: true,
          data: {
            message: "Linkedin Account verified successfully",
            firstName,
            lastName,
            email,
            emailVerified,
            token: {
              accessToken,
              accessTokenExpiryInSeconds,
              refreshToken,
              refreshTokenExpiryInSeconds,
            },
            profileId: Profile.id,
            isProfileAvailable: true,
          },
        });
      } else {
        return res.json({
          success: true,
          data: {
            message: "Linkedin Account verified successfully",
            firstName,
            lastName,
            email,
            emailVerified,
            token: {
              accessToken,
              accessTokenExpiryInSeconds,
              refreshToken,
              refreshTokenExpiryInSeconds,
            },
            isProfileAvailable: false,
          },
        });
      }
    }
    return res.json({
      success: true,
      data: {
        message: "Linkedin Account verified successfully",
        firstName,
        lastName,
        email,
        emailVerified,
        token: {
          accessToken,
          accessTokenExpiryInSeconds,
          refreshToken,
          refreshTokenExpiryInSeconds,
        },
      },
    });
  } catch (error) {
    loggers.error(error + "from verifyLinkedinUser function");
    return res.json({
      success: false,
      data: {
        message: "Check the Credentials",
      },
    });
  }
}

async function updateUser(req, res) {
  const { userImage, firstName, lastName, phoneNumber, DOB, gender, country } =
    req.body;
  const userId = req.user.id;
  const { error } = updateUserSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    const checkUser = await model.User.findAll({
      where: {
        id: userId,
      },
    });
    if (checkUser) {
      const updateUser = await model.User.update(
        {
          userImage,
          firstName,
          lastName,
          phoneNumber,
          DOB,
          gender,
          country,
        },
        {
          where: {
            id: userId,
          },
        }
      );
      return res.json({
        success: true,
        message: "Updated",
        updateUser,
      });
    } else {
      return res.json({
        success: false,
        message: "User not Found",
      });
    }
  } catch (error) {
    loggers.error(error + "from updateUser function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function addPhoneNumber(req, res) {
  const { email, countryCode, phoneNumber } = req.body;

  const { error } = addPhoneNumberSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    const checkPhone = await model.User.findOne({
      where: {
        countryCode,
        phoneNumber,
      },
    });

    if (checkPhone) {
      return res.json({
        success: false,
        message: "Phone number already exists",
        phoneVerified: checkPhone.phoneVerified,
        emailVerified: checkPhone.emailVerified,
      });
    }

    const otp = generateOtp();

    await model.User.update(
      { countryCode, phoneNumber, otp },
      { where: { email } }
    );

    // AWS sms issue
    // await sendMessage(
    //   `Dear Customer,\n\nThank you for registering with Bubbl.cards! We are thrilled to have you on board and can't wait for you to experience the ease and convenience of our touch-enabled tech essentials.\n\nAs a token of our appreciation, please use the OTP to verify your account and start exploring our range of cutting-edge products.\n\nOTP: ${otp}\n\nBest regards,\nThe Bubbl.cards team.\nCustomer Care Number: +91 7845861552`,
    //   `${countryCode}${phoneNumber}`
    // );

    return res.json({
      success: true,
      data: {
        message: "OTP send successfully",
      },
    });
  } catch (error) {
    loggers.error(error + "from addPhoneNumber function");
    return res.json({
      success: false,
      data: {
        error,
      },
    });
  }
}

async function resendOtp(req, res) {
  const { countryCode, phoneNumber } = req.body;

  const { error } = resendOtpSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    const checkUser = await model.User.findOne({
      where: { countryCode, phoneNumber },
    });

    if (checkUser) {
      const otp = generateOtp();

      await model.User.update({ otp }, { where: { countryCode, phoneNumber } });

      await sendMessage(
        `Dear Customer,\n\nThank you for registering with Bubbl.cards! We are thrilled to have you on board and can't wait for you to experience the ease and convenience of our touch-enabled tech essentials.\n\nAs a token of our appreciation, please use the OTP to verify your account and start exploring our range of cutting-edge products.\n\nOTP: ${otp}\n\nBest regards,\nThe Bubbl.cards team.\nCustomer Care Number: +91 7845861552`,
        `${countryCode}${phoneNumber}`
      );

      return res.json({
        success: true,
        data: {
          message: "OTP send successfully",
        },
      });
    } else {
      return res.json({
        success: false,
        data: {
          message: "Invalid Phone Number",
        },
      });
    }
  } catch (error) {
    loggers.error(error + "from resendOtp function");
    return res.json({
      success: false,
      data: { error },
    });
  }
}

async function resendMailOtp(req, res) {
  const { email } = req.body;

  const { error } = resendMailOtpSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    const emailParse = email.toLowerCase();
    const checkUser = await model.User.findOne({
      where: { email },
    });

    if (checkUser) {
      const otp = generateOtp();

      await model.User.update({ otp }, { where: { email } });

      const subject = `Welcome to Bubbl.cards – Let’s Get Started!`;
      const emailMessage = `
  
      <h2>Hello <strong>${checkUser?.firstName}</strong>,</h2>
  
      <p>Welcome to Bubbl.cards! We’re thrilled to have you with us and can’t wait for you to experience the future of networking with our innovative digital business cards.</p>
  
      <p>To finish your account setup simply enter the verification OTP below.  <strong>${otp}</strong></p>
  
      <p>Once verified, you can complete your profile setup!</p>
  
      <p>Check out our range of bubbl products and discover how we can streamline and enhance your professional connections today!</p>
  
      <p>Should you have any questions or need support, our team is here for you. Welcome to the future of Networking!</p>
  
      <p>Best wishes,</p>
  
      <p>The Bubbl.cards Team</p>`;

      await sendMail(emailParse, subject, emailMessage);

      return res.json({
        success: true,
        data: {
          message: "OTP send successfully",
        },
      });
    } else {
      return res.json({
        success: false,
        data: {
          message: "Invalid Email",
        },
      });
    }
  } catch (error) {
    loggers.error(error + "from resendMailOtp function");
    return res.json({
      success: false,
      data: { error },
    });
  }
}

async function verifyOtp(req, res) {
  const { countryCode, phoneNumber, otp } = req.body;
  const { error } = verifyOtpSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    const checkUser = await model.User.findOne({
      where: { countryCode, phoneNumber },
    });
    if (checkUser && checkUser.otp === otp) {
      await model.User.update(
        { phoneVerified: true },
        { where: { countryCode, phoneNumber } }
      );
      return res.json({
        success: true,
        data: {
          message: "Otp verified successfully",
        },
      });
    } else {
      return res.json({
        success: false,
        data: {
          message: "Wrong Otp",
        },
      });
    }
  } catch (error) {
    loggers.error(error + "from verifyOtp function");
    return res.json({
      success: false,
      data: {
        error,
      },
    });
  }
}

async function verifyEmailOtp(req, res) {
  const { email, otp } = req.body;
  const { error } = verifyEmailOtpSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    const checkUser = await model.User.findOne({
      where: { email, otp },
    });
    if (checkUser && checkUser.email === email && checkUser.otp === otp) {
      await model.User.update(
        { emailVerified: true },
        { where: { email, otp } }
      );
      return res.json({
        success: true,
        data: {
          message: "Email verified successfully",
        },
      });
    } else {
      return res.json({
        success: false,
        data: {
          message: "Invalid Email verification Code",
        },
      });
    }
  } catch (error) {
    loggers.error(error + "from verifyEmailOtp function");
    return res.json({
      success: false,
      data: {
        error,
      },
    });
  }
}

async function verifyEmail(req, res) {
  const { emailVerificationId } = req.body;

  const { error } = verifyEmailSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    const checkUser = await model.User.findOne({
      where: { emailVerificationId },
    });
    if (checkUser && checkUser.emailVerificationId === emailVerificationId) {
      await model.User.update(
        { emailVerified: true },
        { where: { emailVerificationId } }
      );
      return res.json({
        success: true,
        data: {
          message: "Email verified successfully",
        },
      });
    } else {
      return res.json({
        success: false,
        data: {
          message: "Invalid Email verification link",
        },
      });
    }
  } catch (error) {
    loggers.error(error + "from verifyEmail function");
    return res.json({
      success: false,
      data: {
        error,
      },
    });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  const { error } = forgotPasswordSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    const checkUser = await model.User.findOne({
      where: {
        email: email,
      },
    });

    if (checkUser) {
      if (!checkUser.emailVerified) {
        return res.json({
          success: false,
          data: {
            message: "Please verify your Email first",
          },
        });
      }
      const forgotPasswordId = nanoid();

      await model.User.update(
        { forgotPasswordId: forgotPasswordId },
        {
          where: {
            id: checkUser.id,
          },
        }
      );

      const subject = "Bubbl - Change Password";
      const emailMessage = `
    <h2>Hello <strong>${checkUser.firstName}</strong>,</h2>
    <p>To change your Bubbl Password please click this <a target="_blank" href="${config.frontEndUrl}/forgot/${forgotPasswordId}">link</a>.</p>`;

      await sendMail(email, subject, emailMessage);

      return res.json({
        success: true,
        data: {
          message: "Forgot Password Link Sent",
        },
      });
    } else {
      return res.json({
        success: false,
        data: {
          message: "User Credentials Not Found",
        },
      });
    }
  } catch (error) {
    loggers.error(error + "from forgotPassword function");
    return res.json({
      success: false,
      data: {
        error,
      },
    });
  }
}

async function changePassword(req, res) {
  const { forgotPasswordId, newPassword } = req.body;
  const { error } = changePasswordSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    const checkUser = await model.User.findOne({
      where: { forgotPasswordId },
    });
    if (checkUser && checkUser.forgotPasswordId === forgotPasswordId) {
      const hashedPassword = await hashPassword(newPassword);
      await model.User.update(
        { password: hashedPassword },
        { where: { id: checkUser.id } }
      );
      return res.json({
        success: true,
        data: {
          message: "Changed Password successfully",
        },
      });
    } else {
      return res.json({
        success: false,
        data: {
          message: "Invalid Change password link",
        },
      });
    }
  } catch (error) {
    loggers.error(error + "from changePassword function");
    return res.json({
      success: false,
      data: {
        error,
      },
    });
  }
}

async function resetPassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const checkUser = await model.User.findOne({
      where: {
        id: userId,
      },
    });

    const compareCurrentPassword = await comparePassword(
      currentPassword,
      checkUser.password
    );

    const newHashedPassword = await hashPassword(newPassword);

    if (checkUser && compareCurrentPassword) {
      if (checkUser.local == true) {
        await model.User.update(
          { password: newHashedPassword },
          { where: { id: checkUser.id } }
        );
        return res.json({
          success: true,
          data: {
            message: "Changed Password successfully",
          },
        });
      } else {
        await model.User.update(
          { password: newHashedPassword },
          { where: { id: checkUser.id } }
        );
        return res.json({
          success: true,
          data: {
            message: "Changed Password successfully",
          },
        });
      }
    } else {
      if (checkUser.local == false) {
        await model.User.update(
          { password: newHashedPassword },
          { where: { id: checkUser.id } }
        );
        return res.json({
          success: true,
          data: {
            message: "Changed Password successfully",
          },
        });
      } else {
        return res.json({
          success: false,
          data: {
            message: "Password Mismatch",
          },
        });
      }
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from resetPassword function");
    return res.json({
      success: false,
      data: {
        error,
      },
    });
  }
}

export {
  issueNewToken,
  login,
  createUser,
  verifyGoogleUser,
  verifyFacebookUser,
  verifyLinkedinUser,
  updateUser,
  addPhoneNumber,
  resendOtp,
  verifyOtp,
  verifyEmail,
  verifyEmailOtp,
  forgotPassword,
  changePassword,
  resetPassword,
  resendMailOtp,
  createUserBulkController,
  createUserMobile,
};
