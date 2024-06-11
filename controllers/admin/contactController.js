import {
  contactServices,
  updateContactServices,
} from "../../adminServices/conatactServices.js";

async function contactUsController(req, res) {
  const contactUsFunction = await contactServices();
  return res.json({
    success: true,
    contactUsFunction,
  });
}

// update function for isRead
async function updateContactController(req, res) {
  const { contactId, isRead } = req.body;
  const contactUsFunction = await updateContactServices(
    contactId,
    isRead,
    req,
    res
  );
  return contactUsFunction;
}
export { contactUsController, updateContactController };
