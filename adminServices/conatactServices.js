import model from "../models/index.js";

async function contactServices() {
  const contactFunction = await model.ContactUs.findAll();
  return contactFunction;
}

async function updateContactServices(contactId, isRead, req, res) {
  const contactFunction = await model.ContactUs.update(
    {
      isRead: isRead,
    },
    {
      where: {
        id: contactId,
      },
    }
  );
  return res.json({ message: "success", contactFunction });
}
export { contactServices, updateContactServices };
