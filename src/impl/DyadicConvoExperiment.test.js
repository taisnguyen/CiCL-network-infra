const { DyadicConvoExperiment } = require("./DyadicConvoExperiment");

describe("DyadicConvoExperiment", () => {
  const experiment = new DyadicConvoExperiment();

  test("Experiment should not be able to run with < 6 users", () => {
    const [_, err] = experiment.playRound();
    expect(err).toStrictEqual({
      error: "Not enough users in the lobby. Need at least 6.",
    });
  });

  test("Experiment should be able to run with 6 users", () => {
    for (let i = 0; i < 6; i++) {
      experiment.addUser({
        id: `user-${i}`,
        created_at: new Date(new Date().getTime() + i * 60000),
      });
    }

    const [_, err] = experiment.playRound();
    expect(err).toBeNull();
  });

  test("Experiment should assign nodes to earliest users", () => {
    // Add more users.
    for (let i = 0; i < 12; i++) {
      experiment.addUser({
        id: `user-${i}`,
        created_at: new Date(new Date().getTime() + i * 60000),
      });
    }

    const [_, err] = experiment.playRound();
    expect(err).toBeNull();

    // const playersInPlay = Array.from(experiment._playerInPlay.values());});
    const earliestUsers = Array.from(experiment.lobby.values())
      .slice(0, 6)
      .map((user) => user.id);
    const usersInPlay = Array.from(experiment._userToAssignedNode.keys());
    expect(usersInPlay).toStrictEqual(earliestUsers);

    experiment.cleanUp();
  });

  test("Experiment should assign each user to two other unique users in both rounds", () => {
    for (let i = 0; i < 2; i++) {
      const [data, err] = experiment.playRound();
      expect(err).toBeNull();

      const conversations = {};
      for (const conversation of data.conversations) {
        const speakers = [conversation.source.id, conversation.target.id];
        expect(speakers.length).toBe(2);
        expect(speakers[0]).not.toBe(speakers[1]);
        speakers.sort();

        const pairHash = `${speakers[0]}-${speakers[1]}`;
        expect(conversations[pairHash]).toBeUndefined();
        conversations[pairHash] = true;
      }
    }
  });

  test("Experiment should end in two rounds", () => {
    const [_, err] = experiment.playRound();
    expect(err).toStrictEqual({
      error: "Experiment has already ended. Round limit reached.",
    });
    experiment.cleanUp();
  });

  test("Experiment should replace disconnected user with earliest non-playing user in lobby", () => {
    const [data1, err1] = experiment.playRound();
    expect(err1).toBeNull();

    const usersInPlay = Array.from(experiment._userToAssignedNode.keys());

    // Disconnect a user.
    const disconnectedUserId = Array.from(
      experiment._userToAssignedNode.keys()
    )[0];
    experiment.removeUser(disconnectedUserId);
    expect(
      experiment._userToAssignedNode.get(disconnectedUserId)
    ).toBeUndefined();

    // Play another round.
    const [data2, err2] = experiment.playRound();
    expect(err2).toBeNull();

    // Ensure that the next earliest user is playing.
    const nextEarliestUserId = Array.from(experiment.lobby.values())[5].id;
    expect(
      experiment._userToAssignedNode.get(nextEarliestUserId)
    ).not.toBeUndefined();

    experiment.cleanUp();
  });

  test("Experiment should assign each user to two other unique users in both rounds with disconnects", () => {
    for (let i = 0; i < 2; i++) {
      const [data, err] = experiment.playRound();
      expect(err).toBeNull();

      const conversations = {};
      for (const conversation of data.conversations) {
        const speakers = [conversation.source.id, conversation.target.id];
        expect(speakers.length).toBe(2);
        expect(speakers[0]).not.toBe(speakers[1]);
        speakers.sort();

        const pairHash = `${speakers[0]}-${speakers[1]}`;
        expect(conversations[pairHash]).toBeUndefined();
        conversations[pairHash] = true;
      }

      // Disconnect a user.
      const disconnectedUserId = Array.from(
        experiment._userToAssignedNode.keys()
      )[0];
      experiment.removeUser(disconnectedUserId);
    }
  });
});
