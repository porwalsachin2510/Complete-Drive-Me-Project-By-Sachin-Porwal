import CorporateEmployee from "../models/CorporateEmployee.js";
import User from "../models/User.js";
import Contract from "../models/Contract.js";
import Route from "../models/Route.js";
import { sendEmail } from "../Services/emailService.js";
import csv from "csv-parser";
import fs from "fs";

// Bulk upload employees
export const bulkUploadEmployees = async (req, res) => {
    try {
        const { employees } = req.body;
        const managerId = req.userId;
        const companyId = req.user.companyId;

        if (!employees || !Array.isArray(employees)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee data format"
            });
        }

        const results = {
            success: [],
            errors: [],
            duplicates: []
        };

        for (const employeeData of employees) {
            try {
                // Check if employee already exists
                const existingEmployee = await CorporateEmployee.findOne({
                    $or: [
                        { email: employeeData.email },
                        { employeeId: employeeData.employeeId },
                        { contactNumber: employeeData.contactNumber }
                    ]
                });

                if (existingEmployee) {
                    results.duplicates.push({
                        employee: employeeData,
                        reason: "Employee already exists",
                        existingId: existingEmployee._id
                    });
                    continue;
                }

                // Create user account for employee
                const user = new User({
                    fullName: employeeData.fullName,
                    email: employeeData.email,
                    password: employeeData.password || "tempPassword123", // Default password
                    role: "CORPORATE_EMPLOYEE",
                    companyId: companyId,
                    isActive: true
                });

                await user.save();

                // Create corporate employee record
                const corporateEmployee = new CorporateEmployee({
                    userId: user._id,
                    companyId: companyId,
                    managerId: managerId,
                    employeeId: employeeData.employeeId,
                    fullName: employeeData.fullName,
                    email: employeeData.email,
                    contactNumber: employeeData.contactNumber,
                    department: employeeData.department,
                    designation: employeeData.designation,
                    workShift: employeeData.workShift,
                    pickupLocation: employeeData.pickupLocation,
                    dropoffLocation: employeeData.dropoffLocation,
                    routeId: employeeData.routeId,
                    seatNumber: employeeData.seatNumber,
                    isActive: true,
                    isVerified: false
                });

                await corporateEmployee.save();

                // Send invitation email
                await sendEmployeeInvitation(user, employeeData);

                results.success.push({
                    employeeId: employeeData.employeeId,
                    fullName: employeeData.fullName,
                    email: employeeData.email,
                    userId: user._id,
                    corporateEmployeeId: corporateEmployee._id
                });

            } catch (error) {
                results.errors.push({
                    employee: employeeData,
                    error: error.message
                });
            }
        }

        res.status(201).json({
            success: true,
            message: "Employee bulk upload completed",
            data: {
                results,
                summary: {
                    total: employees.length,
                    successful: results.success.length,
                    errors: results.errors.length,
                    duplicates: results.duplicates.length
                }
            }
        });

    } catch (error) {
        console.error("Error in bulk employee upload:", error);
        res.status(500).json({
            success: false,
            message: "Error uploading employees",
            error: error.message
        });
    }
};

// Upload employees from CSV file
export const uploadEmployeesFromCSV = async (req, res) => {
    try {
        const managerId = req.userId;
        const companyId = req.user.companyId;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No CSV file uploaded"
            });
        }

        const employees = [];
        const parser = csv();
        
        parser.on('data', (data) => {
            employees.push({
                employeeId: data['Employee ID'] || data['employeeId'],
                fullName: data['Full Name'] || data['fullName'],
                email: data['Email'] || data['email'],
                contactNumber: data['Contact Number'] || data['contactNumber'],
                department: data['Department'] || data['department'],
                designation: data['Designation'] || data['designation'],
                workShift: data['Work Shift'] || data['workShift'],
                pickupLocation: data['Pickup Location'] || data['pickupLocation'],
                dropoffLocation: data['Dropoff Location'] || data['dropoffLocation'],
                routeId: data['Route ID'] || data['routeId'],
                seatNumber: data['Seat Number'] || data['seatNumber']
            });
        });

        parser.on('end', async () => {
            try {
                const results = await processEmployeeUpload(employees, managerId, companyId);
                res.status(201).json({
                    success: true,
                    message: "CSV upload completed",
                    data: results
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Error processing CSV",
                    error: error.message
                });
            }
        });

        parser.write(req.file.buffer);
        parser.end();

    } catch (error) {
        console.error("Error uploading CSV:", error);
        res.status(500).json({
            success: false,
            message: "Error uploading CSV file",
            error: error.message
        });
    }
};

