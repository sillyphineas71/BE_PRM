const IncomeEvent = require("../models/IncomeEvent");
const JarLedger = require("../models/JarLedger");
const JarProfile = require("../models/JarProfile");
const snapshotService = require("./snapshot.service");

exports.addIncome = async (userId, incomeData) => {
  const { amount, source, note, received_at } = incomeData;

  // 1. Fetch active jar profile
  const activeProfile = await JarProfile.findOne({ user_id: userId, is_active: true });
  if (!activeProfile) {
    throw new Error("400: Không tìm thấy profile lọ nào đang active. Vui lòng tạo profile trước.");
  }

  // 2. Calculate allocation into 6 jars based on percent
  // Assuming jars have { name: "Nhu cầu thiết yếu", percent: 55 }
  // To avoid precision issues, calculate each and put remaining into the biggest jar if needed, 
  // but for simplicity, we do standard Math.floor or Math.round
  let remainingAmount = amount;
  let maxPercentJarIndex = 0;
  
  const allocations = activeProfile.jars.map((jar, index) => {
    if (jar.percent > activeProfile.jars[maxPercentJarIndex].percent) {
      maxPercentJarIndex = index;
    }
    const allocatedAmount = Math.floor((amount * jar.percent) / 100);
    remainingAmount -= allocatedAmount;
    
    return {
      jar_key: jar.name, // Using name as jar_key
      percent: jar.percent,
      amount: allocatedAmount
    };
  });

  // Attach any rounding difference to the jar with the highest percentage
  if (remainingAmount !== 0 && allocations.length > 0) {
    allocations[maxPercentJarIndex].amount += remainingAmount;
  }

  // 3. Create IncomeEvent
  const incomeEvent = new IncomeEvent({
    user_id: userId,
    jar_profile_id: activeProfile._id,
    amount: amount,
    currency: "VND", // Assuming standard currency or fetch from user
    source: source || "Other",
    note: note || "",
    received_at: received_at ? new Date(received_at) : new Date(),
    allocations: allocations
  });
  
  const savedIncome = await incomeEvent.save();

  // 4. Create 6 JarLedger entries
  const ledgersToInsert = allocations.map(allocation => ({
    user_id: userId,
    jar_key: allocation.jar_key,
    delta: allocation.amount, // positive delta for income
    ref_type: "IncomeEvent",
    ref_id: savedIncome._id,
    occurred_at: savedIncome.received_at
  }));

  await JarLedger.insertMany(ledgersToInsert);

  // 5. Trigger snapshot rebuild (For the month of the income)
  const monthStr = savedIncome.received_at.toISOString().slice(0, 7); // YYYY-MM
  await snapshotService.rebuildSnapshot(userId, monthStr);

  return savedIncome;
};

exports.getIncomeHistory = async (userId, filters) => {
  const query = { user_id: userId };
  
  if (filters.month) {
    // format YYYY-MM expected
    const startOfMonth = new Date(`${filters.month}-01T00:00:00.000Z`);
    // next month start
    const nextMonthObj = new Date(startOfMonth);
    nextMonthObj.setMonth(nextMonthObj.getMonth() + 1);
    
    query.received_at = {
      $gte: startOfMonth,
      $lt: nextMonthObj
    };
  }

  const events = await IncomeEvent.find(query)
                                  .sort({ received_at: -1 })
                                  .populate('jar_profile_id', 'profile_name');
  
  return events;
};
