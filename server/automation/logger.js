const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message, meta }) => `${timestamp} [${level}] ${message} ${meta ? JSON.stringify(meta) : ''}`)
  ),
  transports: [
      new transports.Console(),
      new transports.File({ filename: path.join(logDir, 'automation.log') })
  ],
});

module.exports = logger;
