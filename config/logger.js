import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "errorLogPath", level: "error" }),
    new winston.transports.File({ filename: "combinedLogPath" }),
  ],
});

if (process.env.NODE_ENV !== "development") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.printf((info) => {
          return `${info.timestamp} ${info.level}: ${info.message}`;
        })
      ),
    })
  );
}

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export default logger;
