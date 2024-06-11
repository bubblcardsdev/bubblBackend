import getAllProfileServices from "../../adminServices/profileServices.js";

async function ProfileController(req, res) {
  const allProfiles = await getAllProfileServices();
  return res.json({
    allProfiles,
  });
}
export default ProfileController;
