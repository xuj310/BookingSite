const BaseRoutes = require("./BaseRoutes");
const eventControllers = require("../controllers/eventController");
const eventValidations = {
  requireId: require("../validations/requireId"),
  validateId: require("../validations/validateId"),
  validateLogin: require("../validations/validateLogin"),
  validateCreateEvent: require("../validations/validateCreateEvent"),
  validateUpdateEvent: require("../validations/validateUpdateEvent"),
};

class eventRoutes extends BaseRoutes {
  constructor() {
    super();
    this.setupRoutes([
      {
        method: "get",
        path: "/events",
        middlewares: [eventValidations.validateId],
        handler: eventControllers.getEvents,
      },
      {
        method: "post",
        path: "/events",
        middlewares: [
          eventValidations.validateLogin,
          eventValidations.validateCreateEvent,
        ],
        handler: eventControllers.createEvent,
      },
      {
        method: "put",
        path: "/events",
        middlewares: [
          eventValidations.requireId,
          eventValidations.validateId,
          eventValidations.validateUpdateEvent,
        ],
        handler: eventControllers.updateEvent,
      },
      {
        method: "put",
        path: "/events/participants",
        middlewares: [
          eventValidations.requireId,
          eventValidations.validateId,
        ],
        handler: eventControllers.updateEventParticipants,
      },
      {
        method: "delete",
        path: "/events",
        middlewares: [eventValidations.requireId, eventValidations.validateId],
        handler: eventControllers.deleteEvent,
      },
    ]);
  }
}

module.exports = new eventRoutes().getRouter();
