import "dotenv/config";
import {
  PrismaClient,
  Role,
  UserStatus,
  KycStatus,
  RiskLevel,
  AkadType,
  AkadStatus,
  FundingStatus,
  InvestmentStatus,
  TransactionType,
  TransactionStatus,
  ProfitSharingStatus,
  NotificationType,
  FraudStatus,
  OtpPurpose,
} from "../src/generated/prisma";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT ?? "3306"),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  connectionLimit: 10,
  connectTimeout: 30000,
});

const prisma = new PrismaClient({ adapter });

function hashPassword(value: string) {
  return bcrypt.hashSync(value, 12);
}

async function main() {
  // ── System configuration defaults ──────────────────────────────────────
  const configs = [
    { key: "nisbah_investor_default", value: "40", description: "Default investor profit share (%)" },
    { key: "nisbah_umkm_default", value: "60", description: "Default UMKM profit share (%)" },
    { key: "platform_fee_rate", value: "2.5", description: "Platform fee (%)" },
    { key: "ai_score_min_threshold", value: "50", description: "Minimum AI credit score" },
    { key: "ai_model_version", value: "1.0", description: "Active XGBoost model version" },
    { key: "fraud_alert_threshold", value: "0.75", description: "Fraud probability threshold" },
    { key: "otp_expiry_seconds", value: "300", description: "OTP validity window in seconds" },
    { key: "max_investment_per_campaign", value: "0", description: "0 = unlimited" },
    { key: "min_investment_amount", value: "1000000", description: "Minimum single investment in IDR" },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, description: config.description },
      create: config,
    });
  }
  console.log("✅ System configs seeded.");

  // ── Super Admin ─────────────────────────────────────────────────────────
  const adminPhone = "08000000000";
  let adminUser = await prisma.user.findUnique({ where: { phoneNumber: adminPhone } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "admin@synergy.id",
        phoneNumber: adminPhone,
        passwordHash: hashPassword("admin123"),
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        kycStatus: KycStatus.APPROVED,
        isEmailVerified: true,
        isPhoneVerified: true,
        adminProfile: { create: { fullName: "Super Admin", isSuperAdmin: true, department: "System" } },
        wallet: { create: {} },
      },
    });
    console.log("✅ Super admin created:", adminUser.email);
  } else {
    console.log("ℹ️  Super admin already exists, skipping.");
  }

  // ── Demo Investor: Rahmat Wijaya ────────────────────────────────────────
  const investorPhone = "08222222222";
  let investorUser = await prisma.user.findUnique({ where: { phoneNumber: investorPhone } });
  if (!investorUser) {
    investorUser = await prisma.user.create({
      data: {
        email: "investor@synergy.id",
        phoneNumber: investorPhone,
        passwordHash: hashPassword("investor123"),
        role: Role.INVESTOR,
        status: UserStatus.ACTIVE,
        kycStatus: KycStatus.APPROVED,
        isEmailVerified: true,
        isPhoneVerified: true,
        investorProfile: {
          create: {
            fullName: "Rahmat Wijaya",
            dateOfBirth: new Date("1985-06-15"),
            address: "Jl. Sudirman No. 45",
            city: "Jakarta",
            province: "DKI Jakarta",
            investmentGoal: "Mendukung UMKM syariah dan mendapat imbal hasil halal",
            riskTolerance: RiskLevel.MEDIUM,
          },
        },
        wallet: {
          create: {
            balance: 250000000,
            lockedBalance: 155000000,
          },
        },
      },
    });
    console.log("✅ Demo investor created:", investorUser.email);
  } else {
    console.log("ℹ️  Demo investor already exists, skipping.");
  }

  const investorProfile = await prisma.investorProfile.findFirst({
    where: { userId: investorUser.id },
  });
  const investorWallet = await prisma.wallet.findFirst({
    where: { userId: investorUser.id },
  });

  if (!investorProfile || !investorWallet) {
    throw new Error("Investor profile or wallet not found after create.");
  }

  // ── UMKM Users & Profiles ───────────────────────────────────────────────
  const umkmData = [
    {
      phone: "08444444411",
      email: "umkm1@synergy.id",
      ownerName: "Budi Santoso",
      businessName: "Toko Sembako Berkah",
      businessCategory: "Perdagangan",
      businessDescription: "Toko sembako lengkap dengan harga terjangkau di kawasan Jakarta Pusat.",
      location: "Jl. Kramat Raya No. 55",
      city: "Jakarta",
      province: "DKI Jakarta",
      monthlyRevenue: 25000000,
      employeeCount: 4,
    },
    {
      phone: "08444444412",
      email: "kopi.nusantara@synergy.id",
      ownerName: "Sari Dewi",
      businessName: "Kopi Nusantara Mandiri",
      businessCategory: "F&B",
      businessDescription: "Kafe kopi premium dengan bahan baku lokal pilihan dari petani Aceh dan Toraja.",
      location: "Jl. Braga No. 12",
      city: "Bandung",
      province: "Jawa Barat",
      monthlyRevenue: 16000000,
      employeeCount: 6,
    },
    {
      phone: "08444444413",
      email: "peternakan.sapi@synergy.id",
      ownerName: "Hendra Kurniawan",
      businessName: "Peternakan Sapi Makmur",
      businessCategory: "Agrikultur",
      businessDescription: "Peternakan sapi potong skala menengah dengan sistem manajemen modern.",
      location: "Jl. Soekarno Hatta KM 8",
      city: "Malang",
      province: "Jawa Timur",
      monthlyRevenue: 45000000,
      employeeCount: 12,
    },
    {
      phone: "08444444414",
      email: "batik.cahaya@synergy.id",
      ownerName: "Amira Batik",
      businessName: "Batik Cahaya Jawa",
      businessCategory: "Fashion",
      businessDescription: "Produsen batik tulis premium khas Yogyakarta dengan motif tradisional.",
      location: "Jl. Malioboro No. 88",
      city: "Yogyakarta",
      province: "DIY",
      monthlyRevenue: 18000000,
      employeeCount: 8,
    },
    {
      phone: "08444444415",
      email: "konveksi.mandiri@synergy.id",
      ownerName: "Joko Prabowo",
      businessName: "Konveksi Mandiri Jaya",
      businessCategory: "Fashion",
      businessDescription: "Konveksi pakaian kerja dan seragam dengan kapasitas produksi 2000 pcs/bulan.",
      location: "Jl. Pemuda No. 22",
      city: "Semarang",
      province: "Jawa Tengah",
      monthlyRevenue: 12000000,
      employeeCount: 15,
    },
  ];

  const umkmProfiles: Array<{ userId: string; profileId: string; walletId: string; businessName: string; campaignId?: string }> = [];

  for (const d of umkmData) {
    let user = await prisma.user.findFirst({ where: { phoneNumber: d.phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: d.email,
          phoneNumber: d.phone,
          passwordHash: hashPassword("umkm123"),
          role: Role.UMKM,
          status: UserStatus.ACTIVE,
          kycStatus: KycStatus.APPROVED,
          isEmailVerified: true,
          isPhoneVerified: true,
        },
      });
      await prisma.umkmProfile.create({
        data: {
          userId: user.id,
          ownerName: d.ownerName,
          businessName: d.businessName,
          businessCategory: d.businessCategory,
          businessDescription: d.businessDescription,
          location: d.location,
          city: d.city,
          province: d.province,
          monthlyRevenue: d.monthlyRevenue,
          employeeCount: d.employeeCount,
          establishedDate: new Date("2020-01-01"),
        },
      });
      await prisma.wallet.create({ data: { userId: user.id } });
    }

    const profile = await prisma.umkmProfile.findFirst({ where: { userId: user.id } });
    const wallet = await prisma.wallet.findFirst({ where: { userId: user.id } });

    if (profile && wallet) {
      umkmProfiles.push({
        userId: user.id,
        profileId: profile.id,
        walletId: wallet.id,
        businessName: profile.businessName,
      });
    }
  }

  console.log("✅ UMKM users seeded:", umkmProfiles.map((u) => u.businessName).join(", "));

  // ── Credit Scores ──────────────────────────────────────────────────────
  const creditScoreData = [
    { idx: 0, score: 84, risk: RiskLevel.LOW },
    { idx: 1, score: 79, risk: RiskLevel.LOW },
    { idx: 2, score: 91, risk: RiskLevel.LOW },
    { idx: 3, score: 63, risk: RiskLevel.MEDIUM },
    { idx: 4, score: 44, risk: RiskLevel.HIGH },
  ];

  for (const cs of creditScoreData) {
    const profile = umkmProfiles[cs.idx];
    const existing = await prisma.creditScore.findFirst({
      where: { umkmProfileId: profile.profileId },
    });
    if (!existing) {
      await prisma.creditScore.create({
        data: {
          umkmProfileId: profile.profileId,
          score: cs.score,
          riskLevel: cs.risk,
          features: { revenue_trend: 1.2, payment_history: 0.95, collateral_ratio: 0.6 },
          insights: { key_factors: ["Histori pembayaran baik", "Omzet konsisten"] },
          recommendations: { actions: ["Pertahankan laporan keuangan rutin"] },
        },
      });
    }
  }
  console.log("✅ Credit scores seeded.");

  // ── Funding Applications & Campaigns ───────────────────────────────────
  const campaignDefs = [
    {
      profileIdx: 0,
      title: "Ekspansi Stok Sembako Berkah",
      story: "Toko Sembako Berkah membutuhkan tambahan modal untuk memperluas stok barang dan membuka cabang kedua.",
      targetAmount: 150000000,
      akadType: AkadType.MUSYARAKAH,
      durationMonths: 12,
      estimatedRoi: 9.0,
      nisbahInvestor: 40,
      nisbahUmkm: 60,
      collected: 108000000,
      investorCount: 8,
    },
    {
      profileIdx: 1,
      title: "Pengembangan Menu & Gerai Kopi",
      story: "Kopi Nusantara Mandiri ingin mengembangkan varian menu dan merenovasi gerai untuk meningkatkan kapasitas.",
      targetAmount: 100000000,
      akadType: AkadType.MURABAHAH,
      durationMonths: 6,
      estimatedRoi: 8.0,
      nisbahInvestor: 35,
      nisbahUmkm: 65,
      collected: 45000000,
      investorCount: 5,
    },
    {
      profileIdx: 2,
      title: "Peningkatan Kapasitas Peternakan",
      story: "Peternakan Sapi Makmur akan menambah 50 ekor sapi untuk meningkatkan kapasitas produksi daging.",
      targetAmount: 200000000,
      akadType: AkadType.MUSYARAKAH,
      durationMonths: 18,
      estimatedRoi: 12.5,
      nisbahInvestor: 45,
      nisbahUmkm: 55,
      collected: 170000000,
      investorCount: 20,
    },
    {
      profileIdx: 3,
      title: "Produksi Koleksi Batik Premium",
      story: "Batik Cahaya Jawa ingin memproduksi koleksi edisi khusus untuk pasar ekspor.",
      targetAmount: 80000000,
      akadType: AkadType.MUSYARAKAH,
      durationMonths: 9,
      estimatedRoi: 10.5,
      nisbahInvestor: 40,
      nisbahUmkm: 60,
      collected: 48000000,
      investorCount: 12,
    },
    {
      profileIdx: 4,
      title: "Pembelian Mesin Jahit Industrial",
      story: "Konveksi Mandiri Jaya membutuhkan mesin jahit industrial baru untuk meningkatkan kecepatan produksi.",
      targetAmount: 60000000,
      akadType: AkadType.MUSYARAKAH,
      durationMonths: 12,
      estimatedRoi: 14.5,
      nisbahInvestor: 40,
      nisbahUmkm: 60,
      collected: 9000000,
      investorCount: 2,
    },
  ];

  for (const c of campaignDefs) {
    const profile = umkmProfiles[c.profileIdx];
    const existingCampaign = await prisma.campaign.findFirst({
      where: { umkmProfileId: profile.profileId },
    });
    if (!existingCampaign) {
      const app = await prisma.fundingApplication.create({
        data: {
          umkmProfileId: profile.profileId,
          akadType: c.akadType,
          requestedAmount: c.targetAmount,
          durationMonths: c.durationMonths,
          purpose: c.story,
          status: FundingStatus.ACTIVE,
          reviewedAt: new Date("2025-12-01"),
        },
      });
      const campaign = await prisma.campaign.create({
        data: {
          umkmProfileId: profile.profileId,
          fundingApplicationId: app.id,
          title: c.title,
          story: c.story,
          targetAmount: c.targetAmount,
          collectedAmount: c.collected,
          akadType: c.akadType,
          durationMonths: c.durationMonths,
          estimatedRoi: c.estimatedRoi,
          status: FundingStatus.ACTIVE,
          startDate: new Date("2026-01-01"),
          endDate: new Date("2026-12-31"),
          investorCount: c.investorCount,
        },
      });
      profile.campaignId = campaign.id;
    } else {
      profile.campaignId = existingCampaign.id;
    }
  }
  console.log("✅ Campaigns seeded.");

  // ── Investor Transactions (initial deposits) ────────────────────────────
  const depositTxns = await prisma.transaction.findMany({
    where: {
      walletId: investorWallet.id,
      type: TransactionType.DEPOSIT,
    },
  });

  if (depositTxns.length === 0) {
    await prisma.transaction.createMany({
      data: [
        {
          walletId: investorWallet.id,
          type: TransactionType.DEPOSIT,
          amount: 200000000,
          balanceBefore: 0,
          balanceAfter: 200000000,
          status: TransactionStatus.COMPLETED,
          description: "Deposit Saldo Wallet via Bank Transfer BCA",
          reference: "DEP-038",
          processedAt: new Date("2025-12-20"),
          createdAt: new Date("2025-12-20"),
        },
        {
          walletId: investorWallet.id,
          type: TransactionType.DEPOSIT,
          amount: 100000000,
          balanceBefore: 200000000,
          balanceAfter: 300000000,
          status: TransactionStatus.COMPLETED,
          description: "Deposit Saldo Wallet via Bank Transfer Mandiri",
          reference: "DEP-041",
          processedAt: new Date("2026-01-10"),
          createdAt: new Date("2026-01-10"),
        },
        {
          walletId: investorWallet.id,
          type: TransactionType.WITHDRAWAL,
          amount: 25000000,
          balanceBefore: 300000000,
          balanceAfter: 275000000,
          status: TransactionStatus.COMPLETED,
          description: "Penarikan Dana ke Rekening BCA",
          reference: "WD-019",
          processedAt: new Date("2025-11-10"),
          createdAt: new Date("2025-11-10"),
        },
      ],
    });
  }

  // ── Investments from demo investor ─────────────────────────────────────
  const investmentDefs = [
    {
      campaignIdx: 0,
      amount: 50000000,
      status: InvestmentStatus.ONGOING,
      createdAt: new Date("2026-01-01"),
      akadNisbahInvestor: 40,
      akadNisbahUmkm: 60,
      durationMonths: 12,
    },
    {
      campaignIdx: 1,
      amount: 75000000,
      status: InvestmentStatus.ONGOING,
      createdAt: new Date("2026-01-15"),
      akadNisbahInvestor: 35,
      akadNisbahUmkm: 65,
      durationMonths: 6,
    },
    {
      campaignIdx: 2,
      amount: 30000000,
      status: InvestmentStatus.COMPLETED,
      createdAt: new Date("2025-03-01"),
      akadNisbahInvestor: 45,
      akadNisbahUmkm: 55,
      durationMonths: 12,
    },
  ];

  const investments: Array<{ id: string; campaignId: string; amount: number; akadId?: string }> = [];

  for (const def of investmentDefs) {
    const profile = umkmProfiles[def.campaignIdx];
    if (!profile.campaignId) continue;

    let inv = await prisma.investment.findFirst({
      where: {
        investorProfileId: investorProfile.id,
        campaignId: profile.campaignId,
      },
    });

    if (!inv) {
      inv = await prisma.investment.create({
        data: {
          investorProfileId: investorProfile.id,
          campaignId: profile.campaignId,
          amount: def.amount,
          akadType: campaignDefs[def.campaignIdx].akadType,
          status: def.status,
          confirmedAt: def.createdAt,
          completedAt: def.status === InvestmentStatus.COMPLETED ? new Date("2026-02-28") : null,
          createdAt: def.createdAt,
        },
      });

      // create investment transaction
      await prisma.transaction.create({
        data: {
          walletId: investorWallet.id,
          type: TransactionType.INVESTMENT,
          amount: def.amount,
          balanceBefore: investorWallet.balance,
          balanceAfter: investorWallet.balance,
          status: TransactionStatus.COMPLETED,
          description: `Investasi – ${profile.businessName}`,
          relatedEntityId: inv.id,
          relatedEntityType: "Investment",
          processedAt: def.createdAt,
          createdAt: def.createdAt,
        },
      });
    }

    // create/find akad
    let akad = await prisma.akad.findUnique({ where: { investmentId: inv.id } });
    if (!akad) {
      const startDate = def.createdAt;
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + def.durationMonths);

      akad = await prisma.akad.create({
        data: {
          campaignId: profile.campaignId,
          investmentId: inv.id,
          akadType: campaignDefs[def.campaignIdx].akadType,
          status: def.status === InvestmentStatus.COMPLETED ? AkadStatus.COMPLETED : AkadStatus.ACTIVE,
          principalAmount: def.amount,
          nisbahInvestor: def.akadNisbahInvestor,
          nisbahUmkm: def.akadNisbahUmkm,
          platformFeeRate: 2.5,
          durationMonths: def.durationMonths,
          startDate,
          endDate,
          approvedAt: startDate,
          umkmSignedAt: startDate,
          investorSignedAt: startDate,
          blockchainHash: "0x" + crypto.randomBytes(16).toString("hex"),
          contractAddress: "0x" + crypto.randomBytes(20).toString("hex"),
          blockchainStatus: "CONFIRMED",
          deployedAt: startDate,
        },
      });
    }

    investments.push({ id: inv.id, campaignId: profile.campaignId, amount: def.amount, akadId: akad.id });
  }

  // Update investor profile totals
  await prisma.investorProfile.update({
    where: { id: investorProfile.id },
    data: {
      totalInvested: 155000000,
      totalProfit: 22400000,
    },
  });

  console.log("✅ Investments & akads seeded:", investments.length, "records");

  // ── Profit Sharings ─────────────────────────────────────────────────────
  const profitSharingDefs = [
    {
      investmentIdx: 0,
      periods: [
        { start: new Date("2026-04-01"), end: new Date("2026-04-30"), due: new Date("2026-04-30"), gross: 24300000, investorShare: 3645000, umkmShare: 6075000, fee: 607500, status: ProfitSharingStatus.PAID, paidAt: new Date("2026-04-29") },
        { start: new Date("2026-05-01"), end: new Date("2026-05-31"), due: new Date("2026-05-31"), gross: 27000000, investorShare: 4050000, umkmShare: 6750000, fee: 675000, status: ProfitSharingStatus.PAID, paidAt: new Date("2026-05-28") },
        { start: new Date("2026-06-01"), end: new Date("2026-06-30"), due: new Date("2026-06-30"), gross: 25400000, investorShare: 3810000, umkmShare: 6350000, fee: 635000, status: ProfitSharingStatus.PENDING, paidAt: null },
      ],
    },
    {
      investmentIdx: 1,
      periods: [
        { start: new Date("2026-05-01"), end: new Date("2026-05-31"), due: new Date("2026-05-31"), gross: 14100000, investorShare: 2961000, umkmShare: 6909000, fee: 352500, status: ProfitSharingStatus.OVERDUE, paidAt: null },
        { start: new Date("2026-06-01"), end: new Date("2026-06-30"), due: new Date("2026-06-30"), gross: 16800000, investorShare: 3528000, umkmShare: 8232000, fee: 420000, status: ProfitSharingStatus.PENDING, paidAt: null },
      ],
    },
    {
      investmentIdx: 2,
      periods: [
        { start: new Date("2025-04-01"), end: new Date("2025-04-30"), due: new Date("2025-04-30"), gross: 40000000, investorShare: 5400000, umkmShare: 6600000, fee: 1000000, status: ProfitSharingStatus.PAID, paidAt: new Date("2025-04-28") },
        { start: new Date("2025-05-01"), end: new Date("2025-05-31"), due: new Date("2025-05-31"), gross: 42000000, investorShare: 5670000, umkmShare: 6930000, fee: 1050000, status: ProfitSharingStatus.PAID, paidAt: new Date("2025-05-30") },
      ],
    },
  ];

  for (const def of profitSharingDefs) {
    const inv = investments[def.investmentIdx];
    if (!inv || !inv.akadId) continue;

    for (const period of def.periods) {
      const existing = await prisma.profitSharing.findFirst({
        where: {
          investmentId: inv.id,
          periodStart: period.start,
        },
      });
      if (!existing) {
        const ps = await prisma.profitSharing.create({
          data: {
            akadId: inv.akadId,
            investmentId: inv.id,
            periodStart: period.start,
            periodEnd: period.end,
            dueDate: period.due,
            grossRevenue: period.gross,
            investorShare: period.investorShare,
            umkmShare: period.umkmShare,
            platformFee: period.fee,
            status: period.status,
            paidAt: period.paidAt,
          },
        });

        // create profit sharing transaction if paid
        if (period.status === ProfitSharingStatus.PAID && period.paidAt) {
          await prisma.transaction.create({
            data: {
              walletId: investorWallet.id,
              type: TransactionType.PROFIT_SHARING,
              amount: period.investorShare,
              balanceBefore: 0,
              balanceAfter: period.investorShare,
              status: TransactionStatus.COMPLETED,
              description: `Bagi Hasil – ${umkmProfiles[def.investmentIdx].businessName} (${period.start.toLocaleDateString("id-ID", { month: "long", year: "numeric" })})`,
              relatedEntityId: ps.id,
              relatedEntityType: "ProfitSharing",
              processedAt: period.paidAt,
              createdAt: period.paidAt,
            },
          });
        }
      }
    }
  }
  console.log("✅ Profit sharings seeded.");

  // ── Business Data (for monitoring) ─────────────────────────────────────
  const businessDataMonths = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
  const revenueByUmkm = [
    [18500000, 21200000, 20100000, 24300000, 27000000, 25400000],
    [12100000, 13800000, 11500000, 15200000, 14100000, 16800000],
    [38000000, 41000000, 39500000, 43200000, 45000000, 44100000],
  ];

  for (let i = 0; i < 3; i++) {
    const profile = umkmProfiles[i];
    for (let m = 0; m < 6; m++) {
      const [year, month] = businessDataMonths[m].split("-").map(Number);
      const reportDate = new Date(year, month - 1, 1);
      const existing = await prisma.businessData.findFirst({
        where: { umkmProfileId: profile.profileId, reportDate },
      });
      if (!existing) {
        const revenue = revenueByUmkm[i][m];
        await prisma.businessData.create({
          data: {
            umkmProfileId: profile.profileId,
            reportDate,
            monthlyRevenue: revenue,
            monthlyExpense: Math.round(revenue * 0.65),
            dataSource: "MANUAL",
          },
        });
      }
    }
  }
  console.log("✅ Business data seeded.");

  // ── Business Updates (monitoring feed) ────────────────────────────────
  const businessUpdateDefs = [
    {
      profileIdx: 0,
      updates: [
        {
          periodDate: new Date("2026-05-01"),
          revenue: 27000000,
          expenses: 17550000,
          fundUsageSummary: "Omzet Meningkat 12%: Bulan Mei mencatat omzet tertinggi Rp 27 Jt, didukung promosi Eid dan pelanggan tetap.",
        },
        {
          periodDate: new Date("2026-04-01"),
          revenue: 24300000,
          expenses: 15795000,
          fundUsageSummary: "Laporan Penggunaan Dana Q1: Dana digunakan untuk restocking barang pokok. Stok tersedia untuk 3 bulan ke depan.",
        },
      ],
    },
    {
      profileIdx: 1,
      updates: [
        {
          periodDate: new Date("2026-06-01"),
          revenue: 16800000,
          expenses: 10920000,
          fundUsageSummary: "Ekspansi Menu Baru: Menu es kopi premium diluncurkan, respons pasar sangat positif.",
        },
        {
          periodDate: new Date("2026-05-01"),
          revenue: 14100000,
          expenses: 9165000,
          fundUsageSummary: "Penurunan Omzet 7.6%: Terjadi penurunan karena renovasi gerai. Operasional kembali normal mulai pekan ketiga.",
        },
      ],
    },
    {
      profileIdx: 2,
      updates: [
        {
          periodDate: new Date("2026-05-01"),
          revenue: 45000000,
          expenses: 29250000,
          fundUsageSummary: "Penjualan terbaik: 12 ekor sapi berhasil dijual ke pasar regional. Target Q2 tercapai.",
        },
      ],
    },
  ];

  for (const def of businessUpdateDefs) {
    const profile = umkmProfiles[def.profileIdx];
    for (const update of def.updates) {
      const existing = await prisma.businessUpdate.findFirst({
        where: { umkmProfileId: profile.profileId, periodDate: update.periodDate },
      });
      if (!existing) {
        await prisma.businessUpdate.create({
          data: {
            umkmProfileId: profile.profileId,
            periodDate: update.periodDate,
            revenue: update.revenue,
            expenses: update.expenses,
            fundUsageSummary: update.fundUsageSummary,
          },
        });
      }
    }
  }
  console.log("✅ Business updates seeded.");

  // ── Fraud Alerts (Risk Alerts) ─────────────────────────────────────────
  const fraudAlertDefs = [
    {
      alertType: "UNUSUAL_PATTERN",
      severity: "HIGH",
      description: "Omzet UMKM Kopi Nusantara Mandiri turun 18% selama 2 bulan berturut-turut, melebihi threshold peringatan 15%.",
      status: FraudStatus.DETECTED,
      metadata: { umkmProfileId: umkmProfiles[1].profileId, umkmName: "Kopi Nusantara Mandiri", alertCategory: "Penurunan Performa" },
      recommendation: "Pertimbangkan untuk menghubungi UMKM atau meninjau keputusan investasi Anda.",
      createdAt: new Date("2026-06-02"),
    },
    {
      alertType: "MORAL_HAZARD",
      severity: "MEDIUM",
      description: "Pembayaran bagi hasil Kopi Nusantara Mandiri periode Mei 2026 melewati jatuh tempo 3 hari.",
      status: FraudStatus.DETECTED,
      metadata: { umkmProfileId: umkmProfiles[1].profileId, umkmName: "Kopi Nusantara Mandiri", alertCategory: "Keterlambatan Bagi Hasil" },
      recommendation: "Pantau status pembayaran di halaman Profit Sharing.",
      createdAt: new Date("2026-06-01"),
    },
    {
      alertType: "ANOMALY",
      severity: "LOW",
      description: "Terdapat lonjakan omzet 40% pada Toko Sembako Berkah dalam satu minggu — terindikasi promosi musiman, bukan fraud.",
      status: FraudStatus.CONFIRMED,
      metadata: { umkmProfileId: umkmProfiles[0].profileId, umkmName: "Toko Sembako Berkah", alertCategory: "Laporan Omzet Anomali" },
      recommendation: "Lonjakan telah dikonfirmasi sebagai dampak promosi Eid. Tidak ada tindakan diperlukan.",
      createdAt: new Date("2026-05-15"),
    },
  ];

  for (const def of fraudAlertDefs) {
    const existing = await prisma.fraudAlert.findFirst({
      where: { description: def.description },
    });
    if (!existing) {
      await prisma.fraudAlert.create({
        data: {
          alertType: def.alertType,
          severity: def.severity,
          description: def.description,
          status: def.status,
          metadata: def.metadata,
          createdAt: def.createdAt,
        },
      });
    }
  }
  console.log("✅ Fraud alerts seeded.");

  // ── Notifications for investor ──────────────────────────────────────────
  const notifDefs = [
    {
      type: NotificationType.PROFIT_SHARING,
      title: "Bagi Hasil Diterima",
      message: "Bagi hasil periode Mei 2026 dari Toko Sembako Berkah sebesar Rp 4.050.000 telah masuk ke wallet Anda.",
      createdAt: new Date("2026-05-28"),
    },
    {
      type: NotificationType.RISK_ALERT,
      title: "Peringatan Risiko UMKM",
      message: "UMKM Kopi Nusantara Mandiri mengalami penurunan omzet 18%. Pantau sekarang di halaman Risk & Alert.",
      createdAt: new Date("2026-06-02"),
    },
    {
      type: NotificationType.AKAD,
      title: "Akad Siap Ditandatangani",
      message: "Akad investasi baru untuk Batik Cahaya Jawa siap untuk ditandatangani secara digital.",
      createdAt: new Date("2026-06-01"),
    },
    {
      type: NotificationType.INVESTMENT,
      title: "Investasi Dikonfirmasi",
      message: "Investasi Rp 75.000.000 ke Kopi Nusantara Mandiri telah dikonfirmasi dan akad sedang diproses.",
      createdAt: new Date("2026-01-15"),
    },
  ];

  const existingNotifs = await prisma.notification.count({
    where: { userId: investorUser.id },
  });

  if (existingNotifs === 0) {
    for (const n of notifDefs) {
      await prisma.notification.create({
        data: {
          userId: investorUser.id,
          type: n.type,
          title: n.title,
          message: n.message,
          createdAt: n.createdAt,
        },
      });
    }
    console.log("✅ Notifications seeded.");
  } else {
    console.log("ℹ️  Notifications already exist, skipping.");
  }

  // ── OTP for demo (fixed 123456 for testing) ────────────────────────────
  await prisma.otpVerification.deleteMany({
    where: { userId: investorUser.id, isUsed: false },
  });

  await prisma.otpVerification.create({
    data: {
      userId: investorUser.id,
      otp: "123456",
      purpose: OtpPurpose.LOGIN,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("✅ Demo OTP seeded (use 123456 with phone 08222222222).");

  // ── Berita / News Articles ─────────────────────────────────────────────
  const adminUserForBerita = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (adminUserForBerita) {
    const beritaData = [
      {
        title: "SYNERGY Raih Pendanaan PKM-KC 2026 dari Kemendikbudristek",
        slug: "synergy-raih-pendanaan-pkm-kc-2026",
        excerpt: "Tim SYNERGY dari Universitas Muhammadiyah Yogyakarta berhasil lolos seleksi dan mendapatkan pendanaan Program Kreativitas Mahasiswa skema Karsa Cipta tahun 2026.",
        content: `<p>Tim SYNERGY dari Universitas Muhammadiyah Yogyakarta (UMY) berhasil meraih pendanaan bergengsi dari Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (Kemendikbudristek) melalui Program Kreativitas Mahasiswa (PKM) skema Karsa Cipta 2026.</p>
<p>Proposal inovatif mereka yang menggabungkan teknologi Blockchain Hyperledger Fabric dan Kecerdasan Buatan berbasis XGBoost untuk pembiayaan UMKM syariah dinilai memiliki dampak signifikan terhadap inklusi keuangan di Indonesia.</p>
<p>"Kami sangat bersyukur dan bangga. Ini adalah bukti bahwa mahasiswa Indonesia mampu berinovasi di bidang fintech syariah yang belum banyak disentuh," ujar Muhammad Abid Yasir selaku Project Leader.</p>
<p>SYNERGY hadir sebagai solusi atas kesenjangan pembiayaan UMKM yang mencapai Rp 2.400 triliun, dengan pendekatan yang inklusif, transparan, dan sesuai prinsip Islam.</p>`,
        category: "Prestasi",
        isPublished: true,
        publishedAt: new Date("2026-03-15"),
        coverImage: null,
      },
      {
        title: "Mengenal Akad Musyarakah dalam Platform SYNERGY",
        slug: "mengenal-akad-musyarakah-platform-synergy",
        excerpt: "Akad Musyarakah menjadi pondasi utama transaksi di SYNERGY. Pelajari bagaimana sistem ini memastikan keadilan bagi investor dan UMKM secara bersamaan.",
        content: `<p>Dalam ekosistem SYNERGY, akad Musyarakah menjadi salah satu mekanisme utama yang menghubungkan investor dengan pelaku UMKM. Berbeda dengan sistem bunga konvensional, Musyarakah berbasis pada prinsip bagi hasil (profit sharing).</p>
<p>Pada akad ini, investor dan UMKM sepakat untuk berbagi keuntungan maupun risiko secara proporsional sesuai dengan nisbah yang telah disepakati di awal. Seluruh kesepakatan ini dicatat secara otomatis ke dalam Blockchain Hyperledger Fabric, sehingga tidak dapat diubah atau dimanipulasi.</p>
<p><strong>Keunggulan Musyarakah di SYNERGY:</strong></p>
<ul>
<li>Nisbah bagi hasil yang transparan dan adil</li>
<li>Kontrak digital yang tercatat di blockchain</li>
<li>Pemantauan real-time melalui dashboard investor</li>
<li>Sesuai dengan fatwa DSN-MUI tentang pembiayaan syariah</li>
</ul>
<p>Dengan teknologi AI XGBoost, SYNERGY juga mampu menilai kelayakan UMKM secara objektif sebelum akad ditandatangani, meminimalkan risiko moral hazard.</p>`,
        category: "Edukasi",
        isPublished: true,
        publishedAt: new Date("2026-04-02"),
        coverImage: null,
      },
      {
        title: "Hyperledger Fabric: Tulang Punggung Transparansi SYNERGY",
        slug: "hyperledger-fabric-transparansi-synergy",
        excerpt: "Hyperledger Fabric dipilih sebagai infrastruktur blockchain SYNERGY karena kemampuannya dalam menangani transaksi privat dan permissioned dalam skala enterprise.",
        content: `<p>Dalam membangun ekosistem keuangan syariah yang transparan, Tim SYNERGY memilih Hyperledger Fabric sebagai infrastruktur blockchain utama. Pilihan ini bukan tanpa alasan — Hyperledger Fabric dirancang khusus untuk kebutuhan enterprise dengan mekanisme permissioned (terbatas pada pihak yang berwenang).</p>
<p>Berbeda dengan blockchain publik seperti Ethereum, Hyperledger Fabric memungkinkan:</p>
<ul>
<li><strong>Privasi transaksi</strong>: Hanya pihak yang terlibat dalam akad yang dapat melihat detail transaksi</li>
<li><strong>Throughput tinggi</strong>: Mendukung ribuan transaksi per detik tanpa biaya gas</li>
<li><strong>Smart Contract (Chaincode)</strong>: Ditulis dalam bahasa Golang untuk efisiensi dan keamanan</li>
<li><strong>Immutability</strong>: Setiap transaksi yang tercatat tidak dapat diubah atau dihapus</li>
</ul>
<p>Dengan Hyperledger Fabric, SYNERGY mampu memberikan jaminan transparansi penuh kepada investor bahwa dana mereka dikelola sesuai akad yang disepakati.</p>`,
        category: "Teknologi",
        isPublished: true,
        publishedAt: new Date("2026-04-18"),
        coverImage: null,
      },
      {
        title: "XGBoost AI: Cara SYNERGY Menilai Kelayakan UMKM Tanpa Riwayat Bank",
        slug: "xgboost-ai-menilai-kelayakan-umkm",
        excerpt: "Lebih dari 64 juta UMKM Indonesia tidak memiliki riwayat kredit bank. SYNERGY menggunakan XGBoost AI untuk menilai kelayakan mereka secara objektif dan akurat.",
        content: `<p>Salah satu tantangan terbesar dalam pembiayaan UMKM adalah ketiadaan riwayat kredit formal. Pelaku UMKM yang selama ini mengandalkan modal sendiri atau pinjaman informal tidak memiliki "credit score" yang diakui lembaga keuangan konvensional.</p>
<p>SYNERGY menjawab tantangan ini dengan mengintegrasikan model Kecerdasan Buatan berbasis Extreme Gradient Boosting (XGBoost) yang dikembangkan menggunakan Python.</p>
<p><strong>Fitur yang dianalisis XGBoost SYNERGY:</strong></p>
<ul>
<li>Data arus kas harian dan bulanan</li>
<li>Historis pembayaran (jika ada)</li>
<li>Konsumsi listrik sebagai indikator aktivitas bisnis</li>
<li>Rasio pendapatan terhadap pengeluaran</li>
<li>Kategori dan jenis usaha</li>
</ul>
<p>Hasilnya adalah skor kelayakan 0–100 beserta rekomendasi tindakan yang dapat dipahami oleh admin dan investor tanpa membutuhkan keahlian teknis statistik.</p>
<p>Dengan akurasi model mencapai lebih dari 87% dalam uji validasi, SYNERGY mampu memberikan penilaian yang lebih adil dibandingkan metode konvensional.</p>`,
        category: "Teknologi",
        isPublished: true,
        publishedAt: new Date("2026-05-05"),
        coverImage: null,
      },
      {
        title: "5 UMKM Pertama Berhasil Mendapat Pembiayaan Syariah Melalui SYNERGY",
        slug: "5-umkm-pertama-pembiayaan-syariah-synergy",
        excerpt: "Sebagai milestone bersejarah, lima UMKM dari berbagai sektor berhasil mendapat pembiayaan perdana melalui platform SYNERGY dalam tahap uji coba terbatas.",
        content: `<p>Merupakan pencapaian bersejarah bagi Tim SYNERGY ketika lima UMKM pertama berhasil mendapatkan pembiayaan melalui platform dalam sesi uji coba terbatas (closed beta).</p>
<p>Kelima UMKM tersebut berasal dari sektor yang beragam: perdagangan sembako, F&B kopi premium, peternakan sapi, fashion batik, dan konveksi pakaian kerja. Total pembiayaan yang berhasil disalurkan mencapai Rp 590 juta dengan 47 investor terdaftar.</p>
<p><strong>Proses pembiayaan berlangsung dalam beberapa tahap:</strong></p>
<ol>
<li>Pendaftaran dan verifikasi KYC digital</li>
<li>Penilaian kelayakan oleh AI XGBoost</li>
<li>Review dan approval oleh admin</li>
<li>Pembuatan kampanye investasi</li>
<li>Penandatanganan akad digital di blockchain</li>
<li>Disbursement dana ke wallet UMKM</li>
</ol>
<p>Seluruh proses ini berlangsung dalam waktu kurang dari 3 hari kerja — jauh lebih cepat dibandingkan proses pinjaman bank konvensional yang bisa memakan waktu berminggu-minggu.</p>`,
        category: "Berita",
        isPublished: true,
        publishedAt: new Date("2026-05-20"),
        coverImage: null,
      },
      {
        title: "Kolaborasi SYNERGY dengan Komunitas UMKM Yogyakarta",
        slug: "kolaborasi-synergy-komunitas-umkm-yogyakarta",
        excerpt: "Tim SYNERGY melakukan kunjungan dan sosialisasi kepada pelaku UMKM di Yogyakarta untuk memperkenalkan konsep pembiayaan syariah berbasis teknologi.",
        content: `<p>Dalam rangka memperluas jangkauan dan memastikan relevansi produk, Tim SYNERGY melakukan serangkaian kunjungan ke komunitas UMKM di Daerah Istimewa Yogyakarta.</p>
<p>Kegiatan sosialisasi ini bertujuan untuk memperkenalkan konsep pembiayaan syariah yang berbeda dari bunga bank konvensional, sekaligus mendemonstrasikan cara kerja platform SYNERGY kepada calon pengguna nyata.</p>
<p>"Respons dari para pelaku UMKM sangat positif. Banyak yang tertarik karena prinsip bagi hasil dinilai lebih adil dan sesuai dengan nilai-nilai yang mereka pegang," cerita Nandyra Dwi Azzahra, anggota tim yang bertanggung jawab atas aspek Ekonomi Syariah.</p>
<p>Ke depan, SYNERGY berencana untuk memperluas jangkauan ke kota-kota lain di Jawa, sebelum akhirnya scale up ke tingkat nasional setelah proses inkubasi PKM-KC 2026 selesai.</p>`,
        category: "Kegiatan",
        isPublished: false,
        publishedAt: null,
        coverImage: null,
      },
    ];

    for (const berita of beritaData) {
      const existing = await prisma.berita.findFirst({ where: { slug: berita.slug } });
      if (!existing) {
        await prisma.berita.create({
          data: {
            ...berita,
            authorId: adminUserForBerita.id,
          },
        });
      }
    }
    console.log("✅ Berita (news) seeded:", beritaData.length, "articles.");
  }

  console.log("\n🎉 Seeding complete!");
  console.log("   Investor login: 08222222222  OTP: 123456");
  console.log("   Admin login:    08000000000  OTP: any 6 digits");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
