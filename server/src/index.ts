import createApp from './app'
import { createDatabase } from './database'
import config from './config'

const database = createDatabase(config.database)
const app = createApp(database)

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Server is running at http://localhost:${config.port}/api/v1/trpc`
  )
})
