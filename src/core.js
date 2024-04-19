/**
 * @file This module contains the core functionality.
 * @module core
 */

const cytoscape = require("cytoscape");
const typedefs = require("./typedefs");

/**
 * An abstract class that represents a network experiment.
 * @abstract
 */
class NetworkExperiment {
  constructor() {
    /**
     * The underlying network that the experiment is running on.
     * Overwrite this in the derived class.
     * @protected
     * @type {cytoscape.Core}
     */
    this._network = null;

    /**
     * The lobby of users that are waiting to join the network.
     * The key is the user ID. The value is the user object.
     * @protected
     * @type {Map<string, typedefs.User>}
     */
    this._lobby = new Map();

    /**
     * The current experiment data. This should be appended to as the experiment runs.
     * @protected
     * @type any
     */
    this._data = {};
  }

  /**
   * Logic to add a user to the network.
   * @abstract
   * @param {typedefs.User} user - The user to add to the network.
   */
  addUser(user) {
    throw new Error("addUser() not implemented.");
  }

  /**
   * Logic to remove a user to the network.
   * @abstract
   * @param {typedefs.User} user - The user to remove to the network.
   */
  removeUser(user) {
    throw new Error("removeUser() not implemented.");
  }

  /**
   * Cleans up the experiment.
   * @abstract
   */
  cleanUp() {
    throw new Error("cleanUp() not implemented.");
  }
}

module.exports = { NetworkExperiment };
