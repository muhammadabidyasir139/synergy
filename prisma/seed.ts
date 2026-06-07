import "dotenv/config";
import { PrismaClient, Role, UserStatus, KycStatus } from "../src/generated/prisma";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import crypto from "crypto";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT ?? "3306"),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function main() {
  // ── System configuration defaults ──────────────────────────────────────────
  const configs = [
    { key: "nisbah_investor_default", value: "40", description: "Default investor profit share (%)" },
    { key: "nisbah_umkm_default", value: "60", description: "Default UMKM profit share (%)" },
    { key: "platform_fee_rate", value: "2.5", description: "Platform fee charged on each profit sharing period (%)" },
    { key: "ai_score_min_threshold", value: "50", description: "Minimum AI credit score for a UMKM to submit funding application" },
    { key: "ai_model_version", value: "1.0", description: "Active XGBoost model version" },
    { key: "fraud_alert_threshold", value: "0.75", description: "Probability threshold above which a transaction is auto-flagged" },
    { key: "otp_expiry_seconds", value: "300", description: "OTP validity window in seconds" },
    { key: "max_investment_per_campaign", value: "0", description: "0 = unlimited" },
    { key: "min_investment_amount", value: "100000", description: "Minimum single investment in IDR" },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, description: config.description },
      create: config,
    });
  }

  // ── Seed super-admin ────────────────────────────────────────────────────────
  const adminPhone = "08000000000";
  let adminUser = await prisma.user.findUnique({ where: { phoneNumber: adminPhone } });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "admin@synergy.id",
        phoneNumber: adminPhone,
        passwordHash: sha256("admin123"),
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        kycStatus: KycStatus.APPROVED,
        isEmailVerified: true,
        isPhoneVerified: true,
        adminProfile: {
          create: {
            fullName: "Super Admin",
            isSuperAdmin: true,
            department: "System",
          },
        },
        wallet: { create: {} },
      },
    });
    console.log("Super admin created:", adminUser.email);
  } else {
    console.log("Super admin already exists, skipping.");
  }

  // ── Seed demo UMKM ─────────────────────────────────────────────────────────
  const umkmPhone = "08111111111";
  let umkmUser = await prisma.user.findUnique({ where: { phoneNumber: umkmPhone } });

  if (!umkmUser) {
    umkmUser = await prisma.user.create({
      data: {
        email: "umkm@synergy.id",
        phoneNumber: umkmPhone,
        passwordHash: sha256("umkm123"),
        role: Role.UMKM,
        status: UserStatus.ACTIVE,
        kycStatus: KycStatus.APPROVED,
        isEmailVerified: true,
        isPhoneVerified: true,
        umkmProfile: {
          create: {
            ownerName: "Budi Santoso",
            businessName: "Warung Makan Bu Budi",
            businessCategory: "Kuliner",
            businessDescription: "Warung makan sederhana yang menyajikan masakan rumahan khas Jawa.",
            location: "Jl. Kebon Jeruk No. 12",
            city: "Jakarta Barat",
            province: "DKI Jakarta",
            employeeCount: 5,
          },
        },
        wallet: { create: {} },
      },
    });
    console.log("Demo UMKM created:", umkmUser.email);
  } else {
    console.log("Demo UMKM already exists, skipping.");
  }

  // ── Seed demo Investor ──────────────────────────────────────────────────────
  const investorPhone = "08222222222";
  let investorUser = await prisma.user.findUnique({ where: { phoneNumber: investorPhone } });

  if (!investorUser) {
    investorUser = await prisma.user.create({
      data: {
        email: "investor@synergy.id",
        phoneNumber: investorPhone,
        passwordHash: sha256("investor123"),
        role: Role.INVESTOR,
        status: UserStatus.ACTIVE,
        kycStatus: KycStatus.APPROVED,
        isEmailVerified: true,
        isPhoneVerified: true,
        investorProfile: {
          create: {
            fullName: "Siti Rahayu",
            city: "Surabaya",
            province: "Jawa Timur",
            investmentGoal: "Mendukung UMKM lokal sekaligus mendapat imbal hasil halal.",
          },
        },
        wallet: { create: {} },
      },
    });
    console.log("Demo Investor created:", investorUser.email);
  } else {
    console.log("Demo Investor already exists, skipping.");
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
