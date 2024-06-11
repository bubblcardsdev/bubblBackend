import { authorizeUserService } from "../../services/authorizeUserService.js";
async function authorizeUser(req, res) {
  console.log("function called")
  try {
    const { uid } = req.body;

    console.log(uid);
    const authorize = await authorizeUserService(uid);
    console.log(authorize);
    if (authorize === false) {
      return res.json({
        success: false,
        authorize,
      });
    }

    return res.json({
      success: true,
      authorize,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export default authorizeUser ;
