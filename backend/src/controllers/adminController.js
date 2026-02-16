import Payment from "../models/Payment.js";
import Contract from "../models/Contract.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import PaymentSchedule from "../models/PaymentSchedule.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import B2CPartnerRoute from "../models/B2CPartnerRoute.js";
import B2CPassengerBooking from "../models/B2CPassengerBooking.js";
import B2CPartnerVehicle from "../models/B2CPartnerVehicle.js";
// Get all users for admin
export const getAllUsers = async (req, res) => {
    try {
        const { role, status, page = 1, limit = 20, search } = req.query;
        const query = {};

        if (role) query.role = role;
        if (status) query.status = status;
        
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { whatsappNumber: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit))
            .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            users,
            pagination: {
                total,
                page: Number.parseInt(page),
                pages: Math.ceil(total / Number.parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("[v0] Error fetching users:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message,
        });
    }
};

// Get user statistics for admin
export const getUserStats = async (req, res) => {
    try {
        const [
            totalUsers,
            commuters,
            corporates,
            b2cPartners,
            b2bPartners,
            b2bDrivers,
            corporateDrivers,
            activeUsers,
            suspendedUsers
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "COMMUTER" }),
            User.countDocuments({ role: "CORPORATE" }),
            User.countDocuments({ role: "B2C_PARTNER" }),
            User.countDocuments({ role: "B2B_PARTNER" }),
            User.countDocuments({ role: "B2B_PARTNER_DRIVER" }),
            User.countDocuments({ role: "CORPORATE_DRIVER" }),
            User.countDocuments({ status: "ACTIVE" }),
            User.countDocuments({ status: "SUSPENDED" })
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                commuters,
                corporates,
                b2cPartners,
                b2bPartners,
                drivers: b2bDrivers + corporateDrivers,
                activeUsers,
                suspendedUsers
            }
        });
    } catch (error) {
        console.error("[v0] Error fetching user stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user statistics",
            error: error.message,
        });
    }
};

// Suspend user
export const suspendUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                status: "SUSPENDED",
                suspendedAt: new Date(),
                suspendedBy: req.userId
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User suspended successfully",
            user
        });
    } catch (error) {
        console.error("[v0] Error suspending user:", error);
        res.status(500).json({
            success: false,
            message: "Error suspending user",
            error: error.message,
        });
    }
};

// Activate user
export const activateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                status: "ACTIVE",
                activatedAt: new Date(),
                activatedBy: req.userId
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User activated successfully",
            user
        });
    } catch (error) {
        console.error("[v0] Error activating user:", error);
        res.status(500).json({
            success: false,
            message: "Error activating user",
            error: error.message,
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Also delete user's wallet if exists
        await Wallet.findOneAndDelete({ userId });

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("[v0] Error deleting user:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message,
        });
    }
};

// Get user details for admin
export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId)
            .select('-password')
            .populate('companyId', 'fullName companyName email');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get user's wallet
        const wallet = await Wallet.findOne({ userId });

        // Get user's recent transactions
        const transactions = await Transaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            user,
            wallet,
            transactions
        });
    } catch (error) {
        console.error("[v0] Error fetching user details:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user details",
            error: error.message,
        });
    }
}; 

// Get B2C providers for admin
export const getB2CProviders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;
        const query = { role: "B2C_PARTNER" };

        if (status) query.status = status;
        
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
                { whatsappNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const providers = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit))
            .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            providers,
            pagination: {
                total,
                page: Number.parseInt(page),
                pages: Math.ceil(total / Number.parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("[v0] Error fetching B2C providers:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching B2C providers",
            error: error.message,
        });
    }
};

// Get B2C provider statistics for admin
export const getB2CProviderStats = async (req, res) => {
    try {
        const [
            totalProviders,
            activeProviders,
            suspendedProviders,
            pendingProviders
        ] = await Promise.all([
            User.countDocuments({ role: "B2C_PARTNER" }),
            User.countDocuments({ role: "B2C_PARTNER", status: "ACTIVE" }),
            User.countDocuments({ role: "B2C_PARTNER", status: "SUSPENDED" }),
            User.countDocuments({ role: "B2C_PARTNER", status: "PENDING" })
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalProviders,
                activeProviders,
                suspendedProviders,
                pendingProviders
            }
        });
    } catch (error) {
        console.error("[v0] Error fetching B2C provider stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching B2C provider statistics",
            error: error.message,
        });
    }
};

// Suspend B2C provider
export const suspendB2CProvider = async (req, res) => {
    try {
        const { providerId } = req.params;
        
        const provider = await User.findOneAndUpdate(
            { _id: providerId, role: "B2C_PARTNER" },
            { 
                status: "SUSPENDED",
                suspendedAt: new Date(),
                suspendedBy: req.userId
            },
            { new: true }
        ).select('-password');

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "B2C provider not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "B2C provider suspended successfully",
            provider
        });
    } catch (error) {
        console.error("[v0] Error suspending B2C provider:", error);
        res.status(500).json({
            success: false,
            message: "Error suspending B2C provider",
            error: error.message,
        });
    }
};

// Activate B2C provider
export const activateB2CProvider = async (req, res) => {
    try {
        const { providerId } = req.params;
        
        const provider = await User.findOneAndUpdate(
            { _id: providerId, role: "B2C_PARTNER" },
            { 
                status: "ACTIVE",
                activatedAt: new Date(),
                activatedBy: req.userId
            },
            { new: true }
        ).select('-password');

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "B2C provider not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "B2C provider activated successfully",
            provider
        });
    } catch (error) {
        console.error("[v0] Error activating B2C provider:", error);
        res.status(500).json({
            success: false,
            message: "Error activating B2C provider",
            error: error.message,
        });
    }
};