// Get employees with pagination and filters
export const getEmployees = async (req, res) => {
    try {
        const managerId = req.userId;
        const companyId = req.user.companyId;
        const { 
            page = 1, 
            limit = 20, 
            department, 
            designation, 
            workShift, 
            isActive,
            search 
        } = req.query;

        const query = { companyId, managerId };
        
        if (department) query.department = department;
        if (designation) query.designation = designation;
        if (workShift) query.workShift = workShift;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } },
                { contactNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const employees = await CorporateEmployee.find(query)
            .populate('userId', 'email isActive')
            .populate('routeId', 'routeName fromLocation toLocation')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await CorporateEmployee.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                employees,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalEmployees: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error("Error getting employees:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving employees",
            error: error.message
        });
    }
};

// Update employee
export const updateEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const managerId = req.userId;
        const updates = req.body;

        const employee = await CorporateEmployee.findOne({
            _id: employeeId,
            managerId
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        // Update employee
        Object.assign(employee, updates);
        await employee.save();

        // Update user account if needed
        if (updates.fullName || updates.email) {
            await User.findByIdAndUpdate(employee.userId, {
                ...(updates.fullName && { fullName: updates.fullName }),
                ...(updates.email && { email: updates.email })
            });
        }

        res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: {
                employeeId: employee._id,
                updates
            }
        });

    } catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).json({
            success: false,
            message: "Error updating employee",
            error: error.message
        });
    }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const managerId = req.userId;

        const employee = await CorporateEmployee.findOne({
            _id: employeeId,
            managerId
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        // Deactivate employee instead of deleting
        employee.isActive = false;
        employee.deactivatedAt = new Date();
        await employee.save();

        // Deactivate user account
        await User.findByIdAndUpdate(employee.userId, { isActive: false });

        res.status(200).json({
            success: true,
            message: "Employee deactivated successfully"
        });

    } catch (error) {
        console.error("Error deactivating employee:", error);
        res.status(500).json({
            success: false,
            message: "Error deactivating employee",
            error: error.message
        });
    }
};

