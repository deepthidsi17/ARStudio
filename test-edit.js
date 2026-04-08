const { format } = require("date-fns");
const { toZonedTime } = require("date-fns-tz");
const d = "2026-04-08T15:00:00.000Z";
const STUDIO_TZ = "America/Chicago";
const zoned = toZonedTime(d, STUDIO_TZ);
console.log(format(zoned, "yyyy-MM-dd"));
console.log(format(zoned, "HH:mm"));
console.log(format(zoned, "h:mm a"));
