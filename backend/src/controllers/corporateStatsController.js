import Contract from "../models/Contract.js"
import CorporateEmployee from "../models/CorporateEmployee.js"
import Requirement from "../models/Requirement.js"
import VehicleAssignment from "../models/VehicleAssignment.js"
import CorporateBooking from "../models/CorporateBooking.js"

export const getCorporateStats = async (req, res) => {
    try {
        const corporateId = req.userId

        // Count active contracts for this corporate
        const activeContracts = await Contract.countDocuments({
            $or: [
                { corporateId: corporateId },
                { clientId: corporateId }
            ],
            status: { $in: ["ACTIVE", "active", "Active"] }
        })

        // Count total employees
        const totalEmployees = await CorporateEmployee.countDocuments({
            corporateId: corporateId
        })

        // Count active vehicle assignments (routes)
        const activeRoutes = await VehicleAssignment.countDocuments({
            $or: [
                { corporateId: corporateId },
                { assignedBy: corporateId }
            ],
            status: { $in: ["ACTIVE", "active", "Active", "ASSIGNED", "assigned"] }
        })

        // Count monthly bookings
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const monthlyBookings = await CorporateBooking.countDocuments({
            corporateId: corporateId,
            createdAt: { $gte: startOfMonth }
        })

        // Count active requirements
        const activeRequirements = await Requirement.countDocuments({
            corporateId: corporateId,
            status: { $in: ["OPEN", "open", "ACTIVE", "active", "PENDING", "pending"] }
        })

        res.status(200).json({
            success: true,
            data: {
                activeContracts,
                totalEmployees,
                activeRoutes,
                monthlyBookings,
                activeRequirements
            }
        })
    } catch (error) {
        console.error("Error fetching corporate stats:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch corporate stats",
            data: {
                activeContracts: 0,
                totalEmployees: 0,
                activeRoutes: 0,
                monthlyBookings: 0,
                activeRequirements: 0
            }
        })
    }
}
