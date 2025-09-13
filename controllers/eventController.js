const { Event } = require("../models/eventModel");

exports.getEvents = async (req, res) => {
  try {
    // If an id is provided, retrieve the specific event
    if (req.query.id) {
      const event = await Event.findById(req.query.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      return res.json(event);
    }
    // If there's no id provided, return all events
    const product = await Event.find();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const userId = req.user && req.user._id; // or req.user.id depending on your setup
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const newEvent = new Event({
      name: req.body.name,
      description: req.body.description,
      date: req.body.date,
      participants: [userId],
    });
    await newEvent.save();
    return res.status(201).json({
      message: "Event created successfully",
      newEvent: newEvent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    // Changing the fields is optional
    const updateFields = {};
    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.description) updateFields.description = req.body.description;
    if (req.body.price) updateFields.price = req.body.price;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.query.id,
      // Only includes changed fields
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({
      message: "Event updated successfully",
      updatedEvent: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.query.id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
