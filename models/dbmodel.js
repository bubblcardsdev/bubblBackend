/* eslint-disable linebreak-style */
import _profile from "./profile.cjs";
import _user from "./user.cjs";
import _profilePhoneNumber from "./profilePhoneNumber.cjs";
import _profileEmail from "./profileEmail.cjs";
import _profileWebsite from "./profileWebsite.cjs";
import _profileSocialMedia from "./profileSocialMedia.cjs";
import _profileSocialMediaLink from "./profileSocialMediaLink.cjs";
import _profileDigitalPayment from "./profileDigitalPayment.cjs";
import _profileDigitalPaymentLink from "./profileDigitalPaymentLink.cjs";
import _profileImages from "./profileimages.cjs";
// import _profileInfo from "./profileInfo.cjs";
import _device from "./device.cjs";
import _accountDeviceLink from "./accountdevicelink.cjs";
import _deviceLink from "./deviceLink.cjs";
import _deviceBranding from "./deviceBranding.cjs";
import _template from "./template.cjs";
import _mode from "./mode.cjs";
import _cart from "./cart.cjs";
import _order from "./order.cjs";
import _inventory from "./deviceinventory.cjs";
import _payment from "./payment.cjs";
import _shipping from "./shipping.cjs";
import _url from "./modedirecturl.cjs";
import _leadgen from "./leadgen.cjs";
import _plan from "./plan.cjs";
import _planmanagement from "./bubblPlanManagement.cjs";
import _planpayment from "./planpayment.cjs";
import _claimlink from "./claimLink.cjs";
import _contact from "./contactus.cjs";
import _news from "./newsletter.cjs";
import _analytis from "./analytics.cjs";
import _shippingcharge from "./shippingcharge.cjs";
import _admin from "./admin.cjs";
import _nameCustom from "./namecustomcards.cjs";
import _customizedImages from "./customizedimages.cjs";
// import _deviceThumbnailInventory from "./deviceimageinventories.cjs";
import _fullyCustomCards from "./fullycustomcards.cjs";
import _nameCustomImageInventory from "./namecustomdeviceinventory.cjs";
import _nameCustomImages from "./namecustomimages.cjs";
import _actionLookup from "./actionlookup.cjs";
import _uniqueNameDeviceLink from "./uniqueusernamedevicelink.cjs";
import _userRd from "./userrd.cjs";
import _deviceImageInventories from "./deviceimageinventories.cjs";
import _deviceInventories from "./deviceinventories.cjs";
import _deviceColorMasters from "./devicecolormaster.cjs";
import _deviceMaterialTypeMasters from "./materialtypemaster.cjs";
import _devicePatternMasters from "./devicepatternmaster.cjs";
import _deviceTypeMasters from "./devicetypemaster.cjs";
import _orderStatusMasters from "./orderstatusmaster.cjs";
import _orderBreakDown from "./orderbreakdown.cjs";
import _fontMaster from "./customfontmaster.cjs";

