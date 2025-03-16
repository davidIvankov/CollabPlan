import pino from 'pino'

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty', // Pretty-print logs (optional)
  },
})

export default logger
