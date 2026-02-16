import cron from 'node-cron';
import { generateDailyTrips } from '../Services/tripGenerationService.js';

// NOTE: DISABLED AUTOMATIC TRIP GENERATION
// Trips should only be generated when COMMUTER makes booking
// This prevents creating empty trips that no one has booked

// Schedule daily trip generation at 12:00 AM every day (midnight) - DISABLED
const dailyTripGeneration = cron.schedule('0 0 * * *', async () => {
    console.log('[v0] DISABLED: Daily trip generation - trips generated only on passenger booking');
    // await generateDailyTrips(); // DISABLED
}, {
    scheduled: false, // DISABLED
    timezone: "Asia/Kolkata"
});

// Schedule trip generation every 6 hours for immediate availability - DISABLED
const frequentTripGeneration = cron.schedule('0 */6 * * *', async () => {
    console.log('[v0] DISABLED: Frequent trip generation - trips generated only on passenger booking');
    // await generateDailyTrips(); // DISABLED
}, {
    scheduled: false, // DISABLED
    timezone: "Asia/Kolkata"
});

// Schedule trip generation every 1 hour for testing and immediate updates - DISABLED
const hourlyTripGeneration = cron.schedule('0 * * * *', async () => {
    console.log('[v0] DISABLED: Hourly trip generation - trips generated only on passenger booking');
    // await generateDailyTrips(); // DISABLED
}, {
    scheduled: false, // DISABLED
    timezone: "Asia/Kolkata"
});

// Also run immediately on server start - DISABLED
const runImmediateGeneration = async () => {
    console.log('[v0] DISABLED: Immediate trip generation - trips generated only on passenger booking');
    // await generateDailyTrips(); // DISABLED
};

console.log('[v0] Trip generation cron jobs DISABLED');
console.log('[v0] - Daily: DISABLED');
console.log('[v0] - Frequent: DISABLED');
console.log('[v0] - Hourly: DISABLED');
console.log('[v0] Trips will only be generated when COMMUTER makes booking');

export { dailyTripGeneration, frequentTripGeneration, hourlyTripGeneration, runImmediateGeneration };
