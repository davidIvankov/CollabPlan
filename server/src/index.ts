import createApp from './app'
import { createDatabase } from './database'
import config from './config'
import logger from './logger'

logger.info('something is logging')

const database = createDatabase(config.database)
const app = createApp(database)

app.listen(config.port, () => {
  logger.info(
    `Server is running at http://localhost:${config.port}/api/v1/trpc`
  )
  // eslint-disable-next-line no-console
  console.log(
    `Server is running at http://localhost:${config.port}/api/v1/trpc`
  )
})