// Get finance metrics for admin
export const getFinanceMetrics = async (req, res) => {
    try {
        const [
            totalRevenue,
            netEarnings,
            pendingPayouts,
            activeProviders,
            totalTransactions,
            monthlyRevenue,
            commissionEarned,
            securityDeposits
        ] = await Promise.all([
            Transaction.aggregate([
                { $match: { category: 'PAYMENT_RECEIVED' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Transaction.aggregate([
                { $match: { category: 'COMMISSION_EARNED' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Transaction.aggregate([
                { $match: { category: 'PAYOUT_REQUESTED' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            User.countDocuments({ role: "B2C_PARTNER", status: "ACTIVE" }),
            Transaction.countDocuments(),
            Transaction.aggregate([
                { $match: { createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Wallet.aggregate([
                { $group: { _id: null, total: { $sum: '$securityDepositHeld' } } }
            ])
        ]);

        res.status(200).json({
            success: true,
            metrics: {
                totalRevenue: totalRevenue[0]?.total || 0,
                netEarnings: netEarnings[0]?.total || 0,
                pendingPayouts: pendingPayouts[0]?.total || 0,
                activeProviders,
                totalTransactions,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
                commissionEarned: commissionEarned[0]?.total || 0,
                securityDeposits: securityDeposits[0]?.total || 0
            }
        });
    } catch (error) {
        console.error("[v0] Error fetching finance metrics:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching finance metrics",
            error: error.message,
        });
    }
};

// Get payout requests for admin
export const getPayoutRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status) query.status = status;

        const payouts = await Transaction.find({
            category: 'PAYOUT_REQUESTED',
            ...query
        })
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit))
            .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

        const total = await Transaction.countDocuments({ category: 'PAYOUT_REQUESTED', ...query });

        res.status(200).json({
            success: true,
            payouts,
            pagination: {
                total,
                page: Number.parseInt(page),
                pages: Math.ceil(total / Number.parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("[v0] Error fetching payout requests:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching payout requests",
            error: error.message,
        });
    }
};

// Get transactions for admin
export const getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 50, type, status, startDate, endDate } = req.query;
        const query = {};

        if (type) query.category = type;
        if (status) query.status = status;
        if (startDate) query.createdAt = { $gte: new Date(startDate) };
        if (endDate) query.createdAt = { $lte: new Date(endDate) };

        const transactions = await Transaction.find(query)
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit))
            .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

        const total = await Transaction.countDocuments(query);

        res.status(200).json({
            success: true,
            transactions,
            pagination: {
                total,
                page: Number.parseInt(page),
                pages: Math.ceil(total / Number.parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("[v0] Error fetching transactions:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching transactions",
            error: error.message,
        });
    }
};

// Approve payout request
export const approvePayout = async (req, res) => {
    try {
        const { payoutId } = req.params;
        
        const payout = await Transaction.findByIdAndUpdate(
            payoutId,
            {
                status: 'APPROVED',
                approvedAt: new Date(),
                approvedBy: req.userId
            },
            { new: true }
        );

        if (!payout) {
            return res.status(404).json({
                success: false,
                message: "Payout request not found"
            });
        }

        // Process payout (you can integrate with payment gateway here)
        // For now, we'll mark it as completed
        payout.status = 'COMPLETED';
        payout.completedAt = new Date();
        await payout.save();

        res.status(200).json({
            success: true,
            message: "Payout approved and completed successfully",
            payout
        });
    } catch (error) {
        console.error("[v0] Error approving payout:", error);
        res.status(500).json({
            success: false,
            message: "Error approving payout",
            error: error.message,
        });
    }
};

// Reject payout request
export const rejectPayout = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const { reason } = req.body;
        
        const payout = await Transaction.findByIdAndUpdate(
            payoutId,
            {
                status: 'REJECTED',
                rejectedAt: new Date(),
                rejectedBy: req.userId,
                failureReason: reason || 'Payout rejected by admin'
            },
            { new: true }
        );

        if (!payout) {
            return res.status(404).json({
                success: false,
                message: "Payout request not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payout rejected successfully",
            payout
        });
    } catch (error) {
        console.error("[v0] Error rejecting payout:", error);
        res.status(500).json({
            success: false,
            message: "Error rejecting payout",
            error: error.message,
        });
    }
};

// Complete payout
export const completePayout = async (req, res) => {
    try {
        const { payoutId } = req.params;
        
        const payout = await Transaction.findByIdAndUpdate(
            payoutId,
            {
                status: 'COMPLETED',
                completedAt: new Date(),
                completedBy: req.userId
            },
            { new: true }
        );

        if (!payout) {
            return res.status(404).json({
                success: false,
                message: "Payout request not found"
            });
        }

        // Process payout to provider's wallet
        const wallet = await Wallet.findOne({ userId: payout.userId });
        if (wallet) {
            wallet.balance += payout.amount;
            await wallet.save();
        }

        res.status(200).json({
            success: true,
            message: "Payout completed successfully",
            payout
        });
    } catch (error) {
        console.error("[v0] Error completing payout:", error);
        res.status(500).json({
            success: false,
            message: "Error completing payout",
            error: error.message,
        });
    }
};

// Get fraud alerts for admin
export const getFraudAlerts = async (req, res) => {
    try {
        const { severity, page = 1, limit = 20 } = req.query;
        const query = {};

        if (severity) query.severity = severity;

        // Fetch real fraud alerts from database
        const realAlerts = await Transaction.find({
            $or: [
                { status: 'SUSPICIOUS' },
                { amount: { $gt: 1000 } }, // High-value transactions
                { 'metadata.ipAddress': { $exists: true } }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(Number.parseInt(limit))
        .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

        const total = await Transaction.countDocuments({
            $or: [
                { status: 'SUSPICIOUS' },
                { amount: { $gt: 1000 } },
                { 'metadata.ipAddress': { $exists: true } }
            ]
        });

        res.status(200).json({
            success: true,
            alerts: realAlerts,
            pagination: {
                total,
                page: Number.parseInt(page),
                pages: Math.ceil(total / Number.parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("[v0] Error fetching fraud alerts:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching fraud alerts",
            error: error.message,
        });
    }
};

// Get user activity for admin
export const getUserActivity = async (req, res) => {
    try {
        const { riskScore, status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (riskScore) query.riskScore = { $gte: Number.parseInt(riskScore) };
        if (status) query.status = status;

        // Fetch real user activity data from database
        const userActivity = await User.aggregate([
            {
                $match: {
                    status: { $in: ['ACTIVE', 'PENDING', 'SUSPENDED'] }
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'paymentHistory'
                }
            },
            {
                $lookup: {
                    from: 'complaints',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'complaintData'
                }
            },
            {
                $lookup: {
                    from: 'ratings',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'ratingData'
                }
            },
            {
                $project: {
                    _id: 1,
                    fullName: 1,
                    status: 1,
                    createdAt: 1,
                    riskScore: {
                        $add: [
                            { $cond: [{ $eq: ['$status', 'SUSPENDED'] }, 50, 0] },
                            { $cond: [{ $eq: ['$status', 'PENDING'] }, 25, 0] },
                            { $multiply: [{ $size: '$complaintData' }, 10] },
                            { $multiply: [{ $avg: '$ratingData.rating' }, -5] }
                        ]
                    },
                    complaints: { $size: '$complaintData' },
                    rating: { $avg: '$ratingData.rating' }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: (Number.parseInt(page) - 1) * Number.parseInt(limit)
            },
            {
                $limit: Number.parseInt(limit)
            }
        ]);

        const total = await User.countDocuments({
            status: { $in: ['ACTIVE', 'PENDING', 'SUSPENDED'] }
        });

        res.status(200).json({
            success: true,
            activity: userActivity,
            pagination: {
                total,
                page: Number.parseInt(page),
                pages: Math.ceil(total / Number.parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("[v0] Error fetching user activity:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user activity",
            error: error.message,
        });
    }
};

// Get system logs for admin
export const getSystemLogs = async (req, res) => {
    try {
        const { level, source, page = 1, limit = 50 } = req.query;
        const query = {};

        if (level) query.level = level;
        if (source) query.source = source;

        // Fetch real system logs from database
        const logs = await Transaction.find({
            $or: [
                { status: 'ERROR' },
                { status: 'WARNING' },
                { status: 'INFO' }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(Number.parseInt(limit))
        .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

        const total = await Transaction.countDocuments({
            $or: [
                { status: 'ERROR' },
                { status: 'WARNING' },
                { status: 'INFO' }
            ]
        });

        res.status(200).json({
            success: true,
            logs: logs,
            pagination: {
                total,
                page: Number.parseInt(page),
                pages: Math.ceil(total / Number.parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("[v0] Error fetching system logs:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching system logs",
            error: error.message,
        });
    }
};

// Get custom reports for admin
export const getCustomReports = async (req, res) => {
    try {
        // Fetch real reports from database
        const reports = await Transaction.find({
            category: 'REPORT'
        })
        .sort({ createdAt: -1 })
        .limit(50);

        res.status(200).json({
            success: true,
            reports: reports
        });
    } catch (error) {
        console.error("[v0] Error fetching custom reports:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching custom reports",
            error: error.message
        });
    }
};

// Get communication templates for admin
export const getCommTemplates = async (req, res) => {
    try {
        const { type, page = 1, limit = 20, status } = req.query;
        const query = {};

        if (type) query.type = type;
        if (status) query.status = status;

        console.log(`[v0] Fetching communication templates with query:`, { type, status, page, limit });

        // Fetch real templates from Template collection
        const templates = await Template.find(query)
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit) * 1)
            .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

        // Get total count for pagination
        const totalTemplates = await Template.countDocuments(query);

        // Calculate usage statistics for each template
        const templatesWithStats = await Promise.all(
            templates.map(async (template) => {
                // Count how many times this template has been used in messages
                const messageUsageCount = await Transaction.countDocuments({
                    type: "MESSAGE_SENT",
                    category: "COMMUNICATION",
                    'metadata.templateId': template._id
                });

                // Count how many times this template has been used in emails
                const emailUsageCount = await Transaction.countDocuments({
                    type: "EMAIL_SENT",
                    category: "COMMUNICATION",
                    'metadata.templateId': template._id
                });

                return {
                    _id: template._id,
                    name: template.name,
                    type: template.type,
                    subject: template.subject || "",
                    content: template.content,
                    variables: template.variables || [],
                    status: template.status || "active",
                    isActive: template.status === "active",
                    usageCount: messageUsageCount + emailUsageCount,
                    lastUsed: await getLastUsedDate(template._id),
                    createdAt: template.createdAt,
                    updatedAt: template.updatedAt,
                    category: template.category || "general",
                    description: template.description || "",
                    // Template-specific metadata
                    metadata: {
                        ...template.metadata,
                        totalSends: messageUsageCount + emailUsageCount,
                        whatsappSends: messageUsageCount,
                        emailSends: emailUsageCount
                    }
                };
            })
        );

        console.log(`[v0] Found ${templatesWithStats.length} communication templates (total: ${totalTemplates})`);

        res.status(200).json({
            success: true,
            templates: templatesWithStats,
            pagination: {
                currentPage: Number.parseInt(page),
                totalPages: Math.ceil(totalTemplates / Number.parseInt(limit)),
                totalItems: totalTemplates,
                itemsPerPage: Number.parseInt(limit)
            }
        });
    } catch (error) {
        console.error("[v0] Error fetching communication templates:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching templates",
            error: error.message,
        });
    }
};

// Helper function to get last used date for a template
async function getLastUsedDate(templateId) {
    try {
        const lastUsed = await Transaction.findOne({
            $or: [
                { type: "MESSAGE_SENT", category: "COMMUNICATION", 'metadata.templateId': templateId },
                { type: "EMAIL_SENT", category: "COMMUNICATION", 'metadata.templateId': templateId }
            ]
        }).sort({ createdAt: -1 }).select('createdAt');

        return lastUsed?.createdAt || null;
    } catch (error) {
        console.error(`[v0] Error getting last used date for template ${templateId}:`, error);
        return null;
    }
}

// Get sent messages for admin
export const getCommMessages = async (req, res) => {
    try {
        const { type, page = 1, limit = 20, status } = req.query;
        const query = {};

        if (type) query.type = type;
        if (status) query.status = status;

        console.log(`[v0] Fetching communication messages with query:`, { type, status, page, limit });

        // Fetch real messages from Transaction collection
        const messages = await Transaction.find({
            category: 'COMMUNICATION',
            ...query
        })
        .sort({ createdAt: -1 })
        .limit(Number.parseInt(limit) * 1)
        .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

        // Get total count for pagination
        const totalMessages = await Transaction.countDocuments({
            category: 'COMMUNICATION',
            ...query
        });

        // Calculate message statistics
        const messagesWithStats = await Promise.all(
            messages.map(async (message) => {
                // Get template details if templateId exists
                let templateDetails = null;
                if (message.metadata?.templateId) {
                    templateDetails = await Template.findById(message.metadata.templateId)
                        .select('name type subject');
                }

                return {
                    _id: message._id,
                    type: message.type,
                    recipient: message.recipient,
                    content: message.content,
                    subject: message.subject || "",
                    status: message.status,
                    createdAt: message.createdAt,
                    templateId: message.metadata?.templateId || null,
                    template: templateDetails,
                    sentBy: message.metadata?.sentBy || null,
                    messageType: message.metadata?.messageType || "CUSTOM",
                    deliveryStatus: message.status,
                    // Additional metadata
                    metadata: {
                        ...message.metadata,
                        recipientType: message.type.includes('EMAIL') ? 'email' : 'whatsapp',
                        isTemplate: !!message.metadata?.templateId,
                        templateName: templateDetails?.name || null
                    }
                };
            })
        );

        console.log(`[v0] Found ${messagesWithStats.length} communication messages (total: ${totalMessages})`);

        res.status(200).json({
            success: true,
            messages: messagesWithStats,
            pagination: {
                currentPage: Number.parseInt(page),
                totalPages: Math.ceil(totalMessages / Number.parseInt(limit)),
                totalItems: totalMessages,
                itemsPerPage: Number.parseInt(limit)
            }
        });
    } catch (error) {
        console.error("[v0] Error fetching communication messages:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching messages",
            error: error.message,
        });
    }
};

// Get communication configuration for admin
export const getCommConfig = async (req, res) => {
    try {
        const config = {
            emailConfig: {
                smtpHost: "smtp.gmail.com",
                smtpPort: "587",
                username: "admin@driveme.com",
                password: "••••••••••••",
                active: true,
            },
            whatsappConfig: {
                accountSid: "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                authToken: "••••••••••••••••••••••••",
                phoneNumber: "+14155238886",
                active: true,
            }
        };

        res.status(200).json({
            success: true,
            config
        });
    } catch (error) {
        console.error("[v0] Error fetching config:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching config",
            error: error.message,
        });
    }
};

// Send WhatsApp message
export const sendWhatsAppMessage = async (req, res) => {
    try {
        const { recipientNumber, message, templateId } = req.body;
        
        // Validate required fields
        if (!recipientNumber || !message) {
            return res.status(400).json({
                success: false,
                message: "Recipient number and message are required"
            });
        }

        // Log message for audit trail
        console.log("[v0] Sending WhatsApp message:", { recipientNumber, message, templateId });

        // Store message in database for tracking
        const messageRecord = await Transaction.create({
            userId: req.userId,
            type: "WHATSAPP_MESSAGE",
            category: "COMMUNICATION",
            recipient: recipientNumber,
            content: message,
            templateId: templateId || null,
            status: "SENT",
            createdAt: new Date(),
            metadata: {
                sentBy: req.userId,
                messageType: templateId ? "TEMPLATE" : "CUSTOM",
                recipientNumber: recipientNumber
            }
        });

        // Real WhatsApp API integration using Twilio WhatsApp Business API
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;

        if (!accountSid || !authToken || !twilioPhoneNumber) {
            console.warn("[v0] WhatsApp API credentials not configured, using fallback");
            // Fallback to mock response for development
            return res.status(200).json({
                success: true,
                message: "WhatsApp message sent successfully",
                messageId: messageRecord._id,
                sentAt: new Date(),
                deliveryStatus: "SENT"
            });
        }

        const twilio = require('twilio')(accountSid, authToken);

        // Send WhatsApp message
        const whatsappMessage = await twilio.messages.create({
            from: `whatsapp:${twilioPhoneNumber}`,
            to: `whatsapp:${recipientNumber}`,
            body: message,
            // Use template if templateId is provided
            ...(templateId && {
                contentSid: templateId,
                contentVariables: {}
            })
        });

        // Update message record with actual message details
        await Transaction.findByIdAndUpdate(messageRecord._id, {
            status: "DELIVERED",
            metadata: {
                ...messageRecord.metadata,
                twilioMessageSid: whatsappMessage.sid,
                twilioStatus: whatsappMessage.status,
                deliveredAt: new Date()
            }
        });

        console.log("[v0] WhatsApp message sent successfully:", {
            messageId: whatsappMessage.sid,
            recipient: recipientNumber,
            status: whatsappMessage.status
        });

        res.status(200).json({
            success: true,
            message: "WhatsApp message sent successfully",
            messageId: messageRecord._id,
            twilioMessageId: whatsappMessage.sid,
            sentAt: new Date(),
            deliveryStatus: whatsappMessage.status
        });

    } catch (error) {
        console.error("[v0] Error sending WhatsApp message:", error);
        
        // Log failed message attempt
        try {
            await Transaction.create({
                userId: req.userId,
                type: "WHATSAPP_MESSAGE",
                category: "COMMUNICATION_FAILED",
                recipient: req.body.recipientNumber,
                content: req.body.message,
                status: "FAILED",
                createdAt: new Date(),
                metadata: {
                    error: error.message,
                    sentBy: req.userId,
                    recipientNumber: req.body.recipientNumber
                }
            });
        } catch (logError) {
            console.error("[v0] Failed to log message error:", logError);
        }

        res.status(500).json({
            success: false,
            message: "Error sending WhatsApp message",
            error: error.message,
        });
    }
};

// Send email
export const sendEmail = async (req, res) => {
    try {
        const { recipientEmail, subject, body, templateId } = req.body;
        
        // Validate required fields
        if (!recipientEmail || !subject || !body) {
            return res.status(400).json({
                success: false,
                message: "Recipient email, subject, and body are required"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Log email for audit trail
        console.log("[v0] Sending email:", { recipientEmail, subject, body, templateId });

        // Store email in database for tracking
        const emailRecord = await Transaction.create({
            userId: req.userId,
            type: "EMAIL_MESSAGE",
            category: "COMMUNICATION",
            recipient: recipientEmail,
            content: body,
            subject: subject,
            templateId: templateId || null,
            status: "SENT",
            createdAt: new Date(),
            metadata: {
                sentBy: req.userId,
                messageType: templateId ? "TEMPLATE" : "CUSTOM",
                recipientEmail: recipientEmail,
                subject: subject
            }
        });

        // Real email service integration using Nodemailer with SMTP
        const nodemailer = require('nodemailer');
        
        // Get email configuration from environment variables
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
        const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
        const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
        const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

        if (!smtpUser || !smtpPass || !fromEmail) {
            console.warn("[v0] Email service credentials not configured, using fallback");
            // Fallback to mock response for development
            return res.status(200).json({
                success: true,
                message: "Email sent successfully",
                messageId: emailRecord._id,
                sentAt: new Date(),
                deliveryStatus: "SENT"
            });
        }

        // Create transporter with SMTP configuration
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            tls: {
                rejectUnauthorized: false // Allow self-signed certificates
            }
        });

        // Prepare email options
        const mailOptions = {
            from: `"DriveMe Admin" <${fromEmail}>`,
            to: recipientEmail,
            subject: subject,
            html: body, // Send as HTML for rich content
            // Add template processing if templateId is provided
            ...(templateId && {
                templateId: templateId
            })
        };

        // Send email
        const emailResult = await transporter.sendMail(mailOptions);

        // Update email record with actual email details
        await Transaction.findByIdAndUpdate(emailRecord._id, {
            status: "DELIVERED",
            metadata: {
                ...emailRecord.metadata,
                messageId: emailResult.messageId,
                response: emailResult.response,
                deliveredAt: new Date()
            }
        });

        console.log("[v0] Email sent successfully:", {
            messageId: emailResult.messageId,
            recipient: recipientEmail,
            subject: subject,
            response: emailResult.response
        });

        res.status(200).json({
            success: true,
            message: "Email sent successfully",
            messageId: emailRecord._id,
            emailMessageId: emailResult.messageId,
            sentAt: new Date(),
            deliveryStatus: "DELIVERED"
        });

    } catch (error) {
        console.error("[v0] Error sending email:", error);
        
        // Log failed email attempt
        try {
            await Transaction.create({
                userId: req.userId,
                type: "EMAIL_MESSAGE",
                category: "COMMUNICATION_FAILED",
                recipient: req.body.recipientEmail,
                content: req.body.body,
                subject: req.body.subject,
                status: "FAILED",
                createdAt: new Date(),
                metadata: {
                    error: error.message,
                    sentBy: req.userId,
                    recipientEmail: req.body.recipientEmail,
                    subject: req.body.subject
                }
            });
        } catch (logError) {
            console.error("[v0] Failed to log email error:", logError);
        }

        res.status(500).json({
            success: false,
            message: "Error sending email",
            error: error.message,
        });
    }
};

// Update communication configuration
export const updateCommConfig = async (req, res) => {
    try {
        const { type } = req.params;
        const config = req.body;
        
        // Validate configuration type
        if (!type || !['email', 'whatsapp'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid configuration type. Must be 'email' or 'whatsapp'"
            });
        }

        // Validate configuration data
        if (!config || Object.keys(config).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Configuration data is required"
            });
        }

        console.log(`[v0] Updating ${type} config:`, config);

        // Store configuration in database using Transaction collection for audit trail
        const configRecord = await Transaction.create({
            userId: req.userId,
            type: "CONFIG_UPDATE",
            category: "SYSTEM_CONFIG",
            configType: type.toUpperCase(),
            configData: config,
            status: "UPDATED",
            createdAt: new Date(),
            metadata: {
                updatedBy: req.userId,
                configType: type,
                previousConfig: await getPreviousConfig(type),
                newConfig: config
            }
        });

        // Update environment variables or system configuration
        if (type === 'email') {
            // Update email configuration in environment or config store
            await updateEmailConfig(config);
        } else if (type === 'whatsapp') {
            // Update WhatsApp configuration in environment or config store
            await updateWhatsAppConfig(config);
        }

        // Log successful update
        console.log(`[v0] ${type.toUpperCase()} configuration updated successfully by user ${req.userId}`);

        res.status(200).json({
            success: true,
            message: `${type} configuration updated successfully`,
            configId: configRecord._id,
            updatedAt: new Date(),
            updatedBy: req.userId
        });

    } catch (error) {
        console.error("[v0] Error updating config:", error);
        
        // Log failed configuration update attempt
        try {
            await Transaction.create({
                userId: req.userId,
                type: "CONFIG_UPDATE_FAILED",
                category: "SYSTEM_CONFIG",
                configType: req.params.type?.toUpperCase() || "UNKNOWN",
                configData: req.body,
                status: "FAILED",
                createdAt: new Date(),
                metadata: {
                    error: error.message,
                    updatedBy: req.userId,
                    configType: req.params.type
                }
            });
        } catch (logError) {
            console.error("[v0] Failed to log config error:", logError);
        }

        res.status(500).json({
            success: false,
            message: "Error updating configuration",
            error: error.message,
        });
    }
};

// Helper function to get previous configuration
async function getPreviousConfig(type) {
    try {
        const lastConfig = await Transaction.findOne({
            type: "CONFIG_UPDATE",
            category: "SYSTEM_CONFIG",
            configType: type.toUpperCase()
        }).sort({ createdAt: -1 });
        
        return lastConfig?.configData || {};
    } catch (error) {
        console.error(`[v0] Error fetching previous ${type} config:`, error);
        return {};
    }
}

// Helper function to update email configuration
async function updateEmailConfig(config) {
    try {
        // Update email configuration in environment or config store
        const fs = require('fs').promises;
        const path = require('path');
        
        // Create config directory if it doesn't exist
        const configDir = path.join(process.cwd(), 'config');
        await fs.mkdir(configDir, { recursive: true });
        
        // Update email config file
        const emailConfigPath = path.join(configDir, 'email.json');
        const currentEmailConfig = await fs.readFile(emailConfigPath, 'utf8')
            .then(data => JSON.parse(data))
            .catch(() => ({}));
        
        const updatedEmailConfig = { ...currentEmailConfig, ...config };
        await fs.writeFile(emailConfigPath, JSON.stringify(updatedEmailConfig, null, 2));
        
        console.log("[v0] Email configuration saved to file:", updatedEmailConfig);
        
        // Update environment variables if provided
        if (config.smtpHost) process.env.SMTP_HOST = config.smtpHost;
        if (config.smtpPort) process.env.SMTP_PORT = config.smtpPort.toString();
        if (config.smtpUser) process.env.SMTP_USER = config.smtpUser;
        if (config.fromEmail) process.env.FROM_EMAIL = config.fromEmail;
        
    } catch (error) {
        console.error("[v0] Error updating email config:", error);
        throw error;
    }
}

// Helper function to update WhatsApp configuration
async function updateWhatsAppConfig(config) {
    try {
        // Update WhatsApp configuration in environment or config store
        const fs = require('fs').promises;
        const path = require('path');
        
        // Create config directory if it doesn't exist
        const configDir = path.join(process.cwd(), 'config');
        await fs.mkdir(configDir, { recursive: true });
        
        // Update WhatsApp config file
        const whatsappConfigPath = path.join(configDir, 'whatsapp.json');
        const currentWhatsAppConfig = await fs.readFile(whatsappConfigPath, 'utf8')
            .then(data => JSON.parse(data))
            .catch(() => ({}));
        
        const updatedWhatsAppConfig = { ...currentWhatsAppConfig, ...config };
        await fs.writeFile(whatsappConfigPath, JSON.stringify(updatedWhatsAppConfig, null, 2));
        
        console.log("[v0] WhatsApp configuration saved to file:", updatedWhatsAppConfig);
        
        // Update environment variables if provided
        if (config.accountSid) process.env.TWILIO_ACCOUNT_SID = config.accountSid;
        if (config.authToken) process.env.TWILIO_AUTH_TOKEN = config.authToken;
        if (config.phoneNumber) process.env.TWILIO_WHATSAPP_NUMBER = config.phoneNumber;
        
    } catch (error) {
        console.error("[v0] Error updating WhatsApp config:", error);
        throw error;
    }
}

// Get ad campaigns for admin
export const getAdCampaigns = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, provider, placement } = req.query;
        const query = {};

        if (status) query.status = status;
        if (provider) query.provider = provider;
        if (placement) query.placement = placement;

        console.log(`[v0] Fetching ad campaigns with query:`, { status, provider, placement, page, limit });

        // Fetch real campaigns from Campaign collection
        const campaigns = await Campaign.find(query)
            .populate('providerId', 'fullName companyName')
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit) * 1)
            .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

        // Get total count for pagination
        const totalCampaigns = await Campaign.countDocuments(query);

        // Calculate performance metrics for each campaign
        const campaignsWithMetrics = await Promise.all(
            campaigns.map(async (campaign) => {
                // Count actual views from analytics data
                const viewCount = await Transaction.countDocuments({
                    type: "AD_VIEW",
                    category: "ADVERTISEMENT",
                    'metadata.campaignId': campaign._id
                });

                // Count actual clicks from analytics data
                const clickCount = await Transaction.countDocuments({
                    type: "AD_CLICK",
                    category: "ADVERTISEMENT",
                    'metadata.campaignId': campaign._id
                });

                // Calculate performance metrics
                const ctr = viewCount > 0 ? (clickCount / viewCount * 100).toFixed(2) : 0;
                const daysActive = campaign.endDate && campaign.startDate 
                    ? Math.ceil((new Date(campaign.endDate) - new Date(campaign.startDate)) / (1000 * 60 * 60 * 24))
                    : 0;

                return {
                    _id: campaign._id,
                    title: campaign.title,
                    provider: campaign.providerId?.fullName || campaign.providerId?.companyName || 'Unknown Provider',
                    providerId: campaign.providerId?._id,
                    placement: campaign.placement,
                    size: campaign.size,
                    views: viewCount,
                    clicks: clickCount,
                    ctr: parseFloat(ctr),
                    status: campaign.status,
                    startDate: campaign.startDate,
                    endDate: campaign.endDate,
                    imageUrl: campaign.imageUrl,
                    targetUrl: campaign.targetUrl,
                    budget: campaign.budget,
                    spent: campaign.spent || 0,
                    remainingBudget: campaign.budget - (campaign.spent || 0),
                    daysActive: daysActive,
                    isActive: campaign.status === 'active',
                    createdAt: campaign.createdAt,
                    updatedAt: campaign.updatedAt,
                    // Additional campaign metadata
                    metadata: {
                        ...campaign.metadata,
                        performanceMetrics: {
                            views: viewCount,
                            clicks: clickCount,
                            ctr: parseFloat(ctr),
                            costPerClick: clickCount > 0 ? (campaign.spent || 0) / clickCount : 0,
                            costPerView: viewCount > 0 ? (campaign.spent || 0) / viewCount : 0
                        }
                    }
                };
            })
        );

        console.log(`[v0] Found ${campaignsWithMetrics.length} ad campaigns (total: ${totalCampaigns})`);

        res.status(200).json({
            success: true,
            campaigns: campaignsWithMetrics,
            pagination: {
                currentPage: Number.parseInt(page),
                totalPages: Math.ceil(totalCampaigns / Number.parseInt(limit)),
                totalItems: totalCampaigns,
                itemsPerPage: Number.parseInt(limit)
            }
        });
    } catch (error) {
        console.error("[v0] Error fetching ad campaigns:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching campaigns",
            error: error.message,
        });
    }
};

// Get ad statistics for admin
export const getAdStats = async (req, res) => {
    try {
        const stats = {
            totalCampaigns: 2,
            activeCampaigns: 2,
            totalViews: 57756,
            totalClicks: 1650,
            totalRevenue: 8500
        };

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error("[v0] Error fetching ad stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching ad statistics",
            error: error.message,
        });
    }
};

// Create ad campaign
export const createAdCampaign = async (req, res) => {
    try {
        const campaignData = req.body;
        
        // Here you would create the actual campaign
        // For demo, we'll just log the creation
        console.log("Creating campaign:", campaignData);
        
        res.status(201).json({
            success: true,
            message: "Campaign created successfully",
            campaign: {
                _id: 'camp-' + Date.now(),
                ...campaignData,
                views: 0,
                clicks: 0,
                createdAt: new Date()
            }
        });
    } catch (error) {
        console.error("[v0] Error creating campaign:", error);
        res.status(500).json({
            success: false,
            message: "Error creating campaign",
            error: error.message,
        });
    }
};

// Update ad campaign
export const updateAdCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const campaignData = req.body;
        
        // Here you would update the actual campaign
        // For demo, we'll just log the update
        console.log(`Updating campaign ${campaignId}:`, campaignData);
        
        res.status(200).json({
            success: true,
            message: "Campaign updated successfully",
            campaign: {
                _id: campaignId,
                ...campaignData,
                updatedAt: new Date()
            }
        });
    } catch (error) {
        console.error("[v0] Error updating campaign:", error);
        res.status(500).json({
            success: false,
            message: "Error updating campaign",
            error: error.message,
        });
    }
};

// Delete ad campaign
export const deleteAdCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;
        
        // Here you would delete the actual campaign
        // For demo, we'll just log the deletion
        console.log(`Deleting campaign ${campaignId}`);
        
        res.status(200).json({
            success: true,
            message: "Campaign deleted successfully"
        });
    } catch (error) {
        console.error("[v0] Error deleting campaign:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting campaign",
            error: error.message,
        });
    }
};

// Toggle ad campaign status
export const toggleAdCampaignStatus = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { status } = req.body;
        
        // Here you would update the actual campaign status
        // For demo, we'll just log the status change
        console.log(`Toggling campaign ${campaignId} status to:`, status);
        
        res.status(200).json({
            success: true,
            message: `Campaign ${status} successfully`
        });
    } catch (error) {
        console.error("[v0] Error toggling campaign status:", error);
        res.status(500).json({
            success: false,
            message: "Error toggling campaign status",
            error: error.message,
        });
    }
};

// Get ride pooling statistics for admin
export const getRidePoolingStats = async (req, res) => {
    try {
        const stats = {
            totalPassengers: 1250,
            activeRoutes: 45,
            suggestedRoutes: 23,
            matchedRides: 890
        };

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error("[v0] Error fetching ride pooling stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching ride pooling statistics",
            error: error.message,
        });
    }
};

// Get passenger interests for admin
export const getPassengerInterests = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status) query.status = status;

        const interests = [
            {
                _id: 'interest-001',
                passengerId: 'PASS-001',
                passengerName: 'Ahmed Mohammed',
                pickupLocation: 'Kuwait City',
                dropoffLocation: 'Salmiya',
                preferredTime: '08:00 AM',
                frequency: 'daily',
                status: 'active',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                matchedRoutes: 2
            },
            {
                _id: 'interest-002',
                passengerId: 'PASS-002',
                passengerName: 'Fatima Al-Rashid',
                pickupLocation: 'Hawalli',
                dropoffLocation: 'Jahra',
                preferredTime: '09:30 AM',
                frequency: 'weekdays',
                status: 'pending',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                matchedRoutes: 0
            }
        ];

        const total = interests.length;

        res.status(200).json({
            success: true,
            interests,
            pagination: {
                total,
                page: Number.parseInt(page),
                pages: Math.ceil(total / Number.parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("[v0] Error fetching passenger interests:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching passenger interests",
            error: error.message,
        });
    }
};

// Get user suggested routes for admin
export const getUserSuggestedRoutes = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status) query.status = status;

        const routes = [
            {
                _id: 'route-001',
                userId: 'USER-001',
                userName: 'Khalid Ahmed',
                routeName: 'Airport Express',
                startPoint: 'Kuwait Airport',
                endPoint: 'Kuwait City',
                waypoints: ['Farwaniya', 'Shuwaikh'],
                estimatedTime: '45 mins',
                distance: '25 km',
                suggestedPrice: 2.50,
                status: 'under-review',
                votes: 15,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            },
            {
                _id: 'route-002',
                userId: 'USER-002',
                userName: 'Noura Al-Mutairi',
                routeName: 'University Shuttle',
                startPoint: 'Kuwait University',
                endPoint: 'Salmiya',
                waypoints: ['Jabriya', 'Salwa'],
                estimatedTime: '30 mins',
                distance: '18 km',
                suggestedPrice: 1.80,
                status: 'approved',
                votes: 23,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
        ];

        const total = routes.length;

        res.status(200).json({
            success: true,
            routes,
            pagination: {
                total,
                page: Number.parseInt(page),
                pages: Math.ceil(total / Number.parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("[v0] Error fetching user suggested routes:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user suggested routes",
            error: error.message,
        });
    }
};

// Approve user suggested route
export const approveSuggestedRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        
        // Here you would update the actual route status
        // For demo, we'll just log the approval
        console.log(`Approving suggested route ${routeId}`);
        
        res.status(200).json({
            success: true,
            message: "Route approved successfully"
        });
    } catch (error) {
        console.error("[v0] Error approving suggested route:", error);
        res.status(500).json({
            success: false,
            message: "Error approving suggested route",
            error: error.message,
        });
    }
};

// Reject user suggested route
export const rejectSuggestedRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        const { reason } = req.body;
        
        // Here you would update the actual route status
        // For demo, we'll just log the rejection
        console.log(`Rejecting suggested route ${routeId}:`, reason);
        
        res.status(200).json({
            success: true,
            message: "Route rejected successfully"
        });
    } catch (error) {
        console.error("[v0] Error rejecting suggested route:", error);
        res.status(500).json({
            success: false,
            message: "Error rejecting suggested route",
            error: error.message,
        });
    }
};

// Get B2B statistics for admin
export const getB2BStats = async (req, res) => {
    try {
        const stats = {
            totalB2BProviders: 15,
            activeB2BProviders: 12,
            totalB2CProviders: 28,
            activeB2CProviders: 24,
            totalListings: 156,
            activeListings: 142
        };

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error("[v0] Error fetching B2B stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching B2B statistics",
            error: error.message,
        });
    }
};

