import InventoryItem from "../models/InventoryItems.js";

const createInventoryItem = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { serviceTypeId, name, quantity, threshold, quantityPerBooking } = req.body;

    const item = await InventoryItem.create({
      workspaceId,
      serviceTypeId,
      name,
      quantity,
      threshold,
      quantityPerBooking,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("createInventoryItem error:", err);
    res.status(500).json({ message: "Failed to create inventory item" });
  }
};

const getInventoryItems = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const items = await InventoryItem.find({ workspaceId }).populate("serviceTypeId");
    res.json(items);
  } catch (err) {
    console.error("getInventoryItems error:", err);
    res.status(500).json({ message: "Failed to fetch inventory items" });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { id } = req.params;

    const item = await InventoryItem.findOneAndUpdate(
      { _id: id, workspaceId },
      req.body,
      { new: true }
    );

    if (!item) return res.status(404).json({ message: "Inventory item not found" });
    res.json(item);
  } catch (err) {
    console.error("updateInventoryItem error:", err);
    res.status(500).json({ message: "Failed to update inventory item" });
  }
};

const deleteInventoryItem = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { id } = req.params;

    const deleted = await InventoryItem.findOneAndDelete({ _id: id, workspaceId });
    if (!deleted) return res.status(404).json({ message: "Inventory item not found" });

    res.json({ message: "Inventory item deleted" });
  } catch (err) {
    console.error("deleteInventoryItem error:", err);
    res.status(500).json({ message: "Failed to delete inventory item" });
  }
};

export {
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
};
