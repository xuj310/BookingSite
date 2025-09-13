const express = require("express");

class BaseRoutes {
  constructor() {
    this.router = express.Router();
  }

  // Sets up the routes
  setupRoutes(routes) {
    routes.forEach(({ method, path, middlewares, handler }) => {
      this.router[method](path, ...middlewares, handler);
    });
  }

  getRouter() {
    return this.router;
  }
}

module.exports = BaseRoutes;
