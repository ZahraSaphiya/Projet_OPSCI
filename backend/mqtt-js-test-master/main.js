import mqtt from 'mqtt'

const TOPIC = process.env.TOPIC || 'topic'
const ADDRESS = process.env.ADDRESS || 'ws://localhost:1883'

const client = mqtt.connect(ADDRESS)

client.on('connect', (err) => {
  if (err) console.error(err)
  console.log('connected')
  console.log('topic: ', TOPIC)
  let t = 0
  setInterval(() => client.publish(TOPIC, 'Hello mqtt' + t++), 1000)
})
