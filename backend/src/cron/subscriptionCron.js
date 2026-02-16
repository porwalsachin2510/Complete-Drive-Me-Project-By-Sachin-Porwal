import { processRenewals, sendRenewalReminders } from "../controllers/subscriptionSettingsController.js";

// Process renewals daily at midnight
export const processDailyRenewals = async () => {
    try {
        console.log("🔄 Starting daily renewal processing...");
        await processRenewals();
        console.log("✅ Daily renewal processing completed");
    } catch (error) {
        console.error("❌ Error in daily renewal processing:", error);
    }
};

// Send renewal reminders daily at 9 AM
export const sendDailyRenewalReminders = async () => {
    try {
        console.log("📧 Starting daily renewal reminders...");
        await sendRenewalReminders();
        console.log("✅ Daily renewal reminders completed");
    } catch (error) {
        console.error("❌ Error in daily renewal reminders:", error);
    }
};

// Cron schedule examples (use with node-cron package)
/*
import cron from 'node-cron';

// Process renewals daily at midnight (00:00)
cron.schedule('0 0 * * *', processDailyRenewals);

// Send reminders daily at 9 AM (09:00)
cron.schedule('0 9 * * *', sendDailyRenewalReminders);
*/
