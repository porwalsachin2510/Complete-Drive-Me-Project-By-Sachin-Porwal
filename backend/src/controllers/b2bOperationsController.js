import Contract from "../models/Contract.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";
import VehicleAssignment from "../models/VehicleAssignment.js";
import { sendEmail } from "../Services/emailService.js";

// Create dedicated routes for corporate client
export const createDedicatedRoutes = async (req, res) => {
    try {
        const {
            contractId,
            routePlans,
            vehicleAssignments,
            driverAssignments,
            scheduleConfig,
            specialInstructions
        } = req.body;

        const b2bPartnerId = req.userId;

        // Verify contract exists and belongs to this partner
        const contract = await Contract.findOne({
            _id: contractId,
            b2bPartnerId
        });

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: "Contract not found"
            });
        }

        // Create route plans
        const createdRoutes = [];
        for (const routePlan of routePlans) {
            // This would create route records in a Route model
            // For now, store in contract for simplicity
            createdRoutes.push({
                routeName: routePlan.routeName,
                pickupPoints: routePlan.pickupPoints,
                dropoffPoints: routePlan.dropoffPoints,
                timing: routePlan.timing,
                vehicleType: routePlan.vehicleType,
                estimatedCapacity: routePlan.estimatedCapacity
            });
        }

        // Update contract with route details
        contract.dedicatedRoutes = createdRoutes;
        contract.vehicleAssignments = vehicleAssignments;
        contract.driverAssignments = driverAssignments;
        contract.scheduleConfig = scheduleConfig;
        contract.specialInstructions = specialInstructions;
        contract.operationsSetupAt = new Date();
        contract.status = "OPERATIONAL";

        await contract.save();

        // Create vehicle assignments
        for (const assignment of vehicleAssignments) {
            const vehicleAssignment = new VehicleAssignment({
                contractId,
                vehicleId: assignment.vehicleId,
                driverId: assignment.driverId,
                routeId: assignment.routeId,
                schedule: assignment.schedule,
                status: "ASSIGNED",
                assignedAt: new Date()
            });

            await vehicleAssignment.save();

            // Update vehicle and driver status
            await Vehicle.findByIdAndUpdate(assignment.vehicleId, {
                status: "ASSIGNED",
                currentContractId: contractId
            });

            await Driver.findByIdAndUpdate(assignment.driverId, {
                status: "ASSIGNED",
                currentContractId: contractId
            });
        }

        // Notify client of operational status
        await notifyClientOperationsStart(contract);

        res.status(201).json({
            success: true,
            message: "Dedicated routes created successfully",
            data: {
                contractId: contract._id,
                routesCreated: createdRoutes.length,
                vehicleAssignments: vehicleAssignments.length
            }
        });

    } catch (error) {
        console.error("Error creating dedicated routes:", error);
        res.status(500).json({
            success: false,
            message: "Error creating dedicated routes",
            error: error.message
        });
    }
};

// Get seat map for vehicle
export const getVehicleSeatMap = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const b2bPartnerId = req.userId;

        // Verify vehicle belongs to this partner
        const vehicle = await Vehicle.findOne({
            _id: vehicleId,
            b2bPartnerId
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        // Get seat assignments for this vehicle
        const seatAssignments = await VehicleAssignment.find({
            vehicleId,
            b2bPartnerId
        })
        .populate('contractId', 'contractNumber')
        .populate('driverId', 'fullName contactNumber')
        .sort({ assignedAt: -1 });

        // Create seat map structure
        const seatMap = {
            vehicleId: vehicle._id,
            vehicleNumber: vehicle.vehicleNumber,
            vehicleType: vehicle.type,
            capacity: vehicle.capacity,
            currentAssignments: seatAssignments.map(assignment => ({
                assignmentId: assignment._id,
                contractId: assignment.contractId._id,
                contractNumber: assignment.contractId.contractNumber,
                driverId: assignment.driverId._id,
                driverName: assignment.driverId.fullName,
                driverContact: assignment.driverId.contactNumber,
                routeId: assignment.routeId,
                schedule: assignment.schedule,
                status: assignment.status,
                assignedAt: assignment.assignedAt
            })),
            seatConfiguration: generateSeatConfiguration(vehicle.capacity),
            standbySeats: Math.floor(vehicle.capacity * 0.1) // 10% standby
        };

        res.status(200).json({
            success: true,
            data: {
                seatMap
            }
        });

    } catch (error) {
        console.error("Error getting vehicle seat map:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving seat map",
            error: error.message
        });
    }
};

