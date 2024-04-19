/**
 * @file Contains the implementation of the DyadicConvoExperiment class.
 * @module DyadicConvoExperiment
 */

const cytoscape = require("cytoscape");
const typedefs = require("../typedefs");
const { NetworkExperiment } = require("../core");
const { getRandomInt } = require("../utils");

/**
 * A simple network with 6-node network with dyadic connections,
 * where each node is connected to two other nodes.
 * @constant
 * @type {cytoscape.Core}
 */
const SIX_NODE_DYADIC_NETWORK = cytoscape({
  elements: {
    nodes: [
      { data: { id: "1", user: null } },
      { data: { id: "2", user: null } },
      { data: { id: "3", user: null } },
      { data: { id: "4", user: null } },
      { data: { id: "5", user: null } },
      { data: { id: "6", user: null } },
    ],
    edges: [
      { data: { id: "1-4", source: "1", target: "4", round: 1 } },
      { data: { id: "1-5", source: "1", target: "5", round: 2 } },
      { data: { id: "2-5", source: "2", target: "5", round: 1 } },
      { data: { id: "2-6", source: "2", target: "6", round: 2 } },
      { data: { id: "3-6", source: "3", target: "6", round: 1 } },
      { data: { id: "3-4", source: "3", target: "4", round: 2 } },
    ],
  },
});

/**
 * An experiment that simulates a dyadic conversation.
 * @extends NetworkExperiment
 */
class DyadicConvoExperiment extends NetworkExperiment {
  constructor() {
    super();
    this._network = SIX_NODE_DYADIC_NETWORK;

    /** The current round of the experiment. */
    this._round = 0;

    /** The nodes that have not been assigned a user yet. */
    this._unassignedNodeIds = ["1", "2", "3", "4", "5", "6"];

    /**
     * The users that are currently in play and their assigned node ID.
     * The key is the user ID. The value is their assigned node ID.
     * @type {Map<string, string>}
     */
    this._userToAssignedNode = new Map();

    /** The current experiment data. Each entry corresponds to a round data. */
    this._data = [];
  }

  /**
   * Add a user to the experiment.
   * @param {typedefs.User} user - The user to add to the network.
   */
  addUser(user) {
    this._lobby.set(user.id, user);
  }

  /**
   * Remove a user to the experiment.
   * @param {string} userId - The id of the user to remove from the network.
   */
  removeUser(userId) {
    this._lobby.delete(userId);

    const nodeId = this._userToAssignedNode.get(userId);
    if (nodeId != null) {
      this._unassignedNodeIds.push(nodeId);
      this._userToAssignedNode.delete(userId);
    }
  }

  /**
   * Let a single round play out in the experiment.
   * @returns {[any, any]} - The data for the round and any errors that occurred.
   *                         The first element is the data for the round. The second
   *                         element is the error. Returns null as error if there are none.
   */
  playRound() {
    // TODO: We can abstract error-handling. But for another time.
    if (this._lobby.size < 6) {
      return [{}, { error: "Not enough users in the lobby. Need at least 6." }];
    }

    if (this._round >= 2) {
      return [
        {},
        { error: "Experiment has already ended. Round limit reached." },
      ];
    }
    this._round++;

    const usersNotInPlay = Array.from(this._lobby.values()).filter(
      (user) => !this._userToAssignedNode.get(user.id)
    );

    // Sort users by earliest created.
    usersNotInPlay.sort((a, b) => b.created_at - a.created_at);

    // Assign nodes to users (sorted by earlist-created) uniformly at random.
    // This ensures that if a user is removed, the next earliest user will take their place.
    while (this._unassignedNodeIds.length > 0) {
      const randomIndex = getRandomInt(0, this._unassignedNodeIds.length - 1);
      const randomNodeId = this._unassignedNodeIds.splice(randomIndex, 1)[0]; // O(n) but is fine.

      const nextEarliestUser = usersNotInPlay.pop();
      this._network.getElementById(randomNodeId).data("user", nextEarliestUser);
      this._userToAssignedNode.set(nextEarliestUser.id, randomNodeId);
    }

    // Append to data.
    const roundData = {
      round: this._round,
      conversations: [],
    };

    const conversations = this._network.edges(`[round = ${this._round}]`);
    for (const conversation of conversations) {
      const source = conversation.source().data("user");
      const target = conversation.target().data("user");
      roundData.conversations.push({
        source: source,
        target: target,
      });
    }

    this._data.push(roundData);
    return [roundData, null];
  }

  /**
   * Restarts the experiment by cleaning up the state.
   * But keeps the users in the lobby.
   */
  cleanUp() {
    this._round = 0;
    this._data = [];
    this._unassignedNodeIds = ["1", "2", "3", "4", "5", "6"];
    this._userToAssignedNode.clear();
  }

  /**
   * Get the users in the lobby.
   * @returns {Map<string, typedefs.User>} - The users in the lobby.
   */
  get lobby() {
    return this._lobby;
  }

  /**
   * Get the current round of the experiment.
   * @returns {number} - The current round of the experiment.
   */
  get round() {
    return this._round;
  }

  /**
   * Get the current experiment data.
   * @returns {any} - The current experiment data.
   */
  get data() {
    return this._data;
  }
}

module.exports = { DyadicConvoExperiment };