// Get employee attendance report
export const getEmployeeAttendance = async (req, res) => {
    try {
        const managerId = req.userId;
        const companyId = req.user.companyId;
        const { 
            startDate, 
            endDate, 
            employeeId, 
            department,
            page = 1,
            limit = 50 
        } = req.query;

        const query = { companyId, managerId };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (employeeId) query.employeeId = employeeId;
        if (department) query.department = department;

        // This would integrate with a travel history or attendance tracking system
        const attendance = await getAttendanceData(query, page, limit);

        res.status(200).json({
            success: true,
            data: {
                attendance,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(attendance.total / limit),
                    totalRecords: attendance.total,
                    hasNext: page * limit < attendance.total,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error("Error getting attendance:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving attendance",
            error: error.message
        });
    }
};

// Get route utilization report
export const getRouteUtilization = async (req, res) => {
    try {
        const managerId = req.userId;
        const companyId = req.user.companyId;
        const { 
            startDate, 
            endDate, 
            routeId,
            page = 1,
            limit = 20 
        } = req.query;

        const query = { companyId, managerId };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (routeId) query.routeId = routeId;

        const utilization = await getRouteUtilizationData(query, page, limit);

        res.status(200).json({
            success: true,
            data: {
                utilization,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(utilization.total / limit),
                    totalRecords: utilization.total,
                    hasNext: page * limit < utilization.total,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error("Error getting route utilization:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving route utilization",
            error: error.message
        });
    }
};

// Approve employee registration
export const approveEmployeeRegistration = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const managerId = req.userId;

        const employee = await CorporateEmployee.findOne({
            _id: employeeId,
            managerId
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        employee.isVerified = true;
        employee.approvedAt = new Date();
        await employee.save();

        // Activate user account
        await User.findByIdAndUpdate(employee.userId, { isActive: true });

        // Send approval notification
        await sendEmployeeApproval(employee);

        res.status(200).json({
            success: true,
            message: "Employee registration approved successfully"
        });

    } catch (error) {
        console.error("Error approving employee:", error);
        res.status(500).json({
            success: false,
            message: "Error approving employee",
            error: error.message
        });
    }
};

// Assign pickup and dropoff stops to employee
export const assignStopsToEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { pickupStop, dropoffStop, routeId } = req.body;
        const managerId = req.userId;

        // Validate required fields
        if (!pickupStop || !dropoffStop || !routeId) {
            return res.status(400).json({
                success: false,
                message: "pickupStop, dropoffStop, and routeId are required"
            });
        }

        // Get employee
        const employee = await CorporateEmployee.findOne({
            _id: employeeId,
            managerId
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        // Validate route exists
        const route = await Route.findById(routeId);
        if (!route) {
            return res.status(404).json({
                success: false,
                message: "Route not found"
            });
        }

        // Validate stops exist in route
        const pickupStopObj = route.stopPoints.find(s => s._id.toString() === pickupStop);
        const dropoffStopObj = route.stopPoints.find(s => s._id.toString() === dropoffStop);

        if (!pickupStopObj || !dropoffStopObj) {
            return res.status(400).json({
                success: false,
                message: "Invalid pickup or dropoff stop. Stop not found in route."
            });
        }

        // Update employee stops
        employee.transportDetails.assignedRoute = routeId;
        employee.transportDetails.pickupPoint = pickupStopObj.location;
        employee.transportDetails.dropOffPoint = dropoffStopObj.location;
        
        await employee.save();

        // Send notification email
        const user = await User.findById(employee.userId);
        if (user && user.email) {
            await sendEmail({
                to: user.email,
                subject: "Your Transport Stops Have Been Updated",
                html: `
                    <h2>Hello ${user.fullName},</h2>
                    <p>Your transport stops have been updated in the Drive-Me system.</p>
                    <p><strong>Pickup Stop:</strong> ${pickupStopObj.location} at ${pickupStopObj.time}</p>
                    <p><strong>Dropoff Stop:</strong> ${dropoffStopObj.location}</p>
                    <p>Please confirm these stops in your employee dashboard.</p>
                    <p>Best regards,<br/>Drive-Me Transport System</p>
                `
            });
        }

        res.status(200).json({
            success: true,
            message: "Stops assigned successfully",
            data: {
                employeeId: employee._id,
                pickupPoint: pickupStopObj.location,
                dropoffPoint: dropoffStopObj.location,
                route: {
                    id: route._id,
                    name: route.fromLocation + " → " + route.toLocation
                }
            }
        });

    } catch (error) {
        console.error("Error assigning stops:", error);
        res.status(500).json({
            success: false,
            message: "Error assigning stops to employee",
            error: error.message
        });
    }
};

// Helper functions
const processEmployeeUpload = async (employees, managerId, companyId) => {
    const results = {
        success: [],
        errors: [],
        duplicates: []
    };

    for (const employeeData of employees) {
        try {
            // Check if employee already exists
            const existingEmployee = await CorporateEmployee.findOne({
                $or: [
                    { email: employeeData.email },
                    { employeeId: employeeData.employeeId }
                ]
            });

            if (existingEmployee) {
                results.duplicates.push({
                    employee: employeeData,
                    reason: "Employee already exists"
                });
                continue;
            }

            // Create user account
            const user = new User({
                fullName: employeeData.fullName,
                email: employeeData.email,
                password: "tempPassword123",
                role: "CORPORATE_EMPLOYEE",
                companyId: companyId,
                isActive: false // Inactive until approved
            });

            await user.save();

            // Create corporate employee record
            const corporateEmployee = new CorporateEmployee({
                userId: user._id,
                companyId: companyId,
                managerId: managerId,
                ...employeeData,
                isActive: true,
                isVerified: false
            });

            await corporateEmployee.save();

            results.success.push({
                employeeId: employeeData.employeeId,
                userId: user._id,
                corporateEmployeeId: corporateEmployee._id
            });

        } catch (error) {
            results.errors.push({
                employee: employeeData,
                error: error.message
            });
        }
    }

    return results;
};

const sendEmployeeInvitation = async (user, employeeData) => {
    try {
        await sendEmail({
            to: user.email,
            subject: "Welcome to Corporate Transport System",
            template: "employeeInvitation",
            data: {
                employeeName: employeeData.fullName,
                companyName: employeeData.companyName,
                loginUrl: `${process.env.FRONTEND_URL}/login`,
                tempPassword: "tempPassword123"
            }
        });
    } catch (error) {
        console.error("Error sending employee invitation:", error);
    }
};

const sendEmployeeApproval = async (employee) => {
    try {
        const user = await User.findById(employee.userId);
        if (user) {
            await sendEmail({
                to: user.email,
                subject: "Your Registration Has Been Approved",
                template: "employeeApproval",
                data: {
                    employeeName: employee.fullName,
                    companyName: employee.companyName,
                    loginUrl: `${process.env.FRONTEND_URL}/login`
                }
            });
        }
    } catch (error) {
        console.error("Error sending employee approval:", error);
    }
};

const getAttendanceData = async (query, page, limit) => {
    // This would integrate with actual attendance tracking system
    // For now, return mock data structure
    return {
        attendance: [],
        total: 0
    };
};

const getRouteUtilizationData = async (query, page, limit) => {
    // This would integrate with actual trip/booking data
    // For now, return mock data structure
    return {
        utilization: [],
        total: 0
    };
};