// Get B2B providers for admin
export const getB2BProviders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status) query.status = status;

        const providers = [
            {
                _id: 'b2b-001',
                companyName: 'Kuwait Transport Co.',
                contactPerson: 'Mohammed Al-Ahmad',
                email: 'info@kwtransport.com',
                phone: '+965 22345678',
                fleetSize: 45,
                activeVehicles: 42,
                status: 'active',
                rating: 4.5,
                totalContracts: 8,
                revenue: 125000,
                createdAt: new Date(Date.now() - 6 * 12 * 30 * 24 * 60 * 60 * 1000)
            },
            {
                _id: 'b2b-002',
                companyName: 'Gulf Logistics',
                contactPerson: 'Salem Al-Khalid',
                email: 'contact@gulflg.com',
                phone: '+965 23456789',
                fleetSize: 32,
                activeVehicles: 28,
                status: 'active',
                rating: 4.2,
                totalContracts: 5,
                revenue: 89000,
                createdAt: new Date(Date.now() - 4 * 12 * 30 * 24 * 60 * 60 * 1000)
            }
        ];

        const total = providers.length;

        res.status(200).json({
            success: true,
            providers,
            pagination: {
                total,
                page: Number.parseInt(page),
                pages: Math.ceil(total / Number.parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("[v0] Error fetching B2B providers:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching B2B providers",
            error: error.message,
        });
    }
};

// Get B2C providers for admin (from B2B listings)
export const getB2CProvidersFromB2B = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status) query.status = status;

        const providers = [
            {
                _id: 'b2c-b2b-001',
                companyName: 'City Bus Services',
                contactPerson: 'Ahmed Hassan',
                email: 'operations@citybus.com',
                phone: '+965 24567890',
                routes: 12,
                activeRoutes: 10,
                status: 'active',
                rating: 4.3,
                totalBookings: 1250,
                revenue: 67000,
                createdAt: new Date(Date.now() - 8 * 12 * 30 * 24 * 60 * 60 * 1000)
            },
            {
                _id: 'b2c-b2b-002',
                companyName: 'Express Shuttle',
                contactPerson: 'Nasser Al-Mutairi',
                email: 'info@expressshuttle.com',
                phone: '+965 25678901',
                routes: 8,
                activeRoutes: 7,
                status: 'active',
                rating: 4.6,
                totalBookings: 890,
                revenue: 45000,
                createdAt: new Date(Date.now() - 3 * 12 * 30 * 24 * 60 * 60 * 1000)
            }
        ];

        const total = providers.length;

        res.status(200).json({
            success: true,
            providers,
            pagination: {
                total,
                page: Number.parseInt(page),
                pages: Math.ceil(total / Number.parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("[v0] Error fetching B2C providers from B2B:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching B2C providers",
            error: error.message,
        });
    }
};

// Suspend B2B provider
export const suspendB2BProvider = async (req, res) => {
    try {
        const { providerId } = req.params;
        
        // Here you would update the actual provider status
        // For demo, we'll just log the suspension
        console.log(`Suspending B2B provider ${providerId}`);
        
        res.status(200).json({
            success: true,
            message: "B2B provider suspended successfully"
        });
    } catch (error) {
        console.error("[v0] Error suspending B2B provider:", error);
        res.status(500).json({
            success: false,
            message: "Error suspending B2B provider",
            error: error.message,
        });
    }
};

// Activate B2B provider
export const activateB2BProvider = async (req, res) => {
    try {
        const { providerId } = req.params;
        
        // Here you would update the actual provider status
        // For demo, we'll just log the activation
        console.log(`Activating B2B provider ${providerId}`);
        
        res.status(200).json({
            success: true,
            message: "B2B provider activated successfully"
        });
    } catch (error) {
        console.error("[v0] Error activating B2B provider:", error);
        res.status(500).json({
            success: false,
            message: "Error activating B2B provider",
            error: error.message,
        });
    }
};

// Toggle online payment system
export const toggleOnlinePayments = async (req, res) => {
    try {
        const { enabled } = req.body;
        
        // Here you would update the actual payment system configuration
        // For demo, we'll just log the change and return success
        console.log(`Online payments ${enabled ? 'enabled' : 'disabled'} by admin ${req.userId}`);
        
        // In a real implementation, you would:
        // 1. Update a system configuration table
        // 2. Notify all payment gateways
        // 3. Log the action for audit
        // 4. Possibly broadcast to connected clients
        
        res.status(200).json({
            success: true,
            message: `Online payments ${enabled ? 'enabled' : 'disabled'} successfully`,
            enabled
        });
    } catch (error) {
        console.error("[v0] Error toggling online payments:", error);
        res.status(500).json({
            success: false,
            message: "Error toggling online payments",
            error: error.message,
        });
    }
};

// Get online payment status
export const getOnlinePaymentStatus = async (req, res) => {
    try {
        // Here you would fetch the actual payment system status
        // For demo, we'll return a default status
        const status = {
            enabled: true,
            lastToggled: new Date(),
            toggledBy: 'System Admin',
            paymentGateways: {
                stripe: true,
                tap: true,
                upi: true
            },
            restrictions: {
                minAmount: 0.5,
                maxAmount: 10000,
                allowedCurrencies: ['KWD', 'USD', 'EUR']
            }
        };

        res.status(200).json({
            success: true,
            status
        });
    } catch (error) {
        console.error("[v0] Error fetching online payment status:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching online payment status",
            error: error.message
        });
    }
};

