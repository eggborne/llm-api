import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  format: format.combine(
    format.printf(({ message }) => {
      const formattedMessage = typeof message === 'object'
        ? JSON.stringify(message, null, 2)
        : message; 

      return `${formattedMessage}`;
    })
  ),
  transports: [
    new transports.Console(),  // Console logging
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

export default logger;
