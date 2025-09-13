const BaseRoutes = require("./BaseRoutes");
const userControllers = require("../controllers/userController");
const middlewares = {
  generateUserToken: require("../middleware/generateUserToken"),
  checkUserToken: require("../middleware/checkUserToken"),
};
const userValidations = {
  requireId: require("../validations/requireId"),
  validateId: require("../validations/validateId"),
  isAdmin: require("../validations/isAdmin"),
  validateCreateUser: require("../validations/validateCreateUser"),
  validateUpdateUser: require("../validations/validateUpdateUser"),
};

class userRoutes extends BaseRoutes {
  constructor() {
    super();
    this.setupRoutes([
      {
        method: "get",
        path: "/users",
        middlewares: [userValidations.validateId],
        handler: userControllers.getUsers,
      },
      {
        method: "post",
        path: "/users",
        middlewares: [
          userValidations.validateCreateUser,
          middlewares.generateUserToken,
        ],
        handler: userControllers.createUser,
      },
      {
        method: "put",
        path: "/users",
        middlewares: [
          userValidations.requireId,
          userValidations.validateId,
          userValidations.validateUpdateUser,
        ],
        handler: userControllers.updateUser,
      },
      {
        method: "delete",
        path: "/users",
        middlewares: [
          userValidations.requireId,
          middlewares.checkUserToken,
          userValidations.isAdmin,
          userValidations.validateId,
        ],
        handler: userControllers.deleteUser,
      },
    ]);
  }
}

module.exports = new userRoutes().getRouter();
