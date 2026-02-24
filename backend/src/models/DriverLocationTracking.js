import mongoose from 'mongoose';

const driverLocationTrackingSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'B2CPartnerTrip',
        required: true,
        index: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        index: true
    },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        default: ''
    },
    speed: {
        type: Number,
        default: 0
    },
    heading: {
        type: Number,
        default: 0
    },
    accuracy: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'driverLocationTrackings',
    timestamps: true
});

// Index for querying locations by trip and time
driverLocationTrackingSchema.index({ tripId: 1, createdAt: 1 });
driverLocationTrackingSchema.index({ driverId: 1, createdAt: 1 });
driverLocationTrackingSchema.index({ bookingId: 1, createdAt: 1 });

// Geospatial index for nearby drivers queries
driverLocationTrackingSchema.index({ coordinates: '2dsphere' });

export default mongoose.model('DriverLocationTracking', driverLocationTrackingSchema);
