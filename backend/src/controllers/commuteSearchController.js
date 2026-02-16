import User from "../models/User.js"
import Vehicle from "../models/Vehicle.js"
import Contract from "../models/Contract.js"
import Driver from "../models/Driver.js"
import Route from "../models/Route.js"
import B2CPartnerRoute from "../models/B2CPartnerRoute.js"
import B2CPartnerSchedule from "../models/B2CPartnerSchedule.js"
import B2CPartnerTrip from "../models/B2CPartnerTrip.js"
/* ======================================================
   UTILITY FUNCTIONS
====================================================== */

const normalize = (val) => {
    if (typeof val === "string") return val.toLowerCase().trim()
    if (val?.location && typeof val.location === "string") {
        return val.location.toLowerCase().trim()
    }
    return ""
}

// Check location match (from / to / stops)
const isLocationMatch = (searchLocation, from, to, stops = []) => {
    if (!searchLocation) return true
    const search = normalize(searchLocation)

    if (from && normalize(from).includes(search)) return true
    if (to && normalize(to).includes(search)) return true

    return stops.some((stop) => {
        const stopLocation = typeof stop === "string" ? stop : stop.location
        return normalize(stopLocation).includes(search)
    })
}

// Build ordered route path with times
const buildFullPathWithTimes = (from, stops = [], to, inboundStart) => {
    const path = []

    // Add fromLocation with inboundStart time
    path.push({
        location: from,
        time: inboundStart || "N/A",
        isFromLocation: true,
    })

    // Add stops with their times
    if (stops && stops.length > 0) {
        stops.forEach((stop) => {
            if (typeof stop === "string") {
                path.push({ location: stop, time: "N/A", isStop: true })
            } else {
                path.push({
                    location: stop.location || stop,
                    time: stop.time || "N/A",
                    isStop: true,
                })
            }
        })
    }

    // Add toLocation (usually arrival time would be calculated)
    path.push({
        location: to,
        time: "N/A", // Can be calculated if needed
        isToLocation: true,
    })

    return path
}

const buildTravelPath = (from, stops, to, startTime) => {
    const path = []

    path.push({
        location: from,
        time: startTime || "N/A",
        isFromLocation: true,
    })

    for (const s of stops || []) {
        path.push({
            location: s.location,
            time: s.time || "N/A",
            isStop: true,
        })
    }

    path.push({
        location: to,
        time: "N/A",
        isToLocation: true,
    })

    return path
}


const findIndex = (path, location) => {
    if (!location) return -1
    const l = normalize(location)
    return path.findIndex((p) => normalize(p.location).includes(l))
}

const dayMatching = (selected = [], available = []) => {
    if (!selected.length) {
        return {
            allAvailable: true,
            matchedDays: available,
            notAvailableDays: [],
        }
    }

    const s = selected.map((d) => d.toUpperCase())
    const a = available.map((d) => d.toUpperCase())

    const matchedDays = s.filter((d) => a.includes(d))
    const notAvailableDays = s.filter((d) => !a.includes(d))

    return {
        allAvailable: notAvailableDays.length === 0,
        matchedDays,
        notAvailableDays,
    }
}

// Find index of searched location in path
const findLocationIndex = (path = [], location) => {
    if (!location) return -1
    const search = normalize(location)
    return path.findIndex((p) => normalize(p.location).includes(search))
}

// Get arrival time for pickup/dropoff location
const getArrivalTime = (path, locationIndex) => {
    if (locationIndex >= 0 && locationIndex < path.length) {
        return path[locationIndex].time || "N/A"
    }
    return "N/A"
}

// Match selected days with available days
const matchDays = (selectedDays = [], availableDays = []) => {
    if (!selectedDays || selectedDays.length === 0) {
        return {
            allAvailable: true,
            matchedDays: availableDays,
            notAvailableDays: [],
        }
    }

    const normalizedSelectedDays = selectedDays.map((day) => day.toUpperCase())
    const normalizedAvailableDays = availableDays.map((day) => day.toUpperCase())

    const matchedDays = normalizedSelectedDays.filter((day) => normalizedAvailableDays.includes(day))

    const notAvailableDays = normalizedSelectedDays.filter((day) => !normalizedAvailableDays.includes(day))

    return {
        allAvailable: notAvailableDays.length === 0,
        matchedDays: matchedDays,
        notAvailableDays: notAvailableDays,
    }
}

