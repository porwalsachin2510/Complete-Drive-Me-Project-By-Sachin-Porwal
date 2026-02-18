import mongoose from "mongoose";
import Requirement from "../models/Requirement.js";
import Quotation from "../models/Quotation.js";
import User from "../models/User.js";
import { sendQuotationNotification } from "../Services/notificationService.js";

// @desc    Create new requirement
// @route   POST /api/requirements
// @access  Private (CORPORATE only)
export const createRequirement = async (req, res) => {
    try {
        const corporateId = req.userId;
        const requirementData = {
            ...req.body,
            corporateId,
            createdBy: corporateId,
        };

        const requirement = new Requirement(requirementData);
        await requirement.save();

        // If visibility is INVITE_ONLY, send notifications to invited partners
        if (requirement.visibility === "INVITE_ONLY" && requirement.invitedPartners.length > 0) {
            // TODO: Send notifications to invited partners
            console.log(`Sending notifications to ${requirement.invitedPartners.length} invited partners`);
        }

        res.status(201).json({
            success: true,
            message: "Requirement created successfully",
            data: requirement
        });
    } catch (error) {
        console.error("Error creating requirement:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create requirement"
        });
    }
};

// @desc    Get all requirements for a corporate
// @route   GET /api/requirements/corporate
// @access  Private (CORPORATE only)
export const getCorporateRequirements = async (req, res) => {
    try {
        const corporateId = req.userId;
        const { page = 1, limit = 10, status, search } = req.query;

        // Build query
        const query = { corporateId, isDeleted: false };
        
        if (status && status !== "all") {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { "routeInfo.fromLocation": { $regex: search, $options: "i" } },
                { "routeInfo.toLocation": { $regex: search, $options: "i" } }
            ];
        }

        const requirements = await Requirement.find(query)
            .populate('quotations', 'totalAmount status createdAt')
            .populate('selectedQuotation', 'totalAmount status createdAt')
            .populate('corporateId', 'companyName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Requirement.countDocuments(query);

        res.json({
            success: true,
            data: {
                requirements,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Error fetching corporate requirements:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch requirements"
        });
    }
};

// @desc    Get all open requirements for B2B partners
// @route   GET /api/requirements/open
// @access  Private (B2B_PARTNER only)
export const getOpenRequirements = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, vehicleType, location } = req.query;

        // Build query for open requirements
        let query = {
            status: "PUBLISHED",
            visibility: "PUBLIC",
            quotationDeadline: { $gt: new Date() },
            isDeleted: false
        };

        // Add search filters
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { "routeInfo.fromLocation": { $regex: search, $options: "i" } },
                { "routeInfo.toLocation": { $regex: search, $options: "i" } }
            ];
        }

        if (vehicleType) {
            query["vehicleRequirements.vehicleType"] = vehicleType;
        }

        if (location) {
            query.$or = [
                { "routeInfo.fromLocation": { $regex: location, $options: "i" } },
                { "routeInfo.toLocation": { $regex: location, $options: "i" } }
            ];
        }

        const requirements = await Requirement.find(query)
            .populate('corporateId', 'companyName companyLogo')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Requirement.countDocuments(query);

        res.json({
            success: true,
            data: {
                requirements,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Error fetching open requirements:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch open requirements"
        });
    }
};

// @desc    Get requirement by ID
// @route   GET /api/requirements/:id
// @access  Private (CORPORATE or B2B_PARTNER)
export const getRequirementById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const userRole = req.userRole;

        const requirement = await Requirement.findById(id)
            .populate('corporateId', 'companyName companyLogo website')
            .populate('quotations')
            .populate('selectedQuotation')
            .populate('createdBy', 'fullName email');

        if (!requirement || requirement.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Requirement not found"
            });
        }

        // Check access permissions
        if (userRole === "CORPORATE" && requirement.corporateId._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        if (userRole === "B2B_PARTNER" && requirement.visibility !== "PUBLIC") {
            return res.status(403).json({
                success: false,
                message: "This requirement is not publicly visible"
            });
        }

        res.json({
            success: true,
            data: requirement
        });
    } catch (error) {
        console.error("Error fetching requirement:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch requirement"
        });
    }
};

