# MQTT test

To test MQTT broker

```sh
yarn #to install dependencies
```

```sh
node read.js #run a client that listen to topic and print message
```

```sh
node main.js #run a client that send message to topic every second
```

## configuration

Default value you can change in the environment variables

```
TOPIC="topic"
ADDRESS="ws://localhost:1883"
```