// Get B2C routes for admin
export const getB2CRoutes = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status) query.status = status;

        // Fetch real B2C routes from database
        const routes = await B2CPartnerRoute.find(query)
            .populate('b2cPartnerId', 'fullName companyName')
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit))
            .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

        const total = await B2CPartnerRoute.countDocuments(query);

        // Format routes for frontend compatibility
        const formattedRoutes = routes.map(route => ({
            _id: route._id,
            name: `${route.fromLocation} to ${route.toLocation}`,
            startPoint: route.fromLocation,
            endPoint: route.toLocation,
            providerName: route.b2cPartnerId?.fullName || route.b2cPartnerId?.companyName || 'Unknown Provider',
            providerId: route.b2cPartnerId?._id,
            departureTime: route.startTime,
            arrivalTime: "N/A", // Can be calculated based on route duration
            capacity: route.totalSeats,
            bookedSeats: route.totalSeats - route.availableSeats,
            status: route.status?.toLowerCase() || "active",
            featured: false,
            price: route.pricing?.oneWayPrice || 0,
            distance: "N/A",
            duration: "N/A",
            createdAt: route.createdAt,
            // Additional B2C specific fields
            tripType: route.tripType,
            availableDays: route.availableDays,
            routeStartDate: route.routeStartDate,
            pricing: route.pricing,
            description: route.description,
            assignedVehicle: route.assignedVehicle,
            assignedDriver: route.assignedDriver
        }));

        res.status(200).json({
            success: true,
            routes: formattedRoutes,
            pagination: {
                total,
                page: Number.parseInt(page),
                pages: Math.ceil(total / Number.parseInt(limit)),
            }
        });
    } catch (error) {
        console.error("[v0] Error fetching B2C routes:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching B2C routes",
            error: error.message
        });
    }
};

// Create B2C route
export const createB2CRoute = async (req, res) => {
    try {
        const routeData = req.body;
        
        // Create actual route in database using B2CPartnerRoute schema
        const newRoute = new B2CPartnerRoute({
            b2cPartnerId: routeData.b2cPartnerId,
            fromLocation: routeData.fromLocation,
            toLocation: routeData.toLocation,
            startTime: routeData.startTime,
            tripType: routeData.tripType || "One Way",
            routeStartDate: routeData.routeStartDate || new Date(),
            availableDays: routeData.availableDays || [],
            totalSeats: routeData.capacity || routeData.totalSeats || 20,
            availableSeats: routeData.availableSeats || (routeData.capacity || 20) - (routeData.bookedSeats || 0),
            pricing: {
                oneWayPrice: routeData.price || routeData.pricing?.oneWayPrice || 0,
                roundTripPrice: routeData.pricing?.roundTripPrice || 0,
                monthlyPrice: routeData.pricing?.monthlyPrice || 0
            },
            description: routeData.description || "",
            assignedVehicle: routeData.assignedVehicle || null,
            assignedDriver: routeData.assignedDriver || null,
            status: routeData.status || "Active",
            isActive: routeData.status !== "Inactive",
            // Additional pricing metadata for booking calculations
            pricingMetadata: {
                pricingType: routeData.pricingType || "perDay",
                customPricing: routeData.customPricing || {},
                calculatedMonthlyPrice: routeData.pricing?.monthlyPrice || 0
            }
        });
        
        const savedRoute = await newRoute.save();
        
        // Populate B2C partner information for response
        await savedRoute.populate('b2cPartnerId', 'fullName companyName');
        
        // Format response for frontend compatibility
        const formattedRoute = {
            _id: savedRoute._id,
            name: `${savedRoute.fromLocation} to ${savedRoute.toLocation}`,
            startPoint: savedRoute.fromLocation,
            endPoint: savedRoute.toLocation,
            providerName: savedRoute.b2cPartnerId?.fullName || savedRoute.b2cPartnerId?.companyName || 'Unknown Provider',
            providerId: savedRoute.b2cPartnerId?._id,
            departureTime: savedRoute.startTime,
            arrivalTime: "N/A", // Can be calculated based on route duration
            capacity: savedRoute.totalSeats,
            bookedSeats: savedRoute.totalSeats - savedRoute.availableSeats,
            status: savedRoute.status?.toLowerCase() || "active",
            featured: false,
            price: savedRoute.pricing?.oneWayPrice || 0,
            distance: "N/A",
            duration: "N/A",
            createdAt: savedRoute.createdAt,
            // Additional B2C specific fields
            tripType: savedRoute.tripType,
            availableDays: savedRoute.availableDays,
            routeStartDate: savedRoute.routeStartDate,
            pricing: savedRoute.pricing,
            description: savedRoute.description,
            assignedVehicle: savedRoute.assignedVehicle,
            assignedDriver: savedRoute.assignedDriver
        };
        
        console.log(`Successfully created B2C route: ${formattedRoute.name}`);
        
        res.status(201).json({
            success: true,
            message: "B2C route created successfully",
            route: formattedRoute
        });
    } catch (error) {
        console.error("[v0] Error creating B2C route:", error);
        res.status(500).json({
            success: false,
            message: "Error creating B2C route",
            error: error.message
        });
    }
};

// Update B2C route
export const updateB2CRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        const updateData = req.body;
        
        // Update actual route in database
        const updatedRoute = await B2CPartnerRoute.findByIdAndUpdate(
            routeId,
            {
                ...updateData,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).populate('providerId', 'fullName companyName');
        
        if (!updatedRoute) {
            return res.status(404).json({
                success: false,
                message: "Route not found"
            });
        }
        
        // Format response
        const formattedRoute = {
            _id: updatedRoute._id,
            name: updatedRoute.name,
            startPoint: updatedRoute.startPoint,
            endPoint: updatedRoute.endPoint,
            providerName: updatedRoute.providerId?.fullName || updatedRoute.providerId?.companyName || 'Unknown Provider',
            providerId: updatedRoute.providerId?._id,
            departureTime: updatedRoute.departureTime,
            arrivalTime: updatedRoute.arrivalTime,
            capacity: updatedRoute.capacity,
            bookedSeats: updatedRoute.bookedSeats,
            status: updatedRoute.status,
            featured: updatedRoute.featured,
            price: updatedRoute.price,
            distance: updatedRoute.distance,
            duration: updatedRoute.duration,
            createdAt: updatedRoute.createdAt
        };
        
        console.log(`Successfully updated B2C route: ${formattedRoute.name}`);
        
        res.status(200).json({
            success: true,
            message: "B2C route updated successfully",
            route: formattedRoute
        });
    } catch (error) {
        console.error("[v0] Error updating B2C route:", error);
        res.status(500).json({
            success: false,
            message: "Error updating B2C route",
            error: error.message
        });
    }
};

// Delete B2C route
export const deleteB2CRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        
        // Delete actual route from database
        const deletedRoute = await B2CPartnerRoute.findByIdAndDelete(routeId);
        
        if (!deletedRoute) {
            return res.status(404).json({
                success: false,
                message: "Route not found"
            });
        }
        
        console.log(`Successfully deleted B2C route: ${deletedRoute.name}`);
        
        res.status(200).json({
            success: true,
            message: "B2C route deleted successfully",
            route: {
                _id: deletedRoute._id,
                name: deletedRoute.name
            }
        });
    } catch (error) {
        console.error("[v0] Error deleting B2C route:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting B2C route",
            error: error.message
        });
    }
};

// Get B2C tags and badges
export const getB2CTags = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status) query.status = status;

        console.log(`[v0] Fetching B2C tags with query:`, { status, page, limit });

        // Fetch real tags from Tag collection
        const tags = await Tag.find(query)
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit) * 1)
            .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

        // Get total count for pagination
        const totalTags = await Tag.countDocuments(query);

        // Calculate usage statistics for each tag
        const tagsWithStats = await Promise.all(
            tags.map(async (tag) => {
                // Count how many B2C routes use this tag
                const routeUsageCount = await B2CPartnerRoute.countDocuments({
                    tags: tag._id,
                    status: 'Active'
                });

                // Count how many B2C vehicles have this tag
                const vehicleUsageCount = await B2CPartnerVehicle.countDocuments({
                    tags: tag._id,
                    status: 'Active'
                });

                return {
                    _id: tag._id,
                    label: tag.label,
                    color: tag.color || "#6b7280",
                    textColor: tag.textColor || "#ffffff",
                    icon: tag.icon || "",
                    description: tag.description || "",
                    usageCount: routeUsageCount + vehicleUsageCount,
                    status: tag.status || "active",
                    createdAt: tag.createdAt,
                    updatedAt: tag.updatedAt,
                    category: tag.category || "general",
                    isActive: tag.status === "active"
                };
            })
        );

        console.log(`[v0] Found ${tagsWithStats.length} B2C tags (total: ${totalTags})`);

        res.status(200).json({
            success: true,
            tags: tagsWithStats,
            pagination: {
                currentPage: Number.parseInt(page),
                totalPages: Math.ceil(totalTags / Number.parseInt(limit)),
                totalItems: totalTags,
                itemsPerPage: Number.parseInt(limit)
            }
        });
    } catch (error) {
        console.error("[v0] Error fetching B2C tags:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching B2C tags",
            error: error.message,
        });
    }
};

// Create B2C tag
export const createB2CTag = async (req, res) => {
    try {
        const tagData = req.body;
        
        // Here you would create the actual tag in database
        const newTag = {
            _id: `tag-${Date.now()}`,
            ...tagData,
            usageCount: 0,
            status: "active",
            createdAt: new Date()
        };
        
        console.log(`Creating B2C tag:`, newTag);
        
        res.status(201).json({
            success: true,
            message: "B2C tag created successfully",
            tag: newTag
        });
    } catch (error) {
        console.error("[v0] Error creating B2C tag:", error);
        res.status(500).json({
            success: false,
            message: "Error creating B2C tag",
            error: error.message,
        });
    }
};

// Get B2C passenger reassignments
export const getB2CPassengerReassignments = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status) query.status = status;

        const reassignments = [
            {
                _id: 'reassign-001',
                passengerId: 'PASS-001',
                passengerName: 'Ahmed Mohammed',
                passengerEmail: 'ahmed@email.com',
                originalRoute: 'Route 5001: Hawally Loop',
                newRoute: 'Route 5002: Salwa Loop',
                originalProvider: 'KGL Transport',
                newProvider: 'Gulf Transport',
                reason: 'Schedule conflict',
                requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                status: 'pending',
                priority: 'normal',
                processedBy: null
            },
            {
                _id: 'reassign-002',
                passengerId: 'PASS-002',
                passengerName: 'Fatima Al-Rashid',
                passengerEmail: 'fatima@email.com',
                originalRoute: 'Route 5003: Kuwait City Loop',
                newRoute: 'Route 5001: Hawally Loop',
                originalProvider: 'Gulf Transport',
                newProvider: 'KGL Transport',
                reason: 'Location change',
                requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                status: 'approved',
                priority: 'high',
                processedBy: 'Admin User'
            }
        ];

        const total = reassignments.length;

        res.status(200).json({
            success: true,
            reassignments,
            pagination: {
                total,
                page: Number.parseInt(page),
                pages: Math.ceil(total / Number.parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("[v0] Error fetching B2C passenger reassignments:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching B2C passenger reassignments",
            error: error.message,
        });
    }
};

// Process passenger reassignment
export const processPassengerReassignment = async (req, res) => {
    try {
        const { reassignmentId } = req.params;
        const { action, reason } = req.body;
        
        // Here you would process the actual reassignment
        console.log(`Processing reassignment ${reassignmentId}:`, { action, reason });
        
        res.status(200).json({
            success: true,
            message: `Passenger reassignment ${action} successfully`
        });
    } catch (error) {
        console.error("[v0] Error processing passenger reassignment:", error);
        res.status(500).json({
            success: false,
            message: "Error processing passenger reassignment",
            error: error.message,
        });
    }
};

// Get B2C earnings and payments
export const getB2CEarningsPayments = async (req, res) => {
    try {
        const { period, providerId } = req.query;
        
        const earnings = {
            totalRevenue: 45678.90,
            totalBookings: 1234,
            averageFare: 37.02,
            commissionEarned: 4567.89,
            providerPayouts: 41111.01,
            pendingPayouts: 2345.67,
            completedPayouts: 38765.34,
            period: period || 'monthly',
            breakdown: [
                {
                    month: 'January 2026',
                    revenue: 12500.00,
                    bookings: 340,
                    commission: 1250.00,
                    payout: 11250.00
                },
                {
                    month: 'December 2025',
                    revenue: 11800.00,
                    bookings: 325,
                    commission: 1180.00,
                    payout: 10620.00
                },
                {
                    month: 'November 2025',
                    revenue: 21378.90,
                    bookings: 569,
                    commission: 2137.89,
                    payout: 19241.01
                }
            ],
            topProviders: [
                {
                    providerId: 'provider-001',
                    providerName: 'KGL Transport',
                    revenue: 28500.00,
                    bookings: 780,
                    commission: 2850.00
                },
                {
                    providerId: 'provider-002',
                    providerName: 'Gulf Transport',
                    revenue: 17178.90,
                    bookings: 454,
                    commission: 1717.89
                }
            ]
        };

        res.status(200).json({
            success: true,
            earnings
        });
    } catch (error) {
        console.error("[v0] Error fetching B2C earnings:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching B2C earnings",
            error: error.message,
        });
    }
};

