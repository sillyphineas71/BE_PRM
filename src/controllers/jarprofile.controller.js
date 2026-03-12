const jarProfileService = require('../services/jarprofile.service');

// UC-04: Tạo jar profile mặc định
exports.createJarProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profile_name } = req.body;

        const profile = await jarProfileService.createJarProfile(
            userId,
            profile_name || "My Profile"
        );

        res.status(201).json({
            success: true,
            message: "Jar profile created successfully",
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// UC-05: Cập nhật tỷ lệ phân bổ
exports.updateJarPercentages = async (req, res) => {
    try {
        const { profileId } = req.params;
        const { jars } = req.body; // Array: [{ jar_id, name, icon, color, percent, amount }...]

        if (!jars || !Array.isArray(jars)) {
            return res.status(400).json({
                success: false,
                message: "Invalid jars data"
            });
        }

        const updatedProfile = await jarProfileService.updateJarPercentages(profileId, jars);

        res.status(200).json({
            success: true,
            message: "Jar percentages updated successfully",
            data: updatedProfile
        });
    } catch (error) {
        if (error.message === 'INVALID_PERCENT') {
            return res.status(400).json({
                success: false,
                message: "Total percentage must equal 100%"
            });
        }
        if (error.message === 'INVALID_JAR_COUNT') {
            return res.status(400).json({
                success: false,
                message: "Must have exactly 6 jars"
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// UC-06: Kích hoạt jar profile
exports.activateJarProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profileId } = req.params;

        const activatedProfile = await jarProfileService.activateJarProfile(userId, profileId);

        res.status(200).json({
            success: true,
            message: "Jar profile activated successfully",
            data: activatedProfile
        });
    } catch (error) {
        if (error.message === 'PROFILE_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                message: "Jar profile not found"
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy profile active
exports.getActiveProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await jarProfileService.getActiveProfile(userId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "No active jar profile found"
            });
        }

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy tất cả profiles
exports.getUserProfiles = async (req, res) => {
    try {
        const userId = req.user.id;
        const profiles = await jarProfileService.getUserProfiles(userId);

        res.status(200).json({
            success: true,
            data: profiles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy danh sách jar cho dropdown (UC-09)
exports.getJarList = async (req, res) => {
    try {
        const userId = req.user.id;
        const jars = await jarProfileService.getJarList(userId);

        res.status(200).json({
            success: true,
            data: jars
        });
    } catch (error) {
        if (error.message === 'NO_ACTIVE_PROFILE') {
            return res.status(404).json({
                success: false,
                message: "No active jar profile found. Please activate a profile first."
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
