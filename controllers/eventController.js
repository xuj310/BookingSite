const { Event } = require("../models/eventModel");
const { User } = require("../models/userModel");

exports.getEvents = async (req, res) => {
  try {
    let events = [];

    if (req.query.id) {
      const singleEvent = await Event.findById(req.query.id);
      events.push(singleEvent);
    } else {
      events = await Event.find();
    }

    // Filter by userId if provided
    if (req.query.userid) {
      console.log("Found userid!");
      const filtered = [];
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        if (event.participants.includes(req.query.userid)) {
          filtered.push(event);
        }
      }
      events = filtered;
    }

    const enrichedEvents = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const participantDetails = [];

      for (let j = 0; j < event.participants.length; j++) {
        const userId = event.participants[j];
        const user = await User.findById(userId);
        participantDetails.push({ id: userId, name: user.name });
      }

      const enrichedEvent = {
        _id: event._id,
        imgUrl: event.imgUrl,
        title: event.title,
        description: event.description,
        date: event.date,
        participants: participantDetails,
      };

      enrichedEvents.push(enrichedEvent);
    }

    if (req.query.id) {
      res.json(enrichedEvents[0]);
    } else {
      res.json(enrichedEvents);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log("userId is:", userId);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    // Put the user that created the event in the participants
    const newEvent = new Event({
      imgUrl: req.body.imgUrl,
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      participants: userId,
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
    if (req.body.imgUrl) updateFields.imgUrl = req.body.imgUrl;
    if (req.body.title) updateFields.title = req.body.title;
    if (req.body.description) updateFields.description = req.body.description;
    if (req.body.date) updateFields.date = req.body.date;

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

exports.updateEventParticipants = async (req, res) => {
  console.log("trying to manage participants!");
  try {
    const eventId = req.query.id;
    const { addid, removeid } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: "Missing event ID" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Remove participant
    if (removeid) {
      const index = event.participants.indexOf(removeid);
      if (index !== -1) {
        event.participants.splice(index, 1);
        await event.save();
        return res.json({ message: "Participant removed", event });
      } else {
        return res
          .status(400)
          .json({ message: "Participant not found in event" });
      }
    }

    // Add participant
    if (addid) {
      if (!event.participants.includes(addid)) {
        event.participants.push(addid);
        await event.save();
        return res.json({ message: "Participant added", event });
      } else {
        return res
          .status(400)
          .json({ message: "Participant already in event" });
      }
    }

    return res.status(400).json({ message: "No addid or removeid provided" });
  } catch (error) {
    console.error("Error updating participants:", error);
    return res.status(500).json({ message: error.message });
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