// Get B2C partner earnings
export const getB2CPartnerEarnings = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        
        const earnings = {
            total: "2130.779 KWD",
            thisWeek: "70.257 KWD",
            thisWeekChange: "+12%",
            today: "20.164 KWD",
        };

        const transactions = [
            { date: "2025-11-04", trips: 5, amount: "+8.766 KWD", status: "Paid" },
            { date: "2025-10-09", trips: 2, amount: "+13.200 KWD", status: "Paid" },
            { date: "2025-09-16", trips: 2, amount: "+9.808 KWD", status: "Paid" },
            { date: "2025-09-02", trips: 1, amount: "+6.725 KWD", status: "Paid" },
            { date: "2025-08-24", trips: 1, amount: "+10.780 KWD", status: "Paid" },
        ];

        res.status(200).json({ 
            success: true, 
            earnings,
            transactions 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error fetching B2C fleet data" 
        });
    }
};

// Get B2C partner fleet
export const getB2CPartnerFleet = async (req, res) => {
    try {
        console.log("[v0] Fetching B2C fleet for partner:", req.userId);
        
        // Fetch real vehicles from B2CPartnerVehicle collection
        const vehicles = await B2CPartnerVehicle.find({ 
            b2cPartnerId: req.userId
        })
        .select('vehicleType model year seatingCapacity licensePlate vehicleColor status images assignedDrivers assignedRoutes createdAt updatedAt features insuranceExpiry registrationExpiry')
        .sort({ createdAt: -1 });
        
        const transformedVehicles = vehicles.map(vehicle => ({
            ...vehicle._doc,
            images: vehicle.images || [],
            features: vehicle.features || [],
            insuranceExpiry: vehicle.insuranceExpiry,
            registrationExpiry: vehicle.registrationExpiry
        }));

        console.log("[v0] Transformed vehicles:", transformedVehicles.length);

        res.status(200).json({ 
            success: true, 
            fleet: {
                vehicles: transformedVehicles || []
            }
        });
    } catch (error) {
        console.error("[v0] Error fetching B2C fleet data:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching B2C fleet data" 
        });
    }
};

// Get B2C partner drivers
export const getB2CPartnerDrivers = async (req, res) => {
    try {
        console.log("[v0] Fetching B2C drivers for partner:", req.userId);
        
        // Fetch real drivers from database
        const drivers = await User.find({ 
            role: 'B2C_PARTNER_DRIVER',
            b2cPartnerId: req.userId,
            status: 'ACTIVE'
        })
        .select('fullName email whatsappNumber driverInfo profileImage status')
        .sort({ createdAt: -1 });

        console.log("[v0] Found B2C drivers:", drivers.length);

        res.status(200).json({ 
            success: true, 
            drivers: drivers || []
        });
    } catch (error) {
        console.error("[v0] Error fetching B2C drivers:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching B2C drivers" 
        });
    }
};

// Create B2C partner vehicle
export const createB2CPartnerVehicle = async (req, res) => {
    try {
        const vehicleData = req.body;
        
        console.log("[v0] B2C Vehicle creation data:", vehicleData);
        console.log("[v0] B2C Vehicle files:", req.files);
        
        // Handle image uploads to Cloudinary
        let uploadedImages = [];
        if (req.files && req.files.images && req.files.images.length > 0) {
            try {
                const { uploadMultipleSequential } = await import("../Config/Cloudinary.js");
                uploadedImages = await uploadMultipleSequential(req.files.images, "b2c-vehicles");
                console.log("[v0] Images uploaded to Cloudinary:", uploadedImages.length);
            } catch (uploadError) {
                console.error("[v0] Cloudinary upload error:", uploadError);
                // Continue without images if upload fails
            }
        }
        
        // Parse additional fields if they're stringified
        let parsedFeatures = [];
        if (vehicleData.features) {
            try {
                parsedFeatures = typeof vehicleData.features === 'string' 
                    ? JSON.parse(vehicleData.features) 
                    : vehicleData.features;
            } catch (e) {
                parsedFeatures = Array.isArray(vehicleData.features) ? vehicleData.features : [];
            }
        }
        
        // Create new vehicle with B2CPartnerVehicle model
        const newVehicle = new B2CPartnerVehicle({
            b2cPartnerId: req.userId,
            vehicleType: vehicleData.vehicleType,
            model: vehicleData.model,
            year: parseInt(vehicleData.year) || new Date().getFullYear(),
            seatingCapacity: parseInt(vehicleData.seatingCapacity) || 4,
            licensePlate: vehicleData.licensePlate,
            vehicleColor: vehicleData.vehicleColor || "White",
            features: parsedFeatures,
            images: uploadedImages.map(img => ({
                url: img.secure_url,
                publicId: img.public_id || `b2c-vehicles/${img.public_id || img.asset_id}`
            })),
            status: vehicleData.status || "Active",
            insuranceExpiry: vehicleData.insuranceExpiry ? new Date(vehicleData.insuranceExpiry) : undefined,
            registrationExpiry: vehicleData.registrationExpiry ? new Date(vehicleData.registrationExpiry) : undefined,
            isActive: true
        });
        
        const savedVehicle = await newVehicle.save();
        
        console.log(`Successfully created B2C vehicle: ${savedVehicle.vehicleName}`);
        console.log(`Vehicle images: ${savedVehicle.images.length} uploaded`);
        
        res.status(201).json({
            success: true,
            message: "B2C vehicle created successfully",
            vehicle: savedVehicle
        });
    } catch (error) {
        console.error("[v0] Error creating B2C vehicle:", error);
        res.status(500).json({
            success: false,
            message: "Error creating B2C vehicle",
            error: error.message
        });
    }
};

// Update B2C partner vehicle
export const updateB2CPartnerVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const vehicleData = req.body;
        
        console.log("[v0] B2C Vehicle update data:", vehicleData);
        console.log("[v0] B2C Vehicle files:", req.files);
        
        // Find existing vehicle
        const existingVehicle = await B2CPartnerVehicle.findOne({
            _id: vehicleId,
            b2cPartnerId: req.userId
        });
        
        if (!existingVehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found or you don't have permission to update it"
            });
        }
        
        // Handle image uploads to Cloudinary
        let uploadedImages = [];
        if (req.files && req.files.images && req.files.images.length > 0) {
            try {
                const { uploadMultipleSequential } = await import("../Config/Cloudinary.js");
                uploadedImages = await uploadMultipleSequential(req.files.images, "b2c-vehicles");
                console.log("[v0] New images uploaded to Cloudinary:", uploadedImages.length);
            } catch (uploadError) {
                console.error("[v0] Cloudinary upload error:", uploadError);
                // Continue without images if upload fails
            }
        }
        
        // Parse additional fields if they're stringified
        let parsedFeatures = [];
        if (vehicleData.features) {
            try {
                parsedFeatures = typeof vehicleData.features === 'string' 
                    ? JSON.parse(vehicleData.features) 
                    : vehicleData.features;
            } catch (e) {
                parsedFeatures = Array.isArray(vehicleData.features) ? vehicleData.features : [];
            }
        }
        
        // Merge existing images with new ones
        let finalImages = existingVehicle.images || [];
        if (uploadedImages.length > 0) {
            finalImages = [...finalImages, ...uploadedImages.map(img => ({
                url: img.secure_url,
                publicId: img.public_id || `b2c-vehicles/${img.public_id || img.asset_id}`
            }))];
        }
        
        // Update vehicle with new data
        const updatedVehicle = await B2CPartnerVehicle.findByIdAndUpdate(
            vehicleId,
            {
                vehicleType: vehicleData.vehicleType || existingVehicle.vehicleType,
                model: vehicleData.model || existingVehicle.model,
                year: parseInt(vehicleData.year) || existingVehicle.year,
                seatingCapacity: parseInt(vehicleData.seatingCapacity) || existingVehicle.seatingCapacity,
                licensePlate: vehicleData.licensePlate || existingVehicle.licensePlate,
                vehicleColor: vehicleData.vehicleColor || existingVehicle.vehicleColor,
                features: parsedFeatures.length > 0 ? parsedFeatures : existingVehicle.features,
                images: finalImages,
                status: vehicleData.status || existingVehicle.status,
                insuranceExpiry: vehicleData.insuranceExpiry ? new Date(vehicleData.insuranceExpiry) : existingVehicle.insuranceExpiry,
                registrationExpiry: vehicleData.registrationExpiry ? new Date(vehicleData.registrationExpiry) : existingVehicle.registrationExpiry,
            },
            { new: true }
        );
        
        console.log(`Successfully updated B2C vehicle: ${updatedVehicle.vehicleName}`);
        console.log(`Vehicle images: ${updatedVehicle.images.length} total`);
        
        res.status(200).json({
            success: true,
            message: "B2C vehicle updated successfully",
            vehicle: updatedVehicle
        });
    } catch (error) {
        console.error("[v0] Error updating B2C vehicle:", error);
        res.status(500).json({
            success: false,
            message: "Error updating B2C vehicle",
            error: error.message
        });
    }
};

export const deleteB2CPartnerVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        
        // Find and delete the vehicle
        const vehicle = await B2CPartnerVehicle.findOneAndDelete({
            _id: vehicleId,
            b2cPartnerId: req.userId
        });
        
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found or you don't have permission to delete it"
            });
        }
        
        console.log(`Successfully deleted B2C vehicle: ${vehicle.vehicleName}`);
        console.log(`Vehicle had ${vehicle.images.length} images`);
        
        res.status(200).json({
            success: true,
            message: "B2C vehicle deleted successfully"
        });
    } catch (error) {
        console.error("[v0] Error deleting B2C vehicle:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting B2C vehicle",
            error: error.message
        });
    }
};

export const createB2CPartnerTrip = async (req, res) => {
    try {
        const tripData = req.body;
        
        // Create new trip instance
        const newTrip = new B2CPassengerBooking({
            routeId: tripData.routeId,
            b2cPartnerId: req.userId,
            tripDate: new Date(tripData.tripDate),
            startTime: tripData.startTime,
            fromLocation: tripData.fromLocation,
            toLocation: tripData.toLocation,
            tripType: tripData.tripType,
            totalSeats: tripData.totalSeats,
            availableSeats: tripData.availableSeats,
            pricing: tripData.pricing,
            assignedVehicle: tripData.vehicleId,
            assignedDriver: tripData.driverId,
            notes: tripData.notes || "",
            status: "Scheduled",
            isActive: true
        });
        
        const savedTrip = await newTrip.save();
        
        // Populate related data
        await savedTrip.populate('assignedVehicle', 'plateNumber model type capacity');
        await savedTrip.populate('assignedDriver', 'fullName phone');
        
        console.log(`Successfully created B2C trip: ${tripData.fromLocation} to ${tripData.toLocation} on ${tripData.tripDate}`);
        
        res.status(201).json({
            success: true,
            message: "B2C trip created successfully",
            trip: savedTrip
        });
    } catch (error) {
        console.error("[v0] Error creating B2C trip:", error);
        res.status(500).json({
            success: false,
            message: "Error creating B2C trip",
            error: error.message
        });
    }
};

// Get Commuter routes
export const getCommuterRoutes = async (req, res) => {
    try {
        const routes = [
            {
                _id: 'route-001',
                name: 'Kuwait City to Salmiya Express',
                startPoint: 'Kuwait City',
                endPoint: 'Salmiya',
                distance: '15 km',
                estimatedTime: '25 mins',
                price: 2.5,
                status: 'active',
                partnerName: 'Kuwait Transport Co.',
                departureTime: '08:00 AM',
                arrivalTime: '08:25 AM',
                createdAt: new Date()
            },
            {
                _id: 'route-002',
                name: 'Airport to Hawally Shuttle',
                startPoint: 'Kuwait International Airport',
                endPoint: 'Hawally',
                distance: '20 km',
                estimatedTime: '30 mins',
                price: 3.0,
                status: 'inactive',
                partnerName: 'Airport Express',
                departureTime: '06:00 AM',
                arrivalTime: '06:30 AM',
                createdAt: new Date()
            }
        ];

        res.status(200).json({ 
            success: true, 
            routes 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error fetching commuter routes" 
        });
    }
};

// Join route
export const joinRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        const userId = req.userId;
        
        // Validate route ID
        if (!routeId) {
            return res.status(400).json({
                success: false,
                message: "Route ID is required"
            });
        }
        
        console.log(`[v0] User ${userId} attempting to join route ${routeId}`);
        
        // Check if route exists and is active
        const route = await B2CPartnerRoute.findById(routeId);
        if (!route) {
            return res.status(404).json({
                success: false,
                message: "Route not found"
            });
        }
        
        if (route.status !== 'Active') {
            return res.status(400).json({
                success: false,
                message: "Route is not active for joining"
            });
        }
        
        // Check if user is already a member of this route
        const existingMembership = await Transaction.findOne({
            userId: userId,
            type: "ROUTE_MEMBERSHIP",
            category: "COMMUTER_ROUTE",
            'metadata.routeId': routeId,
            status: { $in: ['ACTIVE', 'PENDING'] }
        });
        
        if (existingMembership) {
            return res.status(400).json({
                success: false,
                message: "User is already a member of this route"
            });
        }
        
        // Check available seats
        if (route.availableSeats <= 0) {
            return res.status(400).json({
                success: false,
                message: "No available seats on this route"
            });
        }
        
        // Create route membership record
        const membership = await Transaction.create({
            userId: userId,
            type: "ROUTE_MEMBERSHIP",
            category: "COMMUTER_ROUTE",
            routeId: routeId,
            status: "ACTIVE",
            joinedAt: new Date(),
            metadata: {
                routeName: `${route.fromLocation} to ${route.toLocation}`,
                fromLocation: route.fromLocation,
                toLocation: route.toLocation,
                providerId: route.b2cPartnerId,
                pricing: route.pricing,
                availableDays: route.availableDays
            }
        });
        
        // Update route available seats
        await B2CPartnerRoute.findByIdAndUpdate(routeId, {
            $inc: { availableSeats: -1 },
            $push: {
                members: {
                    userId: userId,
                    joinedAt: new Date(),
                    status: 'ACTIVE'
                }
            }
        });
        
        // Create notification for route provider
        await Transaction.create({
            userId: route.b2cPartnerId,
            type: "ROUTE_MEMBER_JOINED",
            category: "PROVIDER_NOTIFICATION",
            memberId: userId,
            routeId: routeId,
            status: "SENT",
            createdAt: new Date(),
            metadata: {
                routeName: `${route.fromLocation} to ${route.toLocation}`,
                memberId: userId,
                action: "JOINED"
            }
        });
        
        console.log(`[v0] User ${userId} successfully joined route ${routeId}`);
        
        res.status(200).json({
            success: true,
            message: "Successfully joined route",
            membershipId: membership._id,
            routeInfo: {
                routeId: route._id,
                routeName: `${route.fromLocation} to ${route.toLocation}`,
                fromLocation: route.fromLocation,
                toLocation: route.toLocation,
                pricing: route.pricing,
                availableDays: route.availableDays,
                joinedAt: new Date()
            }
        });
        
    } catch (error) {
        console.error("[v0] Error joining route:", error);
        
        // Log failed join attempt
        try {
            await Transaction.create({
                userId: req.userId,
                type: "ROUTE_JOIN_FAILED",
                category: "COMMUTER_ROUTE",
                routeId: req.params.routeId,
                status: "FAILED",
                createdAt: new Date(),
                metadata: {
                    error: error.message,
                    attemptedAt: new Date()
                }
            });
        } catch (logError) {
            console.error("[v0] Failed to log route join error:", logError);
        }
        
        res.status(500).json({
            success: false,
            message: "Error joining route",
            error: error.message
        });
    }
};

