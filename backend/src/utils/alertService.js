import Alert from "../models/Alerts.js";

const createInventoryAlert = async (workspaceId, inventoryItem) => {
  return Alert.create({
    workspaceId,
    type: "inventory",
    message: `Low stock: ${inventoryItem.name} (qty: ${inventoryItem.quantity})`,
    relatedId: inventoryItem._id,
    refModel: "InventoryItem",
  });
};

const createFormAlert = async (workspaceId, bookingId, message) => {
  return Alert.create({
    workspaceId,
    type: "form",
    message,
    relatedId: bookingId,
    refModel: "Booking",
  });
};

const createMessageAlert = async (workspaceId, contactId, message) => {
  return Alert.create({
    workspaceId,
    type: "message",
    message,
    relatedId: contactId,
    refModel: "Contact",
  });
};

export { createInventoryAlert, createFormAlert, createMessageAlert };