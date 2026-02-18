import B2CPartnerTrip from "../models/B2CPartnerTrip.js";
import {
    updateTripLocation,
    startTrip as startTripService,
    completeTrip as completeTripService,
    reportEmergency as reportEmergencyService,
    reportTripDelay,
} from "../Services/locationTrackingService.js";

// Get active trip for driver
export const getActiveTrip = async (req, res) => {
    try {
        const driverId = req.userId;
        const userId = req.userId;

        // Find active trip for this driver
        const trip = await B2CPartnerTrip.findOne({
            $or: [
                { driverId: driverId },
                { 'assignedDriver': driverId }
            ],
            status: { $in: ['SCHEDULED', 'IN_PROGRESS'] }
        }).populate('routeId passengers.user');

        if (!trip) {
            return res.json({
                success: true,
                trip: null
            });
        }

        res.json({
            success: true,
            trip
        });

    } catch (error) {
        console.error('Error getting active trip:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get active trip'
        });
    }
};

// Update driver location
export const updateLocation = async (req, res) => {
    try {
        const { tripId, latitude, longitude, address, speed, timestamp } = req.body;
        const driverId = req.userId;

        // Update trip location
        const result = await updateTripLocation(
            tripId,
            latitude,
            longitude,
            address,
            speed
        );

        res.json({
            success: true,
            message: 'Location updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update location'
        });
    }
};

// Start trip
export const startTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const driverId = req.userId;

        const result = await startTripService(tripId, driverId);

        res.json({
            success: true,
            message: 'Trip started successfully',
            data: result
        });

    } catch (error) {
        console.error('Error starting trip:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start trip'
        });
    }
};

// Complete trip
export const completeTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const driverId = req.userId;

        const result = await completeTripService(tripId);

        res.json({
            success: true,
            message: 'Trip completed successfully',
            data: result
        });

    } catch (error) {
        console.error('Error completing trip:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete trip'
        });
    }
};

// Report emergency
export const reportEmergency = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { emergencyType, message, location } = req.body;
        const driverId = req.userId;

        const result = await reportEmergencyService(
            tripId,
            emergencyType,
            message,
            location
        );

        res.json({
            success: true,
            message: 'Emergency reported successfully',
            data: result
        });

    } catch (error) {
        console.error('Error reporting emergency:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to report emergency'
        });
    }
};

// Report trip delay
export const delayTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { delayMinutes, reason } = req.body;
        const driverId = req.userId;

        const result = await reportTripDelay(
            tripId,
            delayMinutes,
            reason
        );

        res.json({
            success: true,
            message: 'Trip delay reported successfully',
            data: result
        });

    } catch (error) {
        console.error('Error reporting trip delay:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to report trip delay'
        });
    }
};

export default {
    getActiveTrip,
    updateLocation,
    startTrip,
    completeTrip,
    reportEmergency,
    delayTrip
};