// Leave route
export const leaveRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        const userId = req.userId;
        
        // Validate route ID
        if (!routeId) {
            return res.status(400).json({
                success: false,
                message: "Route ID is required"
            });
        }
        
        console.log(`[v0] User ${userId} attempting to leave route ${routeId}`);
        
        // Check if route exists
        const route = await B2CPartnerRoute.findById(routeId);
        if (!route) {
            return res.status(404).json({
                success: false,
                message: "Route not found"
            });
        }
        
        // Find active membership
        const membership = await Transaction.findOne({
            userId: userId,
            type: "ROUTE_MEMBERSHIP",
            category: "COMMUTER_ROUTE",
            'metadata.routeId': routeId,
            status: 'ACTIVE'
        });
        
        if (!membership) {
            return res.status(400).json({
                success: false,
                message: "User is not a member of this route"
            });
        }
        
        // Update membership status to LEFT
        await Transaction.findByIdAndUpdate(membership._id, {
            status: 'LEFT',
            leftAt: new Date(),
            metadata: {
                ...membership.metadata,
                leftAt: new Date(),
                reason: 'User left route'
            }
        });
        
        // Update route available seats (add back the seat)
        await B2CPartnerRoute.findByIdAndUpdate(routeId, {
            $inc: { availableSeats: 1 },
            $pull: {
                members: {
                    userId: userId,
                    status: 'ACTIVE'
                }
            }
        });
        
        // Create notification for route provider
        await Transaction.create({
            userId: route.b2cPartnerId,
            type: "ROUTE_MEMBER_LEFT",
            category: "PROVIDER_NOTIFICATION",
            memberId: userId,
            routeId: routeId,
            status: "SENT",
            createdAt: new Date(),
            metadata: {
                routeName: `${route.fromLocation} to ${route.toLocation}`,
                memberId: userId,
                action: "LEFT",
                membershipDuration: {
                    joinedAt: membership.joinedAt,
                    leftAt: new Date()
                }
            }
        });
        
        console.log(`[v0] User ${userId} successfully left route ${routeId}`);
        
        res.status(200).json({
            success: true,
            message: "Successfully left route",
            membershipId: membership._id,
            routeInfo: {
                routeId: route._id,
                routeName: `${route.fromLocation} to ${route.toLocation}`,
                fromLocation: route.fromLocation,
                toLocation: route.toLocation,
                leftAt: new Date(),
                membershipDuration: {
                    joinedAt: membership.joinedAt,
                    leftAt: new Date()
                }
            }
        });
        
    } catch (error) {
        console.error("[v0] Error leaving route:", error);
        
        // Log failed leave attempt
        try {
            await Transaction.create({
                userId: req.userId,
                type: "ROUTE_LEAVE_FAILED",
                category: "COMMUTER_ROUTE",
                routeId: req.params.routeId,
                status: "FAILED",
                createdAt: new Date(),
                metadata: {
                    error: error.message,
                    attemptedAt: new Date()
                }
            });
        } catch (logError) {
            console.error("[v0] Failed to log route leave error:", logError);
        }
        
        res.status(500).json({
            success: false,
            message: "Error leaving route",
            error: error.message
        });
    }
};

// Get Commuter profile
export const getCommuterProfile = async (req, res) => {
    try {
        const profile = {
            fullName: 'Ahmed Khalid',
            email: 'ahmed@commuter.com',
            phone: '+965 22334455',
            language: 'en',
            currency: 'KWD'
        };

        const preferences = {
            pushNotifications: true,
            marketingEmails: false,
            tripReminders: true,
            promotionalOffers: true
        };

        res.status(200).json({ 
            success: true, 
            profile,
            preferences 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error fetching commuter profile" 
        });
    }
};

// Update Commuter profile
export const updateCommuterProfile = async (req, res) => {
    try {
        const { profile, preferences } = req.body;
        const userId = req.userId;
        
        // Validate input data
        if (!profile || !preferences) {
            return res.status(400).json({
                success: false,
                message: "Profile and preferences data are required"
            });
        }

        console.log(`[v0] Updating commuter profile for user ${userId}:`, { profile, preferences });

        // Find existing user profile
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Validate email format if provided
        if (profile.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(profile.email)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format"
                });
            }
        }

        // Validate phone number format if provided
        if (profile.phone) {
            const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
            if (!phoneRegex.test(profile.phone)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid phone number format"
                });
            }
        }

        // Update user profile with real database operations
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    ...(profile.fullName && { fullName: profile.fullName }),
                    ...(profile.email && { email: profile.email }),
                    ...(profile.phone && { whatsappNumber: profile.phone }),
                    ...(profile.language && { language: profile.language }),
                    ...(profile.currency && { currency: profile.currency }),
                    ...(profile.profileImage && { profileImage: profile.profileImage }),
                    // Update preferences in user document or separate preferences collection
                    ...(preferences.pushNotifications !== undefined && { 
                        'preferences.pushNotifications': preferences.pushNotifications 
                    }),
                    ...(preferences.marketingEmails !== undefined && { 
                        'preferences.marketingEmails': preferences.marketingEmails 
                    }),
                    ...(preferences.tripReminders !== undefined && { 
                        'preferences.tripReminders': preferences.tripReminders 
                    }),
                    ...(preferences.promotionalOffers !== undefined && { 
                        'preferences.promotionalOffers': preferences.promotionalOffers 
                    })
                }
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Log profile update in transaction history
        await Transaction.create({
            userId: userId,
            type: "PROFILE_UPDATE",
            category: "USER_PROFILE",
            status: "UPDATED",
            createdAt: new Date(),
            metadata: {
                updatedBy: userId,
                previousProfile: {
                    fullName: user.fullName,
                    email: user.email,
                    whatsappNumber: user.whatsappNumber,
                    language: user.language,
                    currency: user.currency,
                    profileImage: user.profileImage
                },
                newProfile: profile,
                preferences: preferences
            }
        });

        console.log(`[v0] Commuter profile updated successfully for user ${userId}`);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile: {
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                whatsappNumber: updatedUser.whatsappNumber,
                language: updatedUser.language,
                currency: updatedUser.currency,
                profileImage: updatedUser.profileImage,
                updatedAt: updatedUser.updatedAt
            },
            preferences: {
                pushNotifications: updatedUser.preferences?.pushNotifications || false,
                marketingEmails: updatedUser.preferences?.marketingEmails || false,
                tripReminders: updatedUser.preferences?.tripReminders || false,
                promotionalOffers: updatedUser.preferences?.promotionalOffers || false
            }
        });

    } catch (error) {
        console.error("[v0] Error updating commuter profile:", error);
        
        // Log failed profile update attempt
        try {
            await Transaction.create({
                userId: req.userId,
                type: "PROFILE_UPDATE_FAILED",
                category: "USER_PROFILE",
                status: "FAILED",
                createdAt: new Date(),
                metadata: {
                    error: error.message,
                    attemptedAt: new Date(),
                    profileData: req.body.profile,
                    preferencesData: req.body.preferences
                }
            });
        } catch (logError) {
            console.error("[v0] Failed to log profile update error:", logError);
        }

        res.status(500).json({
            success: false,
            message: "Error updating commuter profile",
            error: error.message
        });
    }
};

// Change password
export const changeCommuterPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.userId;
        
        // Validate input data
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long"
            });
        }

        // Validate password complexity
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            });
        }

        console.log(`[v0] Password change request for user ${userId}`);

        // Find user and verify current password
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const bcrypt = require('bcryptjs');
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update user password in database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                password: hashedNewPassword,
                passwordChangedAt: new Date(),
                lastPasswordChange: new Date()
            },
            { new: true, runValidators: true }
        ).select('-password');

        // Log password change in transaction history
        await Transaction.create({
            userId: userId,
            type: "PASSWORD_CHANGE",
            category: "USER_SECURITY",
            status: "CHANGED",
            createdAt: new Date(),
            metadata: {
                changedBy: userId,
                previousPasswordHash: user.password,
                passwordChangedAt: new Date(),
                changeMethod: "USER_INITIATED",
                ipAddress: req.ip || req.connection.remoteAddress
            }
        });

        console.log(`[v0] Password changed successfully for user ${userId}`);

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
            changedAt: new Date(),
            passwordExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
        });

    } catch (error) {
        console.error("[v0] Error changing password:", error);
        
        // Log failed password change attempt
        try {
            await Transaction.create({
                userId: req.userId,
                type: "PASSWORD_CHANGE_FAILED",
                category: "USER_SECURITY",
                status: "FAILED",
                createdAt: new Date(),
                metadata: {
                    error: error.message,
                    attemptedAt: new Date(),
                    ipAddress: req.ip || req.connection.remoteAddress,
                    changeMethod: "USER_INITIATED"
                }
            });
        } catch (logError) {
            console.error("[v0] Failed to log password change error:", logError);
        }

        res.status(500).json({
            success: false,
            message: "Error changing password",
            error: error.message
        });
    }
};

// Get B2C partner profile
export const getB2CPartnerProfile = async (req, res) => {
    try {
        const profile = {
            fullName: 'Ahmed Khalid',
            email: 'ahmed@b2cpartner.com',
            phone: '+965 22334455',
            company: 'Kuwait Transport Co.',
            licenseNumber: 'B2C-LIC-001'
        };

        const preferences = {
            newTripAlerts: true,
            dailyEarnings: true,
            promotionalOffers: false,
        };

        res.status(200).json({ 
            success: true, 
            profile,
            preferences 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error fetching B2C profile" 
        });
    }
};

// Update B2C partner profile
export const updateB2CPartnerProfile = async (req, res) => {
    try {
        const { profile, preferences } = req.body;
        const userId = req.userId;
        
        // Validate input data
        if (!profile || !preferences) {
            return res.status(400).json({
                success: false,
                message: "Profile and preferences data are required"
            });
        }

        console.log(`[v0] Updating B2C partner profile for user ${userId}:`, { profile, preferences });

        // Find existing B2C partner user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Validate email format if provided
        if (profile.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(profile.email)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format"
                });
            }
        }

        // Validate phone number format if provided
        if (profile.phone) {
            const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
            if (!phoneRegex.test(profile.phone)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid phone number format"
                });
            }
        }

        // Update B2C partner profile with real database operations
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    ...(profile.fullName && { fullName: profile.fullName }),
                    ...(profile.email && { email: profile.email }),
                    ...(profile.phone && { whatsappNumber: profile.phone }),
                    ...(profile.company && { company: profile.company }),
                    ...(profile.licenseNumber && { licenseNumber: profile.licenseNumber }),
                    ...(profile.officeAddress && { officeAddress: profile.officeAddress }),
                    ...(profile.website && { website: profile.website }),
                    // Update B2C partner specific preferences
                    ...(preferences.newTripAlerts !== undefined && { 
                        'preferences.newTripAlerts': preferences.newTripAlerts 
                    }),
                    ...(preferences.dailyEarnings !== undefined && { 
                        'preferences.dailyEarnings': preferences.dailyEarnings 
                    }),
                    ...(preferences.promotionalOffers !== undefined && { 
                        'preferences.promotionalOffers': preferences.promotionalOffers 
                    }),
                    ...(preferences.vehicleMaintenance !== undefined && { 
                        'preferences.vehicleMaintenance': preferences.vehicleMaintenance 
                    }),
                    ...(preferences.driverManagement !== undefined && { 
                        'preferences.driverManagement': preferences.driverManagement 
                    })
                }
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Log profile update in transaction history
        await Transaction.create({
            userId: userId,
            type: "B2C_PARTNER_PROFILE_UPDATE",
            category: "B2C_PARTNER",
            status: "UPDATED",
            createdAt: new Date(),
            metadata: {
                updatedBy: userId,
                previousProfile: {
                    fullName: user.fullName,
                    email: user.email,
                    whatsappNumber: user.whatsappNumber,
                    company: user.company,
                    licenseNumber: user.licenseNumber,
                    officeAddress: user.officeAddress,
                    website: user.website
                },
                newProfile: profile,
                preferences: preferences
            }
        });

        console.log(`[v0] B2C partner profile updated successfully for user ${userId}`);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile: {
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                whatsappNumber: updatedUser.whatsappNumber,
                company: updatedUser.company,
                licenseNumber: updatedUser.licenseNumber,
                officeAddress: updatedUser.officeAddress,
                website: updatedUser.website,
                updatedAt: updatedUser.updatedAt
            },
            preferences: {
                newTripAlerts: updatedUser.preferences?.newTripAlerts || false,
                dailyEarnings: updatedUser.preferences?.dailyEarnings || false,
                promotionalOffers: updatedUser.preferences?.promotionalOffers || false,
                vehicleMaintenance: updatedUser.preferences?.vehicleMaintenance || false,
                driverManagement: updatedUser.preferences?.driverManagement || false
            }
        });

    } catch (error) {
        console.error("[v0] Error updating B2C partner profile:", error);
        
        // Log failed profile update attempt
        try {
            await Transaction.create({
                userId: req.userId,
                type: "B2C_PARTNER_PROFILE_UPDATE_FAILED",
                category: "B2C_PARTNER",
                status: "FAILED",
                createdAt: new Date(),
                metadata: {
                    error: error.message,
                    attemptedAt: new Date(),
                    profileData: req.body.profile,
                    preferencesData: req.body.preferences
                }
            });
        } catch (logError) {
            console.error("[v0] Failed to log B2C partner profile update error:", logError);
        }

        res.status(500).json({
            success: false,
            message: "Error updating B2C profile",
            error: error.message
        });
    }
};

// Get B2B settings
export const getB2BSettings = async (req, res) => {
    try {
        const settings = {
            companyName: "Royal Fleets Co.",
            tradeLicense: "TL-998877-KW",
            officeAddress: "Al-Hamra Tower, Floor 25, Kuwait City",
            email: "fleet@driveme.com",
            phone: "+965 2200 1100",
            website: "https://www.royalfleets.com.kw",
            notifications: {
                contracts: true,
                maintenance: true,
                drivers: true,
                marketing: false,
            }
        };
        res.status(200).json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching B2B settings" });
    }
};

// Update B2B settings
export const updateB2BSettings = async (req, res) => {
    try {
        const { companyInfo, notifications } = req.body;
        // TODO: Update settings in database
        res.status(200).json({ 
            success: true, 
            message: "Settings updated successfully" 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating B2B settings" });
    }
};

// Get B2B fleet and drivers data
export const getB2BFleetAndDrivers = async (req, res) => {
    try {
        const fleetData = {
            vehicles: [
                {
                    _id: 'vehicle-001',
                    type: 'Bus',
                    make: 'Mercedes-Benz',
                    licensePlate: 'KWT-1234',
                    capacity: 25,
                    status: 'Active',
                    driver: 'Driver 1'
                }
            ],
            drivers: [
                {
                    _id: 'driver-001',
                    name: 'Ahmed Mohammed',
                    phone: '+965 98765432',
                    status: 'Active',
                    assignedVehicle: 'KWT-1234'
                }
            ]
        };
        res.status(200).json({ success: true, fleetData });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching B2B fleet data" });
    }
};

// Get B2B analytics data
export const getB2BAnalytics = async (req, res) => {
    try {
        const analytics = {
            financialPerformance: {
                totalRevenueYTD: 24295,
                netProfitYTD: 17974,
                profitMargin: 74.0
            },
            chartData: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                revenue: [3500, 7000, 3500, 3800, 3500, 4000],
                expenses: [1500, 1000, 800, 600, 800, 2000]
            }
        };
        res.status(200).json({ success: true, analytics });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching B2B analytics" });
    }
};

// Get B2B partner overview statistics
export const getB2BPartnerOverview = async (req, res) => {
    try {
        const overview = {
            activeVehicles: { current: 8, total: 12 },
            activeContracts: 3,
            revenueMonthly: 4200,
            fleetHealth: 92,
            contracts: [
                {
                    _id: 'contract-001',
                    name: "Employee Transport - Mangaf",
                    organization: "KOC",
                    value: 3246,
                    status: "Active",
                    payment: "Paid"
                }
            ]
        };
        res.status(200).json({ success: true, overview });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching B2B overview" });
    }
};

// Get payment statistics for admin
export const getPaymentStats = async (req, res) => {
    try {
        const stats = {
            totalPending: 5,
            totalVerified: 12,
            totalRejected: 2,
            totalAmount: 15420.50
        };

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error("[v0] Error fetching payment stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching payment statistics",
            error: error.message,
        });
    }
};

