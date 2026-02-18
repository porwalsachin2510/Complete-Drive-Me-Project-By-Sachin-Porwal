import User from "../models/User.js"

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password")

        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            users,
            total: users.length,
        })
    } catch (error) {
        console.error("Get users error:", error)
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            user: user.toJSON(),
        })
    } catch (error) {
        console.error("Get current user error:", error)
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId
        const allowedFields = [
            "fullName", "whatsappNumber", "companyName", "companyAddress",
            "serviceType", "yearsOfExperience", "serviceDescription",
            "address", "city", "country", "profileImage"
        ]

        const updateData = {}
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field]
            }
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password")

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        })
    } catch (error) {
        console.error("Update profile error:", error)
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