// Decide full route OR trimmed route with arrival times
const getTravelPath = ({
    from,
    to,
    stops,
    inboundStart,
    pickupLocation,
    dropoffLocation,
    selectedDays,
    availableDays,
}) => {
    const fullPath = buildFullPathWithTimes(from, stops, to, inboundStart)

    // Match days
    const dayMatching = matchDays(selectedDays, availableDays)

    // 🔹 No search → full route
    if (!pickupLocation && !dropoffLocation) {
        return {
            fromLocation: from,
            toLocation: to,
            travelPath: fullPath,
            pickupArrivalTime: fullPath[0].time,
            dropoffArrivalTime: fullPath[fullPath.length - 1].time,
            dayMatching,
        }
    }

    const pickupIndex = pickupLocation ? findLocationIndex(fullPath, pickupLocation) : 0

    const dropIndex = dropoffLocation ? findLocationIndex(fullPath, dropoffLocation) : fullPath.length - 1

    if (pickupIndex === -1 || dropIndex === -1) return null
    if (pickupIndex >= dropIndex) return null

    const slicedPath = fullPath.slice(pickupIndex, dropIndex + 1)

    return {
        fromLocation: slicedPath[0].location,
        toLocation: slicedPath[slicedPath.length - 1].location,
        travelPath: slicedPath,
        pickupArrivalTime: getArrivalTime(fullPath, pickupIndex),
        dropoffArrivalTime: getArrivalTime(fullPath, dropIndex),
        dayMatching,
    }
}

/* ======================================================
   MAIN CONTROLLER
====================================================== */