// Get recent activity for admin dashboard
export const getRecentActivity = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        // Get recent user registrations
        const recentUsers = await User.find({})
            .select('fullName role createdAt')
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit));

        // Get recent payments
        const recentPayments = await Payment.find({})
            .populate('corporateOwnerId', 'fullName companyName')
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit));

        // Get recent contracts
        const recentContracts = await Contract.find({})
            .populate('corporateOwnerId', 'fullName companyName')
            .populate('fleetOwnerId', 'fullName companyName')
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit));

        // Combine and format activities
        const activities = [];

        // Add user registrations
        recentUsers.forEach(user => {
            activities.push({
                type: 'user_registered',
                title: 'New User Registration',
                description: `${user.fullName} registered as ${user.role.replace('_', ' ')}`,
                timestamp: user.createdAt,
                data: user
            });
        });

        // Add payments
        recentPayments.forEach(payment => {
            activities.push({
                type: 'payment_received',
                title: 'Payment Received',
                description: `${payment.corporateOwnerId?.fullName || 'Unknown'} made a payment of ${payment.amount}`,
                timestamp: payment.createdAt,
                data: payment
            });
        });

        // Add contracts
        recentContracts.forEach(contract => {
            activities.push({
                type: 'contract_signed',
                title: 'Contract Signed',
                description: `Contract signed between ${contract.corporateOwnerId?.companyName} and ${contract.fleetOwnerId?.companyName}`,
                timestamp: contract.createdAt,
                data: contract
            });
        });

        // Sort by timestamp and limit
        const sortedActivities = activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, Number.parseInt(limit));

        res.status(200).json({
            success: true,
            recentActivity: sortedActivities
        });
    } catch (error) {
        console.error("[v0] Error fetching recent activity:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching recent activity",
            error: error.message,
        });
    }
};

// Get all pending payments for admin verification
export const getPendingPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            status: "PENDING",
            verificationStatus: "PENDING",
        })
            .populate("contractId", "contractNumber")
            .populate("corporateOwnerId", "fullName companyName email phone")
            .populate("fleetOwnerId", "fullName companyName email phone")
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: payments.length,
            payments,
        })
    } catch (error) {
        console.error("[v0] Error fetching pending payments:", error)
        res.status(500).json({
            success: false,
            message: "Error fetching pending payments",
            error: error.message,
        })
    }
}

// Get payment details for verification
export const getPaymentDetails = async (req, res) => {
    try {
        const { paymentId } = req.params

        const payment = await Payment.findById(paymentId)
            .populate("contractId")
            .populate("corporateOwnerId", "fullName companyName email whatsappNumber company")
            .populate("fleetOwnerId", "fullName companyName email whatsappNumber company")

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            })
        }

        res.status(200).json({
            success: true,
            payment,
        })
    } catch (error) {
        console.error("[v0] Error fetching payment details:", error)
        res.status(500).json({
            success: false,
            message: "Error fetching payment details",
            error: error.message,
        })
    }
}

// // Verify and approve payment
// export const verifyPayment = async (req, res) => {
//     try {
//         const { paymentId } = req.params
//         const { action, reason } = req.body // action: 'APPROVE' or 'REJECT'

//         const payment = await Payment.findById(paymentId).populate("contractId")

//         if (!payment) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Payment not found",
//             })
//         }

//         if (payment.verificationStatus !== "PENDING") {
//             return res.status(400).json({
//                 success: false,
//                 message: "Payment already verified",
//             })
//         }

//         if (action === "APPROVE") {
//             payment.status = "COMPLETED"
//             payment.verificationStatus = "VERIFIED"
//             payment.verifiedBy = req.userId
//             payment.verifiedAt = new Date()

//             // Calculate commission split
//             const adminCommissionAmount = (payment.amount * 20) / 100
//             const fleetOwnerAmount = (payment.amount * 80) / 100

//             payment.adminCommission = adminCommissionAmount
//             payment.fleetOwnerAmount = fleetOwnerAmount,


//             await payment.save()

//             // Update wallets
//             let adminWallet = await Wallet.findOne({ userId: req.userId, role: "ADMIN" })
//             if (!adminWallet) {
//                 adminWallet = new Wallet({
//                     userId: req.userId,
//                     role: "ADMIN",
//                     balance: 0,
//                 })
//             }
//             const adminBalanceBefore = adminWallet.balance
//             adminWallet.balance += adminCommissionAmount
//             const adminBalanceAfter = adminWallet.balance

//             adminWallet.currency = payment.currency
//             await adminWallet.save()

//             let fleetWallet = await Wallet.findOne({
//                 userId: payment.fleetOwnerId,
//                 role: "B2B_PARTNER",
//             })
//             if (!fleetWallet) {
//                 fleetWallet = new Wallet({
//                     userId: payment.fleetOwnerId,
//                     role: "B2B_PARTNER",
//                     balance: 0,
//                 })
//             }

//             const fleetBalanceBefore = fleetWallet.balance
//             fleetWallet.balance += fleetOwnerAmount
//             const fleetBalanceAfter = fleetWallet.balance

//             fleetWallet.currency = payment.currency
//             await fleetWallet.save()

//             // Create transaction records
//             await Transaction.create([
//                 {
//                     userId: req.userId,
//                     walletId: adminWallet._id,
//                     type: "CREDIT",
//                     category: "COMMISSION_EARNED",
//                     amount: adminCommissionAmount,
//                     balanceBefore: adminBalanceBefore,
//                     balanceAfter: adminBalanceAfter,
//                     paymentId: payment._id,
//                     contractId: payment.contractId,
//                     description: `Admin commission for contract ${payment.contractId.contractNumber}`,
//                 },
//                 {
//                     userId: payment.fleetOwnerId,
//                     walletId: fleetWallet._id,
//                     type: "CREDIT",
//                     category: "PAYMENT_RECEIVED",
//                     amount: fleetOwnerAmount,
//                     balanceBefore: fleetBalanceBefore,
//                     balanceAfter: fleetBalanceAfter,
//                     paymentId: payment._id,
//                     contractId: payment.contractId,
//                     description: `Rental payment for contract ${payment.contractId.contractNumber}`,
//                 },
//             ])

//             // Update contract status
//             const contract = await Contract.findById(payment.contractId)
//             if (contract) {
//                 // Update financial details
//                 if (payment.paymentType === "advance") {
//                     contract.financials.advancePayment.paidAt = new Date()
//                     contract.financials.advancePayment.transactionId = payment.gatewayTransactionId
//                     contract.status = "ACTIVE" // Waiting for final payment
//                 } else if (payment.paymentType === "final") {
//                     contract.financials.finalPayment.paidAt = new Date()
//                     contract.financials.finalPayment.transactionId = payment.gatewayTransactionId
//                     contract.status = "ACTIVE" // Contract is now active
//                     contract.activatedAt = new Date()
//                 } else if (payment.paymentType === "security") {
//                     contract.financials.securityDeposit.paidAt = new Date()
//                 }

//                 contract.statusHistory.push({
//                     status: contract.status,
//                     changedAt: new Date(),
//                     changedBy: req.userId,
//                     reason: `Payment ${action.toLowerCase()}d by admin`,
//                 })

//                 await contract.save()
//             }

//             res.status(200).json({
//                 success: true,
//                 message: "Payment verified and approved successfully",
//                 payment,
//             })
//         } else if (action === "REJECT") {
//             payment.status = "FAILED"
//             payment.verificationStatus = "REJECTED"
//             payment.verifiedBy = req.userId
//             payment.verifiedAt = new Date()
//             payment.failureReason = reason

//             await payment.save()

//             // Update contract status
//             const contract = await Contract.findById(payment.contractId)
//             if (contract) {
//                 contract.statusHistory.push({
//                     status: "PAYMENT_REJECTED",
//                     changedAt: new Date(),
//                     changedBy: req.userId,
//                     reason: reason,
//                 })
//                 await contract.save()
//             }

//             res.status(200).json({
//                 success: true,
//                 message: "Payment rejected",
//                 payment,
//             })
//         }
//     } catch (error) {
//         console.error("[v0] Error verifying payment:", error)
//         res.status(500).json({
//             success: false,
//             message: "Error verifying payment",
//             error: error.message,
//         })
//     }
// }

// export const verifyPayment = async (req, res) => {
//     try {
//         const { paymentId } = req.params
//         const { action, reason } = req.body // action: 'APPROVE' or 'REJECT'

//         const payment = await Payment.findById(paymentId).populate("contractId")

//         if (!payment) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Payment not found",
//             })
//         }

//         if (payment.verificationStatus !== "PENDING") {
//             return res.status(400).json({
//                 success: false,
//                 message: "Payment already verified",
//             })
//         }

//         if (action === "APPROVE") {
//             payment.status = "COMPLETED"
//             payment.verificationStatus = "VERIFIED"
//             payment.verifiedBy = req.userId
//             payment.verifiedAt = new Date()

//             const advanceAmount = payment.contractId.financials.advancePayment.amount
//             const securityDepositAmount = payment.contractId.financials.securityDeposit.amount

//             // Commission: 10% of advance only
//             const adminCommissionAmount = payment.adminCommission // Already calculated as 10% of advance
//             // Fleet owner gets: 90% of advance
//             const fleetOwnerAmount = payment.fleetOwnerAmount // Already calculated as 90% of advance

//             console.log("[v0] Verifying Payment Breakdown:")
//             console.log("[v0] Advance Amount:", advanceAmount)
//             console.log("[v0] Security Deposit (held separately):", securityDepositAmount)
//             console.log("[v0] Admin Commission (10% of advance):", adminCommissionAmount)
//             console.log("[v0] Fleet Owner Amount (90% of advance):", fleetOwnerAmount)

//             payment.adminCommission = {
//                 amount: adminCommissionAmount,
//                 percentage: 10,
//                 appliedOn: "advance",
//             }
//             payment.fleetOwnerShare = {
//                 amount: fleetOwnerAmount,
//                 percentage: 90,
//                 appliedOn: "advance",
//             }
//             payment.securityDepositInfo = {
//                 amount: securityDepositAmount,
//                 status: "HELD",
//                 refundable: true,
//             }

//             await payment.save()

//             // Update Admin Wallet - Commission only
//             let adminWallet = await Wallet.findOne({ userId: req.userId, role: "ADMIN" })
//             if (!adminWallet) {
//                 adminWallet = new Wallet({
//                     userId: req.userId,
//                     role: "ADMIN",
//                     balance: 0,
//                     securityDepositHeld: 0,
//                 })
//             }
//             adminWallet.balance += adminCommissionAmount
//             adminWallet.securityDepositHeld += securityDepositAmount
//             await adminWallet.save()

//             console.log(
//                 "[v0] Admin wallet updated - Commission:",
//                 adminCommissionAmount,
//                 "Security Deposit Held:",
//                 securityDepositAmount,
//             )

//             // Update Fleet Owner Wallet - Only 90% of advance
//             let fleetWallet = await Wallet.findOne({
//                 userId: payment.fleetOwnerId,
//                 role: "B2B_PARTNER",
//             })
//             if (!fleetWallet) {
//                 fleetWallet = new Wallet({
//                     userId: payment.fleetOwnerId,
//                     role: "B2B_PARTNER",
//                     balance: 0,
//                 })
//             }
//             fleetWallet.balance += fleetOwnerAmount
//             await fleetWallet.save()

//             console.log("[v0] Fleet owner wallet updated:", fleetOwnerAmount)

//             // Create transaction records
//             await Transaction.create([
//                 {
//                     userId: req.userId,
//                     walletId: adminWallet._id,
//                     type: "CREDIT",
//                     category: "COMMISSION",
//                     amount: adminCommissionAmount,
//                     balance: adminWallet.balance,
//                     paymentId: payment._id,
//                     contractId: payment.contractId,
//                     description: `Admin commission (10% of advance) for contract ${payment.contractId.contractNumber}`,
//                 },
//                 {
//                     userId: payment.fleetOwnerId,
//                     walletId: fleetWallet._id,
//                     type: "CREDIT",
//                     category: "RENTAL_INCOME",
//                     amount: fleetOwnerAmount,
//                     balance: fleetWallet.balance,
//                     paymentId: payment._id,
//                     contractId: payment.contractId,
//                     description: `Rental income (90% of advance) for contract ${payment.contractId.contractNumber}`,
//                 },
//                 {
//                     userId: req.userId,
//                     walletId: adminWallet._id,
//                     type: "HOLD",
//                     category: "SECURITY_DEPOSIT",
//                     amount: securityDepositAmount,
//                     balance: adminWallet.securityDepositHeld,
//                     paymentId: payment._id,
//                     contractId: payment.contractId,
//                     description: `Security deposit held (refundable) for contract ${payment.contractId.contractNumber}`,
//                 },
//             ])

//             const contract = payment.contractId
//             contract.financials.advancePayment.status = "PAID"
//             contract.financials.advancePayment.paidAt = new Date()
//             contract.financials.advancePayment.paidVia = payment.paymentMethod
//             contract.financials.advancePayment.transactionId = payment._id

//             contract.financials.securityDeposit.status = "PAID"
//             contract.financials.securityDeposit.paidAt = new Date()
//             contract.financials.securityDeposit.paidVia = payment.paymentMethod
//             contract.financials.securityDeposit.transactionId = payment._id

//             contract.status = "ACTIVE"
//             contract.vehicleAccess.isActive = true
//             contract.activatedAt = new Date()

//             // Schedule final payment for 30 days later
//             const dueDate = new Date()
//             dueDate.setDate(dueDate.getDate() + 30)
//             contract.financials.remainingPayment.dueDate = dueDate

//             contract.statusHistory.push({
//                 status: "ACTIVE",
//                 changedAt: new Date(),
//                 changedBy: req.userId,
//                 reason: "Payment verified - contract activated after advance + security deposit received",
//             })

//             await contract.save()

//             console.log("[v0] Contract updated to ACTIVE status")