// Allocate employees to seats
export const allocateEmployeesToSeats = async (req, res) => {
    try {
        const { vehicleId, contractId } = req.body;
        const { employeeAssignments } = req.body;
        const b2bPartnerId = req.userId;

        // Verify contract and vehicle
        const contract = await Contract.findOne({
            _id: contractId,
            b2bPartnerId
        });

        const vehicle = await Vehicle.findOne({
            _id: vehicleId,
            b2bPartnerId
        });

        if (!contract || !vehicle) {
            return res.status(404).json({
                success: false,
                message: "Contract or vehicle not found"
            });
        }

        // Process employee assignments
        const assignments = [];
        for (const empAssignment of employeeAssignments) {
            // Create seat assignment record
            const assignment = new VehicleAssignment({
                contractId,
                vehicleId,
                employeeId: empAssignment.employeeId,
                seatNumber: empAssignment.seatNumber,
                routeId: empAssignment.routeId,
                schedule: empAssignment.schedule,
                status: "ALLOCATED",
                assignedAt: new Date(),
                isTemporary: empAssignment.isTemporary || false,
                temporaryUntil: empAssignment.temporaryUntil || null
            });

            await assignment.save();
            assignments.push({
                assignmentId: assignment._id,
                employeeId: empAssignment.employeeId,
                seatNumber: empAssignment.seatNumber,
                status: "ALLOCATED"
            });
        }

        // Update vehicle capacity tracking
        const allocatedSeats = employeeAssignments.length;
        const availableSeats = vehicle.capacity - allocatedSeats;

        await Vehicle.findByIdAndUpdate(vehicleId, {
            allocatedSeats,
            availableSeats,
            lastAllocationAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: "Employees allocated to seats successfully",
            data: {
                assignments,
                vehicleId: vehicle._id,
                allocatedSeats,
                availableSeats,
                utilizationRate: ((allocatedSeats / vehicle.capacity) * 100).toFixed(2)
            }
        });

    } catch (error) {
        console.error("Error allocating employees to seats:", error);
        res.status(500).json({
            success: false,
            message: "Error allocating employees to seats",
            error: error.message
        });
    }
};

// Handle temporary transfers
export const handleTemporaryTransfer = async (req, res) => {
    try {
        const { employeeId, newVehicleId, newRouteId, transferReason, duration } = req.body;
        const b2bPartnerId = req.userId;

        // Get current assignment
        const currentAssignment = await VehicleAssignment.findOne({
            employeeId,
            b2bPartnerId,
            status: "ALLOCATED"
        }).sort({ assignedAt: -1 });

        if (!currentAssignment) {
            return res.status(404).json({
                success: false,
                message: "No current assignment found for employee"
            });
        }

        // Create temporary transfer record
        const transfer = new VehicleAssignment({
            contractId: currentAssignment.contractId,
            vehicleId: newVehicleId,
            employeeId,
            routeId: newRouteId,
            transferReason,
            status: "TEMPORARY_TRANSFER",
            transferredAt: new Date(),
            temporaryUntil: new Date(Date.now() + (duration * 24 * 60 * 60 * 1000)), // duration in days
            originalAssignmentId: currentAssignment._id
        });

        await transfer.save();

        // Update original assignment
        currentAssignment.status = "TEMPORARILY_TRANSFERRED";
        currentAssignment.transferredAt = new Date();
        await currentAssignment.save();

        // Update new vehicle
        await Vehicle.findByIdAndUpdate(newVehicleId, {
            $inc: { allocatedSeats: 1, $dec: { availableSeats: 1 } }
        });

        // Update old vehicle
        await Vehicle.findByIdAndUpdate(currentAssignment.vehicleId, {
            $dec: { allocatedSeats: 1, $inc: { availableSeats: 1 } }
        });

        // Notify employee of transfer
        await notifyEmployeeTransfer(currentAssignment, transfer);

        res.status(201).json({
            success: true,
            message: "Temporary transfer processed successfully",
            data: {
                transferId: transfer._id,
                employeeId,
                newVehicleId,
                newRouteId,
                duration,
                temporaryUntil: transfer.temporaryUntil
            }
        });

    } catch (error) {
        console.error("Error handling temporary transfer:", error);
        res.status(500).json({
            success: false,
            message: "Error processing temporary transfer",
            error: error.message
        });
    }
};