export const searchCommuteRoutes = async (req, res) => {
    try {
        const userId = req.userId

        const {
            pickupLocation,
            dropoffLocation,
            filterType, // all | matched
            selectedDays, // User selected days
            nationality, // Added nationality parameter for location-based filtering
        } = req.query

        // Parse selectedDays if it's a string
        let parsedSelectedDays = []
        if (selectedDays) {
            try {
                parsedSelectedDays = typeof selectedDays === "string" ? JSON.parse(selectedDays) : selectedDays
            } catch (e) {
                console.log("Error parsing selectedDays:", e)
            }
        }

        const user = await User.findById(userId).select("companyId role")

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        const routes = []

        /* =====================================================
           CORPORATE EMPLOYEE FLOW
        ====================================================== */
        if (user.companyId) {
            const company = await User.findById(user.companyId).select(
                "companyName companyLogo"
            )

            const contracts = await Contract.find({
                corporateOwnerId: user.companyId,
                status: "ACTIVE",
                "vehicleAccess.isActive": true,
            })

            for (const contract of contracts) {
                for (const v of contract.vehicles || []) {
                    for (const assigned of v.assignedVehicles || []) {
                        if (assigned.status !== "ACTIVE") continue

                        const route = await Route.findOne({
                            _id: assigned.routeDetails,
                            status: "ACTIVE",
                        })

                        if (!route) continue

                        if (
                            filterType === "matched" &&
                            (pickupLocation || dropoffLocation)
                        ) {
                            const pMatch = isLocationMatch(
                                pickupLocation,
                                route.fromLocation,
                                route.toLocation,
                                route.stopPoints
                            )
                            const dMatch = isLocationMatch(
                                dropoffLocation,
                                route.fromLocation,
                                route.toLocation,
                                route.stopPoints
                            )
                            if (!pMatch || !dMatch) continue
                        }

                        const vehicle = await Vehicle.findById(assigned.vehicleId)
                        if (!vehicle || !vehicle.isActive) continue

                        let driver
                        if (assigned.driverModel === "Driver") {
                            // For B2B Partner Drivers, find User account with driverId reference
                            driver = await User.findOne({
                                driverId: assigned.driverId,
                                driverModel: "Driver",
                                role: "B2B_PARTNER_DRIVER"
                            }).populate('driverId', 'name email phone')
                        } else if (assigned.driverModel === "CorporateDriver") {
                            // For Corporate Drivers, find User account with driverId reference
                            driver = await User.findOne({
                                driverId: assigned.driverId,
                                driverModel: "CorporateDriver",
                                role: "CORPORATE_DRIVER"
                            }).populate('driverId', 'name email phone')
                        }

                        if (!driver) continue

                        const travelPath = buildTravelPath(
                            route.fromLocation,
                            route.stopPoints,
                            route.toLocation,
                            route.startTime
                        )

                        const pIndex = pickupLocation
                            ? findIndex(travelPath, pickupLocation)
                            : 0
                        const dIndex = dropoffLocation
                            ? findIndex(travelPath, dropoffLocation)
                            : travelPath.length - 1

                        if (pIndex === -1 || dIndex === -1 || pIndex >= dIndex)
                            continue

                        const slicedPath = travelPath.slice(pIndex, dIndex + 1)

                        routes.push({
                            routeId: route._id,
                            contractId: route.contractId,
                            corporateOwnerId: user.companyId,
                            driverId: driver._id,
                            driverName: driver.fullName,
                            driverImage: driver.profileImage,
                            company: company.companyName,
                            companyLogo: company.companyLogo || null,

                            fromLocation: slicedPath[0].location,
                            toLocation: slicedPath[slicedPath.length - 1].location,
                            travelPath: slicedPath,

                            pickupArrivalTime: slicedPath[0].time,
                            dropoffArrivalTime:
                                slicedPath[slicedPath.length - 1].time || "N/A",

                            departureTime: route.startTime,
                            startDate: route.routeStartDate,

                            availableSeats:
                                route.availableSeats || 0,
                            totalSeats:
                                vehicle.capacity?.seatingCapacity || 0,

                            daysOfWeek:
                                route.availableDays || [],
                            dayMatching: dayMatching(
                                parsedSelectedDays,
                                route.availableDays || []
                            ),

                            availableDays: route.availableDays || [],

                            vehicleModel: vehicle.vehicleName,
                            vehiclePlate: vehicle.registrationNumber,
                            images: vehicle.photos?.map((p) => p.url) || [],

                            type: "company",
                        })
                    }
                }
            }

            return res.status(200).json({
                success: true,
                userType: "company",
                totalRoutes: routes.length,
                routes,
            })
        }

        /* ======================================================
               NORMAL / B2C COMMUTER ROUTES
            ====================================================== */
        console.log("Searching for B2C Partner routes...")
        
        // Get B2C Partner Routes directly from B2CPartnerRoute collection
        const b2cRoutes = await B2CPartnerRoute.find({
            status: "Active"
        }).populate('b2cPartnerId', 'fullName companyLogo')

        console.log("Found B2C routes:", b2cRoutes.length)

        for (const route of b2cRoutes) {
            if (!route.availableSeats || route.availableSeats <= 0) continue

            console.log("Processing route:", route._id, "by partner:", route.b2cPartnerId?.fullName)

            // Get schedule for this route
            console.log("Finding schedule for route:", route._id)
            const schedule = await B2CPartnerSchedule.findOne({
                routeId: route._id,
                isActive: true,
                status: "Active"
            }).populate('routeId')

            if (!schedule) {
                console.log("No active schedule found for route:", route._id)
                continue
            }

            console.log("Found schedule:", schedule._id, "with trip times:", schedule.tripTimes?.length || 0)

            // Get upcoming trips for this route
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            console.log("Finding trips from today:", today.toDateString())
            const upcomingTrips = await B2CPartnerTrip.find({
                routeId: route._id,
                tripDate: { $gte: today },
                status: "Scheduled"
            }).sort({ tripDate: 1, startTime: 1 }).limit(10)

            console.log("Found upcoming trips:", upcomingTrips.length)

            // Format trip data for commuter
            const formattedTrips = upcomingTrips.map(trip => ({
                tripId: trip._id,
                tripDate: trip.tripDate,
                startTime: trip.startTime,
                endTime: trip.endTime,
                tripType: trip.tripType,
                fromLocation: trip.fromLocation,
                toLocation: trip.toLocation,
                stopPoints: trip.stopPoints || [],
                totalSeats: trip.totalSeats,
                availableSeats: trip.availableSeats,
                pricing: trip.pricing,
                driverInfo: trip.driverInfo,
                vehicleInfo: trip.vehicleInfo
            }))

            let shouldInclude = false

            if (filterType === "matched" && (pickupLocation || dropoffLocation)) {
                const pickupMatch = isLocationMatch(pickupLocation, route.fromLocation, route.toLocation, route.stopPoints)
                const dropMatch = isLocationMatch(dropoffLocation, route.fromLocation, route.toLocation, route.stopPoints)
                shouldInclude = pickupMatch && dropMatch
            } else {
                shouldInclude = true
            }

            if (!shouldInclude) continue

            // Create travel path with schedule data
            const travelData = getTravelPath({
                from: route.fromLocation,
                to: route.toLocation,
                stops: route.stopPoints || [],
                inboundStart: route.startTime,
                pickupLocation,
                dropoffLocation,
                selectedDays: parsedSelectedDays,
                availableDays: schedule.availableDays || [],
            })

            if (!travelData) continue

            routes.push({
                routeId: route._id,
                operator: route.b2cPartnerId?.fullName || "Unknown Operator",
                operatorId: route.b2cPartnerId?._id,
                companyLogo: route.b2cPartnerId?.companyLogo || null,

                fromLocation: travelData.fromLocation,
                toLocation: travelData.toLocation,
                travelPath: travelData.travelPath,

                // Schedule-based data
                scheduleId: schedule._id,
                scheduleName: schedule.scheduleName,
                availableDays: schedule.availableDays || [],
                tripTimes: schedule.tripTimes || [],
                upcomingTrips: formattedTrips,

                // Legacy compatibility
                pickupArrivalTime: travelData.pickupArrivalTime,
                dropoffArrivalTime: travelData.dropoffArrivalTime,
                departureTime: route.startTime,
                startDate: route.routeStartDate,
                roundTripPrice: route.pricing?.roundTripPrice,
                oneWayPrice: route.pricing?.oneWayPrice,
                monthlyPrice: route.pricing?.monthlyOneWayPrice,
                availableSeats: route.availableSeats,
                totalSeats: route.totalSeats,
                dayMatching: travelData.dayMatching,

                driverName: route.assignedDriver?.name,
                vehicleModel: route.assignedVehicle?.model,
                vehiclePlate: route.assignedVehicle?.licensePlate,
                images: route.images || [],
                type: "b2c",
            })
        }

        return res.status(200).json({
            success: true,
            userType: "normal",
            totalRoutes: routes.length,
            routes,
        })
    } catch (error) {
        console.error("searchCommuteRoutes error:", error)
        return res.status(500).json({
            success: false,
            message: "Server error while searching routes",
        })
    }
}