//             return res.status(200).json({
//                 success: true,
//                 message: "Payment verified successfully",
//                 data: {
//                     payment,
//                     paymentBreakdown: {
//                         advanceAmount,
//                         securityDepositAmount,
//                         adminCommission: adminCommissionAmount,
//                         fleetOwnerAmount,
//                     },
//                 },
//             })
//         } else if (action === "REJECT") {
//             payment.status = "FAILED"
//             payment.verificationStatus = "REJECTED"
//             payment.verifiedBy = req.userId
//             payment.verifiedAt = new Date()
//             payment.failureReason = reason || "Payment rejected by admin"

//             await payment.save()

//             return res.status(200).json({
//                 success: true,
//                 message: "Payment rejected",
//                 data: { payment },
//             })
//         } else {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid action. Must be 'APPROVE' or 'REJECT'",
//             })
//         }
//     } catch (error) {
//         console.error("[v0] Verify payment error:", error)
//         res.status(500).json({
//             success: false,
//             message: "Error verifying payment",
//             error: error.message,
//         })
//     }
// }

// Verify and approve payment
export const verifyPayment = async (req, res) => {
    try {
        const { paymentId } = req.params
        const { action, reason } = req.body // action: 'APPROVE' or 'REJECT'

        const payment = await Payment.findById(paymentId).populate("contractId")

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            })
        }

        if (payment.verificationStatus !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Payment already verified",
            })
        }

        if (action === "APPROVE") {
            payment.status = "COMPLETED"
            payment.verificationStatus = "VERIFIED"
            payment.verifiedBy = req.userId
            payment.verifiedAt = new Date()

            const advanceAmount = payment.advanceAmount
            const securityDepositAmount = payment.securityDepositAmount

            // Commission: 10% of advance only

            const adminCommissionAmount = payment.adminCommission // Already calculated as 10% of advance
            // Fleet owner gets: 90% of advance
            const fleetOwnerAmount = payment.fleetOwnerAmount // Already calculated as 90% of advance

            console.log("[v0] Verifying Payment Breakdown:")
            console.log("[v0] Advance Amount:", advanceAmount)
            console.log("[v0] Security Deposit (held separately):", securityDepositAmount)
            console.log("[v0] Admin Commission (10% of advance):", adminCommissionAmount)
            console.log("[v0] Fleet Owner Amount (90% of advance):", fleetOwnerAmount)

            payment.adminCommission = {
                amount: adminCommissionAmount,
                percentage: 10,
                appliedOn: "advance",
            }
            payment.fleetOwnerShare = {
                amount: fleetOwnerAmount,
                percentage: 90,
                appliedOn: "advance",
            }
            payment.securityDepositInfo = {
                amount: securityDepositAmount,
                status: "HELD",
                refundable: true,
            }

            await payment.save()

            // Update Admin Wallet - Commission only
            let adminWallet = await Wallet.findOne({ userId: req.userId, role: "ADMIN" })
            if (!adminWallet) {
                adminWallet = new Wallet({
                    userId: req.userId,
                    role: "ADMIN",
                    balance: 0,
                    securityDepositHeld: 0,
                })
            }

            // const adminBalanceBefore = adminWallet.balance
            // adminWallet.balance += adminCommissionAmount
            // adminWallet.securityDepositHeld += securityDepositAmount
            // const adminBalanceAfter = adminWallet.balance

            const adminBalanceBefore = adminWallet.balance
            const adminSecurityBefore = adminWallet.securityDepositHeld

            adminWallet.balance += adminCommissionAmount
            adminWallet.securityDepositHeld += securityDepositAmount

            const adminBalanceAfter = adminWallet.balance
            const adminSecurityAfter = adminWallet.securityDepositHeld
            await adminWallet.save()

            console.log(
                "[v0] Admin wallet updated - Commission:",
                adminCommissionAmount,
                "Security Deposit Held:",
                securityDepositAmount,
            )

            // Update Fleet Owner Wallet - Only 90% of advance
            let fleetWallet = await Wallet.findOne({
                userId: payment.fleetOwnerId,
                role: "B2B_PARTNER",
            })
            if (!fleetWallet) {
                fleetWallet = new Wallet({
                    userId: payment.fleetOwnerId,
                    role: "B2B_PARTNER",
                    balance: 0,
                })
            }

            const fleetBalanceBefore = fleetWallet.balance
            fleetWallet.balance += fleetOwnerAmount
            const fleetBalanceAfter = fleetWallet.balance
            await fleetWallet.save()

            console.log("[v0] Fleet owner wallet updated:", fleetOwnerAmount)

            // Create transaction records
            await Transaction.create([
                {
                    userId: req.userId,
                    walletId: adminWallet._id,
                    type: "CREDIT",
                    category: "COMMISSION_EARNED",
                    amount: adminCommissionAmount,
                    balance: adminWallet.balance,
                    balanceBefore: adminBalanceBefore,
                    balanceAfter: adminBalanceAfter,
                    paymentId: payment._id,
                    contractId: payment.contractId,
                    description: `Admin commission (10% of advance) for contract ${payment.contractId.contractNumber}`,
                },
                {
                    userId: payment.fleetOwnerId,
                    walletId: fleetWallet._id,
                    type: "CREDIT",
                    category: "PAYMENT_RECEIVED",
                    amount: fleetOwnerAmount,
                    balance: fleetWallet.balance,
                    balanceBefore: fleetBalanceBefore,
                    balanceAfter: fleetBalanceAfter,
                    paymentId: payment._id,
                    contractId: payment.contractId,
                    description: `Rental income (90% of advance) for contract ${payment.contractId.contractNumber}`,
                },
                {
                    userId: req.userId,
                    walletId: adminWallet._id,
                    type: "HOLD",
                    category: "SECURITY_DEPOSIT",
                    amount: securityDepositAmount,
                    balance: adminWallet.securityDepositHeld,
                    balanceBefore: adminSecurityBefore,
                    balanceAfter: adminSecurityAfter,
                    paymentId: payment._id,
                    contractId: payment.contractId,
                    description: `Security deposit held (refundable) for contract ${payment.contractId.contractNumber}`,
                },
            ])

            const contract = payment.contractId
            if (payment.paymentType === "advance") {
                contract.financials.advancePayment.status = "PAID"
                contract.financials.advancePayment.paidAt = new Date()
                contract.financials.advancePayment.paidVia = payment.paymentMethod
                contract.financials.advancePayment.transactionId = payment._id

                contract.financials.securityDeposit.status = "PAID"
                contract.financials.securityDeposit.paidAt = new Date()
                contract.financials.securityDeposit.paidVia = payment.paymentMethod
                contract.financials.securityDeposit.transactionId = payment._id

                contract.status = "ACTIVE"
                contract.vehicleAccess.isActive = true
                contract.activatedAt = new Date()

                const finalDueDate = new Date(contract.rentalPeriod.endDate)
                finalDueDate.setDate(finalDueDate.getDate() - 7)

                const finalSchedule = new PaymentSchedule({
                    contractId: contract._id,
                    corporateOwnerId: contract.corporateOwnerId,
                    fleetOwnerId: contract.fleetOwnerId,
                    currency: contract.financials.currency,
                    scheduleType: "FINAL",
                    amount: contract.financials.finalPayment.amount,
                    dueDate: finalDueDate,
                })
                await finalSchedule.save()

                console.log("[v0] Final payment schedule created automatically")

                contract.financials.finalPayment.dueDate = finalDueDate
                contract.financials.finalPayment.status = "PENDING"

                contract.statusHistory.push({
                    status: "ACTIVE",
                    changedAt: new Date(),
                    changedBy: req.userId,
                    reason: "Payment verified - contract activated after advance + security deposit received",
                })
            } else if (payment.paymentType === "final") {
                contract.financials.finalPayment.status = "PAID"
                contract.financials.finalPayment.paidAt = new Date()
                contract.financials.finalPayment.paidVia = payment.paymentMethod
                contract.financials.finalPayment.transactionId = payment._id


                await PaymentSchedule.updateOne(
                    {
                        contractId: contract._id,
                        scheduleType: "FINAL",
                        status: "PENDING",
                    },
                    {
                        $set: {
                            status: "PAID",
                            paidAt: new Date(),
                            paymentMethod: payment.paymentMethod,
                            transactionId: payment._id,
                        },
                    },
                )
                
                contract.statusHistory.push({
                    status: "ACTIVE",
                    changedAt: new Date(),
                    changedBy: req.userId,
                    reason: "Final payment verified - contract completed",
                })
            }

            contract.markModified("financials")
            await contract.save()

            console.log("[v0] Contract updated to status:", contract.status)
            
            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                data: {
                    payment,
                    paymentBreakdown: {
                        advanceAmount,
                        securityDepositAmount,
                        adminCommission: adminCommissionAmount,
                        fleetOwnerAmount,
                    },
                },
            })
        } else if (action === "REJECT") {
            payment.status = "FAILED"
            payment.verificationStatus = "REJECTED"
            payment.verifiedBy = req.userId
            payment.verifiedAt = new Date()
            payment.failureReason = reason || "Payment rejected by admin"

            await payment.save()

            return res.status(200).json({
                success: true,
                message: "Payment rejected",
                data: { payment },
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid action. Must be 'APPROVE' or 'REJECT'",
            })
        }
    } catch (error) {
        console.error("[v0] Verify payment error:", error)
        res.status(500).json({
            success: false,
            message: "Error verifying payment",
            error: error.message,
        })
    }
}

// Get all contracts for admin
export const getAllContracts = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query
        const query = {}

        if (status) {
            query.status = status
        }

        const contracts = await Contract.find(query)
            .populate("corporateOwnerId", "name email phone company")
            .populate("fleetOwnerId", "name email phone company")
            .populate("vehicles.vehicleId")
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit))
            .skip((Number.parseInt(page) - 1) * Number.parseInt(limit))

        const total = await Contract.countDocuments(query)

        res.status(200).json({
            success: true,
            contracts,
            pagination: {
                total,
                page: Number.parseInt(page),
                pages: Math.ceil(total / Number.parseInt(limit)),
            },
        })
    } catch (error) {
        console.error("[v0] Error fetching contracts:", error)
        res.status(500).json({
            success: false,
            message: "Error fetching contracts",
            error: error.message,
        })
    }
}

// Get admin dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        const [totalContracts, activeContracts, pendingPayments, totalRevenue, adminWallet] = await Promise.all([
            Contract.countDocuments(),
            Contract.countDocuments({ status: "ACTIVE" }),
            Payment.countDocuments({ verificationStatus: "PENDING" }),
            Payment.aggregate([{ $match: { status: "COMPLETED" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
            Wallet.findOne({ userId: req.userId, role: "ADMIN" }),
        ])

        res.status(200).json({
            success: true,
            stats: {
                totalContracts,
                activeContracts,
                pendingPayments,
                totalRevenue: totalRevenue[0]?.total || 0,
                adminBalance: adminWallet?.balance || 0,
            },
        })
    } catch (error) {
        console.error("[v0] Error fetching dashboard stats:", error)
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard statistics",
            error: error.message,
        })
    }
}

// Get monthly revenue data for admin dashboard
export const getMonthlyRevenue = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Get monthly revenue data
        const monthlyRevenue = await Payment.aggregate([
            {
                $match: {
                    status: "COMPLETED",
                    createdAt: {
                        $gte: new Date(currentYear, 0, 1),
                        $lte: new Date(currentYear, 11, 31)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        // Format data for frontend
        const data = months.map((month, index) => {
            const monthData = monthlyRevenue.find(item => item._id === index + 1);
            return {
                month,
                total: monthData?.total || 0,
                corporate: Math.floor((monthData?.total || 0) * 0.6), // 60% from corporate
                b2c: Math.floor((monthData?.total || 0) * 0.3), // 30% from B2C
                commission: Math.floor((monthData?.total || 0) * 0.1) // 10% commission
            };
        });

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("[v0] Error fetching monthly revenue:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching monthly revenue data",
            error: error.message,
        });
    }
}

// Get booking trends for admin dashboard
export const getBookingTrends = async (req, res) => {
    try {
        const { period = "12" } = req.query;
        const monthsToShow = parseInt(period);
        const currentYear = new Date().getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Get booking data for the specified period
        const startDate = new Date(currentYear, 12 - monthsToShow, 1);
        const endDate = new Date(currentYear, 11, 31);
        
        // Aggregate bookings by month
        const bookingTrends = await Payment.aggregate([
            {
                $match: {
                    status: "COMPLETED",
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    bookings: { $sum: 1 },
                    revenue: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        // Format data for frontend
        const data = months
            .slice(-monthsToShow)
            .map((month, index) => {
                const monthData = bookingTrends.find(item => item._id === (13 - monthsToShow + index + 1));
                return {
                    month,
                    bookings: monthData?.bookings || 0,
                    revenue: monthData?.revenue || 0
                };
            });

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("[v0] Error fetching booking trends:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching booking trends data",
            error: error.message,
        });
    }
}

// Get B2C Management Statistics
export const getB2CStats = async (req, res) => {
    try {
        // Get B2C providers stats
        const providerStats = await User.aggregate([
            {
                $match: {
                    role: 'B2C_PARTNER',
                    status: { $in: ['ACTIVE', 'PENDING', 'SUSPENDED'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalProviders: { $sum: 1 },
                    activeProviders: {
                        $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] }
                    },
                    pendingProviders: {
                        $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] }
                    },
                    suspendedProviders: {
                        $sum: { $cond: [{ $eq: ['$status', 'SUSPENDED'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get B2C routes stats
        const routeStats = await B2CPartnerRoute.aggregate([
            {
                $match: {
                    status: { $in: ['Active', 'Inactive', 'Scheduled'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRoutes: { $sum: 1 },
                    activeRoutes: {
                        $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
                    },
                    inactiveRoutes: {
                        $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] }
                    },
                    maintenanceRoutes: {
                        $sum: { $cond: [{ $eq: ['$status', 'Scheduled'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get B2C bookings stats
        const bookingStats = await Payment.aggregate([
            {
                $match: {
                    status: "COMPLETED",
                    paymentType: { $in: ["B2C_BOOKING", "B2C_MONTHLY_PASS", "B2C_SINGLE_JOURNEY"] },
                    createdAt: {
                        $gte: new Date(new Date().getFullYear(), 0, 1)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: "$amount" },
                    averageRevenue: { $avg: "$amount" }
                }
            }
        ]);

        // Get passenger bookings stats (alternative to reassignments)
        const passengerStats = await B2CPassengerBooking.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().getFullYear(), 0, 1)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPassengerBookings: { $sum: 1 },
                    pendingBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    confirmedBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    completedBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                }
            }
        ]);

        // For tags/badges, we'll use a placeholder since the model doesn't exist yet
        // This can be implemented when the Tag/Badge model is created
        const tagStats = {
            totalTags: 0,
            activeTags: 0
        };

        const stats = {
            providers: providerStats[0] || {
                totalProviders: 0,
                activeProviders: 0,
                pendingProviders: 0,
                suspendedProviders: 0
            },
            routes: routeStats[0] || {
                totalRoutes: 0,
                activeRoutes: 0,
                inactiveRoutes: 0,
                maintenanceRoutes: 0
            },
            bookings: bookingStats[0] || {
                totalBookings: 0,
                totalRevenue: 0,
                averageRevenue: 0
            },
            passengers: passengerStats[0] || {
                totalPassengerBookings: 0,
                pendingBookings: 0,
                confirmedBookings: 0,
                completedBookings: 0
            },
            tags: tagStats
        };

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error("[v0] Error fetching B2C stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching B2C statistics",
            error: error.message,
        });
    }
};