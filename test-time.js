const { format } = require("date-fns");
const { toZonedTime } = require("date-fns-tz");

const date = new Date("2026-04-08T15:00:00Z"); // 15:00 UTC = 10:00 AM CDT
const zonedDate = toZonedTime(date, "America/Chicago");
console.log(format(zonedDate, "MMM d, yyyy h:mm a"));
