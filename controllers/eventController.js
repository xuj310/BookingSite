const { Event } = require("../models/eventModel");
const { User } = require("../models/userModel");

/* 
  Events Controller
*/

exports.getEvents = async (req, res) => {
  try {
    let events = [];

    /* 
      If an event id has been specified, return the singular event.
      Otherwise get all the events.
    */
    if (req.query.id) {
      const singleEvent = await Event.findById(req.query.id);
      if (!singleEvent) {
        return res.status(404).json({ errors: "Event not found" });
      }
      events.push(singleEvent);
    } else {
      events = await Event.find();
    }

    /*  
      If a userId was specified, filter to only the events where the user
      has participated in.
    */
    if (req.query.userid) {
      events = events.filter((event) =>
        event.participants.includes(req.query.userid)
      );
    }

    const updatedEvents = [];

    // Go through all the events
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const participantDetails = [];
      let modified = false;

      /*
        Go through the participants in every event, find their name and return it alongside the user Id. We do this so we can see the name in the front end.
      */
      for (let j = 0; j < event.participants.length; j++) {
        // Grab the userId and try to find the user.
        const userId = event.participants[j];
        const user = await User.findById(userId);

        /*
          If found, construct an entry with the userId and name. If we found the Id but can't find a name, that means the lookup failed and the user must have been deleted so just delete the user from the participants list.
         */
        if (user) {
          participantDetails.push({ id: userId, name: user.name });
        } else {
          // Remove the invalid participant
          event.participants.splice(j, 1);
          // Adjust index after removal
          j--;
          modified = true;
        }
      }

      // Save only if participants were removed.
      if (modified) {
        await event.save();
      }

      updatedEvents.push({
        _id: event._id,
        imgUrl: event.imgUrl,
        title: event.title,
        description: event.description,
        date: event.date,
        host: event.host,
        participants: participantDetails,
      });
    }

    // Return the singular result or all results.
    if (req.query.id) {
      res.json(updatedEvents[0]);
    } else {
      res.json(updatedEvents);
    }
  } catch (error) {
    res.status(500).json({ errors: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const eventDate = req.body.date;

    const newEvent = new Event({
      imgUrl: req.body.imgUrl,
      title: req.body.title,
      description: req.body.description,
      date: eventDate,
      host: userId,
      participants: userId,
    });

    await newEvent.save();

    return res.status(201).json({
      message: "Event created successfully",
      newEvent,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  const userId = req.user._id;
  const eventId = req.query.id;

  const event = await Event.findById(eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  // Compare the requesting user to the host. Only the host can edit the event details.
  if (event.host.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "Only the host can edit this event" });
  }

  try {
    // Only update the fields that have actually changed
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

// This is to handle adding/removing events participants
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
      // If we found the participant, start removing them.
      if (index !== -1) {
        if (removeid !== event.host) {
          // Remove the participant
          event.participants.splice(index, 1);
          await event.save();
          return res
            .status(200)
            .json({ message: "Participant removed", event });
        } else {
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

    return res
      .status(400)
      .json({ message: "No add or remove specified provided" });
  } catch (error) {
    console.error("Error updating participants:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const eventId = req.query.id;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Make sure only the host is trying to delete the event
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
