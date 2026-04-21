// ─── Database Seed ───
// Creates an admin user and sample data for demo/testing

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── 1. Create Admin User ───
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@trustfund.pk" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@trustfund.pk",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user: ${admin.email} (password: admin123)`);

  // ─── 2. Create Sample NGO User ───
  const ngoPassword = await bcrypt.hash("ngo123", 12);
  const ngoUser = await prisma.user.upsert({
    where: { email: "ngo@trustfund.pk" },
    update: {},
    create: {
      name: "Green Foundation",
      email: "ngo@trustfund.pk",
      password: ngoPassword,
      role: "NGO",
    },
  });

  await prisma.nGOProfile.upsert({
    where: { userId: ngoUser.id },
    update: {},
    create: {
      userId: ngoUser.id,
      organizationName: "Green Foundation Pakistan",
      registrationNumber: "NGO-2024-00123",
      status: "APPROVED",
    },
  });
  console.log(`✅ NGO user: ${ngoUser.email} (password: ngo123)`);

  // ─── 3. Create Sample Donor User ───
  const donorPassword = await bcrypt.hash("donor123", 12);
  const donor = await prisma.user.upsert({
    where: { email: "donor@trustfund.pk" },
    update: {},
    create: {
      name: "Ali Ahmed",
      email: "donor@trustfund.pk",
      password: donorPassword,
      role: "USER",
    },
  });
  console.log(`✅ Donor user: ${donor.email} (password: donor123)`);

  // ─── 4. Create Sample Campaign ───
  const campaign = await prisma.campaign.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Clean Water for Thar Village",
      description:
        "This campaign aims to install water purification systems in 5 villages of Thar Desert, Sindh. Over 2,000 families will benefit from clean drinking water, reducing waterborne diseases by an estimated 60%.",
      goalAmount: 500000,
      currentAmount: 75000,
      deadline: new Date("2026-12-31"),
      status: "VERIFIED",
      userId: donor.id,
    },
  });
  console.log(`✅ Sample campaign: "${campaign.title}"`);

  // ─── 5. Create Sample Donation ───
  await prisma.donation.upsert({
    where: { transactionId: "TF-SEED0001" },
    update: {},
    create: {
      campaignId: campaign.id,
      userId: donor.id,
      amount: 5000,
      message: "Keep up the great work!",
      isAnonymous: false,
      transactionId: "TF-SEED0001",
    },
  });
  console.log(`✅ Sample donation: PKR 5,000`);

  console.log("\n🎉 Seeding complete!\n");
  console.log("─────────────────────────────────────");
  console.log("Demo Accounts:");
  console.log("  Admin  → admin@trustfund.pk / admin123");
  console.log("  NGO    → ngo@trustfund.pk   / ngo123");
  console.log("  User   → donor@trustfund.pk / donor123");
  console.log("─────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