export default function dbModel(sequelize, Sequelize) {
  const User = _user(sequelize, Sequelize);
  const Profile = _profile(sequelize, Sequelize);
  const ProfilePhoneNumber = _profilePhoneNumber(sequelize, Sequelize);
  const ProfileEmail = _profileEmail(sequelize, Sequelize);
  const ProfileWebsite = _profileWebsite(sequelize, Sequelize);
  const ProfileSocialMedia = _profileSocialMedia(sequelize, Sequelize);
  const ProfileSocialMediaLink = _profileSocialMediaLink(sequelize, Sequelize);
  const ProfileDigitalPayment = _profileDigitalPayment(sequelize, Sequelize);
  const ProfileDigitalPaymentLink = _profileDigitalPaymentLink(
    sequelize,
    Sequelize
  );
  const ProfileImages = _profileImages(sequelize, Sequelize);
  // const ProfileInfo = _profileInfo(sequelize, Sequelize);
  const Device = _device(sequelize, Sequelize);
  const AccountDeviceLink = _accountDeviceLink(sequelize, Sequelize);
  const DeviceLink = _deviceLink(sequelize, Sequelize);
  const DeviceBranding = _deviceBranding(sequelize, Sequelize);
  const Template = _template(sequelize, Sequelize);
  const Mode = _mode(sequelize, Sequelize);
  const Cart = _cart(sequelize, Sequelize);
  const Order = _order(sequelize, Sequelize);
  const DeviceInventory = _inventory(sequelize, Sequelize);
  const Payment = _payment(sequelize, Sequelize);
  const Shipping = _shipping(sequelize, Sequelize);
  const ModeDirectUrl = _url(sequelize, Sequelize);
  const LeadGen = _leadgen(sequelize, Sequelize);
  const Plan = _plan(sequelize, Sequelize);
  const BubblPlanManagement = _planmanagement(sequelize, Sequelize);
  const PlanPayment = _planpayment(sequelize, Sequelize);
  const ClaimLink = _claimlink(sequelize, Sequelize);
  const ContactUs = _contact(sequelize, Sequelize);
  const NewsLetter = _news(sequelize, Sequelize);
  const Analytics = _analytis(sequelize, Sequelize);
  const ShippingCharge = _shippingcharge(sequelize, Sequelize);
  const Admin = _admin(sequelize, Sequelize);
  const FullyCustom = _fullyCustomCards(sequelize, Sequelize);
  const CustomCards = _nameCustom(sequelize, Sequelize);
  const CustomizedImages = _customizedImages(sequelize, Sequelize);
  // const DeviceThumbnailImage = _deviceThumbnailInventory(sequelize, Sequelize);
  const NameDeviceImageInventory = _nameCustomImageInventory(
    sequelize,
    Sequelize
  );
  const NameCustomImages = _nameCustomImages(sequelize, Sequelize);
  const ActionLookUp = _actionLookup(sequelize, Sequelize);
  const UniqueNameDeviceLink = _uniqueNameDeviceLink(sequelize, Sequelize);
  const UserRd = _userRd(sequelize, Sequelize);
  const DeviceImageInventories = _deviceImageInventories(sequelize, Sequelize);
  const DeviceInventories = _deviceInventories(sequelize, Sequelize);
  const DeviceColorMasters = _deviceColorMasters(sequelize, Sequelize);
  const MaterialTypeMasters = _deviceMaterialTypeMasters(sequelize, Sequelize);
  const DevicePatternMasters = _devicePatternMasters(sequelize, Sequelize);
  const DeviceTypeMasters = _deviceTypeMasters(sequelize, Sequelize);
  const OrderStatusMaster = _orderStatusMasters(sequelize, Sequelize);
  const OrderBreakDown = _orderBreakDown(sequelize, Sequelize);
  const CustomFontMaster = _fontMaster(sequelize, Sequelize);

  User.hasMany(Profile, { as: "userProfiles" });
  User.hasMany(AccountDeviceLink, { as: "userAccountDeviceLinks" });
  User.hasMany(ClaimLink);
  User.hasMany(BubblPlanManagement);
  Profile.hasMany(ProfilePhoneNumber, { as: "profilePhoneNumbers" });
  Profile.hasMany(ProfileEmail, { as: "profileEmails" });
  Profile.hasMany(ProfileWebsite, { as: "profileWebsites" });
  Profile.hasMany(ProfileDigitalPaymentLink, {
    as: "profileDigitalPaymentLinks",
  });
  Profile.hasMany(ProfileSocialMediaLink, { as: "profileSocialMediaLinks" });
  AccountDeviceLink.hasOne(DeviceLink);
  DeviceLink.belongsTo(AccountDeviceLink);
  AccountDeviceLink.belongsTo(Device);
  Profile.hasOne(DeviceLink);
  Template.hasOne(DeviceLink);
  Mode.hasOne(DeviceLink);
  //#region - Phase II association
  Profile.belongsTo(Template);
  Profile.belongsTo(Mode);
  DeviceLink.hasOne(UniqueNameDeviceLink);
  //#endregion
  DeviceLink.belongsTo(Profile);
  DeviceLink.belongsTo(Template);
  DeviceLink.belongsTo(Mode);
  DeviceLink.hasMany(DeviceBranding);
  // ProfileInfo.belongsTo(Profile);
  // ProfileInfo.belongsTo(Template);
  // User.hasMany(ProfileInfo);
  // Template.hasMany(ProfileInfo);
  // Profile.hasOne(ProfileInfo);
  DeviceBranding.belongsTo(DeviceLink);
  Order.hasMany(Cart);
  Order.hasMany(Shipping);
  Order.hasMany(Payment);
  BubblPlanManagement.belongsTo(Plan);
  Plan.hasMany(BubblPlanManagement);
  // User.hasOne(BubblPlanManagement)

  // for admin Associations
  BubblPlanManagement.belongsTo(User);
  PlanPayment.belongsTo(User);
  // User.belongsTo(Order);
  Order.belongsTo(User, { foreignKey: "customerId" });
  // User.hasMany(Order);
  AccountDeviceLink.belongsTo(User);

  NameDeviceImageInventory.hasMany(NameCustomImages, {
    foreignKey: "NameCustomDeviceId",
  });
  // CustomCards.belongsTo(NameCustomImages, {
  //   foreignKey: "NameCustomDeviceId",
  // });

  //#region - New association after table change

  DeviceInventories.hasMany(DeviceImageInventories, { foreignKey: "deviceId" });
  DeviceInventories.belongsTo(DeviceColorMasters, {
    foreignKey: "colorId",
  });

  DeviceInventories.belongsTo(MaterialTypeMasters, {
    foreignKey: "materialTypeId",
  });
  DeviceInventories.belongsTo(DevicePatternMasters, {
    foreignKey: "patternId",
  });

  DeviceInventories.belongsTo(DeviceTypeMasters, {
    foreignKey: "deviceTypeId",
  });

  Order.hasMany(OrderBreakDown, { foreignKey: "orderId" });
  //#endregion

  return {
    User,
    Profile,
    ProfilePhoneNumber,
    ProfileEmail,
    ProfileWebsite,
    ProfileSocialMedia,
    ProfileSocialMediaLink,
    ProfileDigitalPayment,
    ProfileDigitalPaymentLink,
    ProfileImages,
    Device,
    AccountDeviceLink,
    DeviceLink,
    DeviceBranding,
    Template,
    Mode,
    Cart,
    DeviceInventory,
    Order,
    Payment,
    Shipping,
    ModeDirectUrl,
    LeadGen,
    Plan,
    BubblPlanManagement,
    PlanPayment,
    ClaimLink,
    ContactUs,
    NewsLetter,
    Analytics,
    ShippingCharge,
    Admin,
    FullyCustom,
    CustomCards,
    // DeviceThumbnailImage,
    CustomizedImages,
    NameDeviceImageInventory,
    NameCustomImages,
    ActionLookUp,
    UniqueNameDeviceLink,
    UserRd,
    //new
    DeviceImageInventories,
    DeviceInventories,
    DeviceColorMasters,
    MaterialTypeMasters,
    DevicePatternMasters,
    DeviceTypeMasters,
    OrderStatusMaster,
    OrderBreakDown,
    CustomFontMaster,
  };
}
