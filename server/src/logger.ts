import pino from 'pino'

const logger = pino({
  level: 'info',
  transport: undefined,
})

export default logger