// @desc    Update requirement
// @route   PUT /api/requirements/:id
// @access  Private (CORPORATE only)
export const updateRequirement = async (req, res) => {
    try {
        const { id } = req.params;
        const corporateId = req.userId;
        const updateData = {
            ...req.body,
            lastModifiedBy: corporateId,
        };

        const requirement = await Requirement.findOne({
            _id: id,
            corporateId,
            isDeleted: false
        });

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: "Requirement not found"
            });
        }

        // Don't allow updates if requirement is already published and has quotations
        if (requirement.status === "PUBLISHED" && requirement.quotations.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot update requirement that has received quotations"
            });
        }

        Object.assign(requirement, updateData);
        await requirement.save();

        res.json({
            success: true,
            message: "Requirement updated successfully",
            data: requirement
        });
    } catch (error) {
        console.error("Error updating requirement:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update requirement"
        });
    }
};

// @desc    Publish requirement
// @route   POST /api/requirements/:id/publish
// @access  Private (CORPORATE only)
export const publishRequirement = async (req, res) => {
    try {
        const { id } = req.params;
        const corporateId = req.userId;

        const requirement = await Requirement.findOne({
            _id: id,
            corporateId,
            isDeleted: false
        });

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: "Requirement not found"
            });
        }

        if (requirement.status !== "DRAFT") {
            return res.status(400).json({
                success: false,
                message: "Only draft requirements can be published"
            });
        }

        await requirement.publish();

        // Notify B2B partners about new requirement
        // TODO: Implement notification system

        res.json({
            success: true,
            message: "Requirement published successfully",
            data: requirement
        });
    } catch (error) {
        console.error("Error publishing requirement:", error);
        res.status(500).json({
            success: false,
            message: "Failed to publish requirement"
        });
    }
};

// @desc    Close requirement
// @route   POST /api/requirements/:id/close
// @access  Private (CORPORATE only)
export const closeRequirement = async (req, res) => {
    try {
        const { id } = req.params;
        const corporateId = req.userId;

        const requirement = await Requirement.findOne({
            _id: id,
            corporateId,
            isDeleted: false
        });

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: "Requirement not found"
            });
        }

        await requirement.close();

        res.json({
            success: true,
            message: "Requirement closed successfully",
            data: requirement
        });
    } catch (error) {
        console.error("Error closing requirement:", error);
        res.status(500).json({
            success: false,
            message: "Failed to close requirement"
        });
    }
};

// @desc    Delete requirement (soft delete)
// @route   DELETE /api/requirements/:id
// @access  Private (CORPORATE only)
export const deleteRequirement = async (req, res) => {
    try {
        const { id } = req.params;
        const corporateId = req.userId;

        const requirement = await Requirement.findOne({
            _id: id,
            corporateId,
            isDeleted: false
        });

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: "Requirement not found"
            });
        }

        // Don't allow deletion if requirement has quotations
        if (requirement.quotations.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete requirement that has received quotations"
            });
        }

        requirement.isDeleted = true;
        await requirement.save();

        res.json({
            success: true,
            message: "Requirement deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting requirement:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete requirement"
        });
    }
};

// @desc    Get requirement statistics
// @route   GET /api/requirements/statistics
// @access  Private (CORPORATE only)
export const getRequirementStatistics = async (req, res) => {
    try {
        const corporateId = req.userId;

        const stats = await Requirement.aggregate([
            { $match: { corporateId: new mongoose.Types.ObjectId(corporateId), isDeleted: false } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalBudget: { $sum: "$contractDetails.budgetRange.max" }
                }
            }
        ]);

        const totalRequirements = await Requirement.countDocuments({
            corporateId,
            isDeleted: false
        });

        const openQuotations = await Requirement.countDocuments({
            corporateId,
            status: "PUBLISHED",
            isDeleted: false
        });

        res.json({
            success: true,
            data: {
                totalRequirements,
                openQuotations,
                statusBreakdown: stats,
            }
        });
    } catch (error) {
        console.error("Error fetching requirement statistics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch statistics"
        });
    }
};
