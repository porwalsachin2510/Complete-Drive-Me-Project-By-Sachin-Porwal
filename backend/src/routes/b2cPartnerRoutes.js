import express from "express"
const router = express.Router()
import {
    getB2CPartnerEarnings,
    getB2CPartnerFleet,
    createB2CPartnerVehicle,
    updateB2CPartnerVehicle,
    deleteB2CPartnerVehicle,
    createB2CPartnerTrip,
    getB2CPartnerProfile,
    updateB2CPartnerProfile,
} from "../controllers/adminController.js"
import {
    createB2CPartnerDriver,
    getB2CPartnerDrivers,
    updateB2CPartnerDriver,
    deleteB2CPartnerDriver,
} from "../controllers/driverController.js"
import {
    createB2CPartnerRoute,
    getB2CPartnerRoutes,
    deleteB2CPartnerRoute,
    getRouteTripSeatAvailability,
    getPublicRouteTripSeatAvailability
} from "../controllers/b2cTripController.js"
import { verifyToken, checkB2CPartnerRole } from "../middleware/auth.js"
import { upload } from "../Config/multerConfig.js"

// B2C Partner Earnings
router.get("/earnings", verifyToken, checkB2CPartnerRole, getB2CPartnerEarnings)

// B2C Partner Fleet Management
router.get("/fleet", verifyToken, checkB2CPartnerRole, getB2CPartnerFleet)
router.post(
    "/vehicles", 
    verifyToken, 
    checkB2CPartnerRole, 
    upload.fields([
        { name: "images", maxCount: 10 }
    ]), 
    createB2CPartnerVehicle
)
router.put(
    "/vehicles/:vehicleId", 
    verifyToken, 
    checkB2CPartnerRole, 
    upload.fields([
        { name: "images", maxCount: 10 }
    ]), 
    updateB2CPartnerVehicle
)
router.delete("/vehicles/:vehicleId", verifyToken, checkB2CPartnerRole, deleteB2CPartnerVehicle)

// B2C Partner Drivers Management
router.get("/drivers", verifyToken, checkB2CPartnerRole, getB2CPartnerDrivers)
router.post(
    "/drivers", 
    verifyToken, 
    checkB2CPartnerRole, 
    upload.fields([
        { name: "driverImage", maxCount: 1 },
        { name: "license", maxCount: 1 },
        { name: "passport", maxCount: 1 },
        { name: "visa", maxCount: 1 },
        { name: "medicalCertificate", maxCount: 1 }
    ]), 
    createB2CPartnerDriver
)
router.put("/drivers/:driverId", verifyToken, checkB2CPartnerRole, updateB2CPartnerDriver)
router.delete("/drivers/:driverId", verifyToken, checkB2CPartnerRole, deleteB2CPartnerDriver)

// B2C Partner Routes
router.get("/routes", verifyToken, checkB2CPartnerRole, getB2CPartnerRoutes)
router.post("/routes", verifyToken, checkB2CPartnerRole, createB2CPartnerRoute)
router.delete("/routes/:routeId", verifyToken, checkB2CPartnerRole, deleteB2CPartnerRoute)
router.get("/routes/:routeId/trips/seat-availability", verifyToken, checkB2CPartnerRole, getRouteTripSeatAvailability)
router.get("/public/routes/:routeId/trips/seat-availability", getPublicRouteTripSeatAvailability)

// B2C Partner Trips
router.post("/trips", verifyToken, checkB2CPartnerRole, createB2CPartnerTrip)

// B2C Partner Profile
router.get("/profile", verifyToken, checkB2CPartnerRole, getB2CPartnerProfile)
router.put("/profile", verifyToken, checkB2CPartnerRole, updateB2CPartnerProfile)

export default router