// Get daily operations dashboard
export const getOperationsDashboard = async (req, res) => {
    try {
        const b2bPartnerId = req.userId;
        const { date } = req.query;

        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

        // Get all active contracts
        const activeContracts = await Contract.find({
            b2bPartnerId,
            status: "ACTIVE"
        });

        // Get vehicle assignments for today
        const todayAssignments = await VehicleAssignment.find({
            b2bPartnerId,
            assignedAt: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        })
        .populate('vehicleId', 'vehicleNumber capacity type')
        .populate('driverId', 'fullName contactNumber')
        .populate('contractId', 'contractNumber')
        .populate('employeeId', 'fullName email')
        .sort({ assignedAt: 1 });

        // Get vehicles and their status
        const vehicles = await Vehicle.find({
            b2bPartnerId
        });

        const vehicleStatus = vehicles.map(vehicle => {
            const assignments = todayAssignments.filter(a => a.vehicleId.toString() === vehicle._id.toString());
            return {
                vehicleId: vehicle._id,
                vehicleNumber: vehicle.vehicleNumber,
                type: vehicle.type,
                capacity: vehicle.capacity,
                allocatedSeats: assignments.length,
                availableSeats: vehicle.capacity - assignments.length,
                utilizationRate: ((assignments.length / vehicle.capacity) * 100).toFixed(2),
                drivers: assignments.map(a => a.driverId),
                assignments: assignments.map(a => ({
                    assignmentId: a._id,
                    contractNumber: a.contractId?.contractNumber,
                    driverName: a.driverId?.fullName,
                    driverContact: a.driverId?.contactNumber,
                    employeeName: a.employeeId?.fullName,
                    employeeEmail: a.employeeId?.email,
                    seatNumber: a.seatNumber,
                    routeId: a.routeId,
                    schedule: a.schedule,
                    status: a.status
                }))
            };
        });

        // Calculate statistics
        const totalVehicles = vehicles.length;
        const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacity, 0);
        const totalAllocated = todayAssignments.length;
        const totalAvailable = totalCapacity - totalAllocated;
        const overallUtilization = totalCapacity > 0 ? ((totalAllocated / totalCapacity) * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                date: targetDate,
                activeContracts: activeContracts.length,
                vehicleStatus,
                summary: {
                    totalVehicles,
                    totalCapacity,
                    totalAllocated,
                    totalAvailable,
                    overallUtilization: parseFloat(overallUtilization)
                }
            }
        });

    } catch (error) {
        console.error("Error getting operations dashboard:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving operations dashboard",
            error: error.message
        });
    }
};

