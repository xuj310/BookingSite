const { Event } = require("../models/eventModel");
const { User } = require("../models/userModel");

exports.getEvents = async (req, res) => {
  try {
    let events = [];

    if (req.query.id) {
      const singleEvent = await Event.findById(req.query.id);
      if (singleEvent) events.push(singleEvent);
    } else {
      events = await Event.find();
    }

    // Filter by userId if provided
    if (req.query.userid) {
      console.log("Found userid!");
      events = events.filter((event) =>
        event.participants.includes(req.query.userid)
      );
    }

    const enrichedEvents = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const participantDetails = [];
      let modified = false;

      for (let j = 0; j < event.participants.length; j++) {
        const userId = event.participants[j];
        const user = await User.findById(userId);

        if (user) {
          participantDetails.push({ id: userId, name: user.name });
        } else {
          console.log("User not found for ID:", userId);
          // Remove the invalid participant
          event.participants.splice(j, 1);
          j--; // Adjust index after removal
          modified = true;
        }
      }

      if (modified) {
        await event.save(); // Save only if participants were removed
      }

      enrichedEvents.push({
        _id: event._id,
        imgUrl: event.imgUrl,
        title: event.title,
        description: event.description,
        date: event.date,
        participants: participantDetails,
      });
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

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    // Put the user that created the event in the participants
    const newEvent = new Event({
      imgUrl: req.body.imgUrl,
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      host: userId,
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
  const userId = req.user._id; // Authenticated user
  const eventId = req.query.id;

  const event = await Event.findById(eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  if (event.host.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "Only the host can edit this event" });
  }

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
        if (removeid !== event.host) {
          event.participants.splice(index, 1);
          await event.save();
          return res
            .status(200)
            .json({ message: "Participant removed", event });
        } else {
          console.log("cannot remove event host");
          return res
            .status(400)
            .json({ message: "Cannot remove the event host" });
        }
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
    const userId = req.user._id; // Authenticated user
    const eventId = req.query.id;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.host.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only the host can delete this event" });
    }

    await Event.findByIdAndDelete(eventId);

    return res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
