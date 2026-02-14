import ServiceType from "../models/Service.js";

const createServiceType = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { name, duration, availability, location } = req.body;

    if (!Array.isArray(availability) || availability.length === 0) {
      return res.status(400).json({ message: "Availability must be a non-empty array" });
    }

    const service = await ServiceType.create({
      workspaceId,
      name,
      duration,
      availability,
      location,
    });

    res.status(201).json(service);
  } catch (err) {
    console.error("createServiceType error:", err);
    res.status(500).json({ message: "Failed to create service type" });
  }
};

const getServiceTypes = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const services = await ServiceType.find({ workspaceId });
    res.json(services);
  } catch (err) {
    console.error("getServiceTypes error:", err);
    res.status(500).json({ message: "Failed to fetch service types" });
  }
};

const updateServiceType = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { id } = req.params;

    const service = await ServiceType.findOneAndUpdate(
      { _id: id, workspaceId },
      req.body,
      { new: true }
    );

    if (!service) return res.status(404).json({ message: "Service type not found" });
    res.json(service);
  } catch (err) {
    console.error("updateServiceType error:", err);
    res.status(500).json({ message: "Failed to update service type" });
  }
};

const deleteServiceType = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { id } = req.params;

    const deleted = await ServiceType.findOneAndDelete({ _id: id, workspaceId });
    if (!deleted) return res.status(404).json({ message: "Service type not found" });

    res.json({ message: "Service type deleted" });
  } catch (err) {
    console.error("deleteServiceType error:", err);
    res.status(500).json({ message: "Failed to delete service type" });
  }
};

export { createServiceType, getServiceTypes, updateServiceType, deleteServiceType };