// Generate client reports
export const generateClientReports = async (req, res) => {
    try {
        const { contractId, reportType, startDate, endDate } = req.body;
        const b2bPartnerId = req.userId;

        // Verify contract
        const contract = await Contract.findOne({
            _id: contractId,
            b2bPartnerId
        });

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: "Contract not found"
            });
        }

        let reportData;

        switch (reportType) {
            case "attendance":
                reportData = await generateAttendanceReport(contractId, startDate, endDate);
                break;
            case "route_efficiency":
                reportData = await generateRouteEfficiencyReport(contractId, startDate, endDate);
                break;
            case "vehicle_utilization":
                reportData = await generateVehicleUtilizationReport(contractId, startDate, endDate);
                break;
            case "employee_feedback":
                reportData = await generateEmployeeFeedbackReport(contractId, startDate, endDate);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid report type"
                });
        }

        res.status(200).json({
            success: true,
            message: "Report generated successfully",
            data: {
                reportType,
                contractId,
                generatedAt: new Date(),
                reportData
            }
        });

    } catch (error) {
        console.error("Error generating client report:", error);
        res.status(500).json({
            success: false,
            message: "Error generating report",
            error: error.message
        });
    }
};

// Helper functions
const generateSeatConfiguration = (capacity) => {
    const configuration = [];
    const rows = Math.ceil(capacity / 4); // 4 seats per row
    
    for (let row = 0; row < rows; row++) {
        const rowSeats = [];
        for (let seat = 0; seat < 4; seat++) {
            const seatNumber = (row * 4) + seat + 1;
            if (seatNumber <= capacity) {
                rowSeats.push({
                    seatNumber,
                    row: row + 1,
                    position: seat + 1,
                    isAvailable: true,
                    type: "regular"
                });
            }
        }
        configuration.push({
            row: row + 1,
            seats: rowSeats
        });
    }
    
    return configuration;
};

const notifyClientOperationsStart = async (contract) => {
    try {
        const client = await User.findById(contract.clientId);
        if (client) {
            await sendEmail({
                to: client.email,
                subject: "Transport Services Started",
                template: "operationsStarted",
                data: {
                    clientName: client.fullName,
                    companyName: client.companyName,
                    contractNumber: contract.contractNumber,
                    startDate: contract.startDate
                }
            });
        }
    } catch (error) {
        console.error("Error notifying client of operations start:", error);
    }
};

const notifyEmployeeTransfer = async (assignment, transfer) => {
    try {
        const employee = await User.findById(assignment.employeeId);
        if (employee) {
            await sendEmail({
                to: employee.email,
                subject: "Temporary Transfer Notification",
                template: "employeeTransfer",
                data: {
                    employeeName: employee.fullName,
                    transferReason: transfer.transferReason,
                    duration: transfer.temporaryUntil,
                    newVehicleInfo: transfer.newVehicleId
                }
            });
        }
    } catch (error) {
        console.error("Error notifying employee of transfer:", error);
    }
};

const generateAttendanceReport = async (contractId, startDate, endDate) => {
    // This would integrate with actual attendance tracking
    return {
        totalDays: 30,
        presentDays: 28,
        absentDays: 2,
        attendanceRate: 93.33,
        details: []
    };
};

const generateRouteEfficiencyReport = async (contractId, startDate, endDate) => {
    // This would integrate with actual route tracking
    return {
        totalRoutes: 5,
        onTimeRoutes: 4,
        averageDelay: 3.5,
        efficiencyScore: 85.5,
        details: []
    };
};

const generateVehicleUtilizationReport = async (contractId, startDate, endDate) => {
    // This would integrate with actual vehicle tracking
    return {
        totalVehicles: 10,
        activeVehicles: 8,
        averageUtilization: 75.5,
        fuelEfficiency: 8.2,
        details: []
    };
};

const generateEmployeeFeedbackReport = async (contractId, startDate, endDate) => {
    // This would integrate with actual feedback system
    return {
        totalEmployees: 50,
        responsesReceived: 45,
        averageRating: 4.2,
        commonIssues: ["Punctuality", "Vehicle Cleanliness"],
        details: []
    };
};
