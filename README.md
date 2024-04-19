## Network Infra Project

A library to build interactive online network experiments. This library should be hooked up to a larger system that provides interactivity to users (e.g., socket-based server and web application). Provides a simple implementation of a dyadic conversation experiment.


### References
Please see the [specifications repository](https://github.com/comanlab/technical-evaluations).

### Installation

1. In the project's root directory, run `npm install`.
2. Run tests with `npm run test`.

### Usage

An abstract `NetworkExperiment` is provided. A subclass must implement its interface:
- `addUser()` adds a user to the experiment's lobby (but not in play).
- `removeUser()` removes a user from the experiment's lobby and play.
- `cleanUp()` cleans up the experiment.

An example implementation is provided:
```js
const { DyadicConvoExperiment } = require("./DyadicConvoExperiment");

// Initialize the experiment.
const experiment =  DyadicConvoExperiment();

// Add users to the experiment.
for (let i=0; i<6; i++) {
    const user = { id: `user${i}`, created_at: new Date().getTime() };
    experiment.addUser(user);
}

// Run the experiment.
const [data, err] = experiment.playRound();
if (err != null) {
    // Error handling.
}
```

Type definitions are provided in `typedefs.js` and throughout the source code.
