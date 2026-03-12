const JarProfile = require("../models/JarProfile");

// 6 lọ mặc định
const DEFAULT_JARS = [
  {
    name: "Nhu cầu thiết yếu",
    icon: "shopping_bag",
    color: "#F97316",
    percent: 55,
  },
  { name: "Giáo dục", icon: "school", color: "#3B82F6", percent: 10 },
  { name: "Giải trí", icon: "celebration", color: "#EC4899", percent: 10 },
  {
    name: "Tiết kiệm dài hạn",
    icon: "piggy_bank",
    color: "#10B981",
    percent: 10,
  },
  {
    name: "Tự do tài chính",
    icon: "trending_up",
    color: "#F59E0B",
    percent: 10,
  },
  { name: "Cho đi", icon: "favorite", color: "#EF4444", percent: 5 },
];

// UC-04: Tạo jar profile mặc định (6 lọ)
const createJarProfile = async (userId, profileName = "Default Profile") => {
  try {
    // Kiểm tra user đã có jar profile nào chưa
    const existingProfiles = await JarProfile.find({ user_id: userId });

    // Nếu chưa có profile nào, tự động kích hoạt profile mới
    const isActive = existingProfiles.length === 0;

    const newProfile = new JarProfile({
      user_id: userId,
      profile_name: profileName,
      is_active: isActive,
      jars: DEFAULT_JARS.map((jar) => ({
        name: jar.name,
        icon: jar.icon,
        color: jar.color,
        percent: jar.percent,
        amount: 0,
      })),
    });

    return await newProfile.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

// UC-05: Cập nhật tỷ lệ phân bổ của jar profile
const updateJarPercentages = async (profileId, jarsData) => {
  try {
    // Validate: Tổng % phải = 100
    const totalPercent = jarsData.reduce((sum, jar) => sum + jar.percent, 0);
    if (totalPercent !== 100) {
      throw new Error("INVALID_PERCENT");
    }

    // Kiểm tra số lượng jar có khớp không (phải là 6 lọ)
    if (jarsData.length !== 6) {
      throw new Error("INVALID_JAR_COUNT");
    }

    // Cập nhật từng jar
    const updatedProfile = await JarProfile.findByIdAndUpdate(
      profileId,
      {
        jars: jarsData.map((jarData, index) => ({
          name: jarsData[index].name || DEFAULT_JARS[index].name,
          icon: jarsData[index].icon || DEFAULT_JARS[index].icon,
          color: jarsData[index].color || DEFAULT_JARS[index].color,
          percent: jarData.percent,
          amount: jarsData[index].amount || 0,
        })),
        updated_at: Date.now(),
      },
      { new: true },
    );

    return updatedProfile;
  } catch (error) {
    throw new Error(error.message);
  }
};

// UC-06: Kích hoạt jar profile (chỉ cho phép 1 profile active tại 1 thời điểm)
const activateJarProfile = async (userId, profileId) => {
  try {
    // Kiểm tra profile tồn tại và thuộc về user này
    const profile = await JarProfile.findById(profileId);
    if (!profile || profile.user_id.toString() !== userId.toString()) {
      throw new Error("PROFILE_NOT_FOUND");
    }

    // Deactivate tất cả profile khác của user này
    await JarProfile.updateMany(
      { user_id: userId, _id: { $ne: profileId } },
      { is_active: false },
    );

    // Activate profile này
    const updatedProfile = await JarProfile.findByIdAndUpdate(
      profileId,
      { is_active: true, updated_at: Date.now() },
      { new: true },
    );

    return updatedProfile;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Lấy profile active của user
const getActiveProfile = async (userId) => {
  try {
    return await JarProfile.findOne({ user_id: userId, is_active: true });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Lấy tất cả profiles của user
const getUserProfiles = async (userId) => {
  try {
    return await JarProfile.find({ user_id: userId });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Lấy danh sách jar từ active profile (cho dropdown UC-09)
const getJarList = async (userId) => {
  try {
    const activeProfile = await JarProfile.findOne({ user_id: userId, is_active: true });
    if (!activeProfile) {
      throw new Error("NO_ACTIVE_PROFILE");
    }
    return activeProfile.jars.map((jar) => ({
      jar_key: jar.name,
      name: jar.name,
      icon: jar.icon,
      color: jar.color,
      percent: jar.percent,
    }));
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createJarProfile,
  updateJarPercentages,
  activateJarProfile,
  getActiveProfile,
  getUserProfiles,
  getJarList,
};
