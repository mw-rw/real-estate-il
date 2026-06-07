import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hashed = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@realestate-il.com" },
    update: {},
    create: {
      email: "admin@realestate-il.com",
      name: "מנהל המערכת",
      password: hashed,
      role: "ADMIN",
    },
  });

  console.log("Created admin:", admin.email);

  // Sample owners
  const owner1 = await prisma.owner.upsert({
    where: { idNumber: "123456789" },
    update: {},
    create: {
      name: "דוד כהן",
      phone: "050-1234567",
      email: "david@example.com",
      idNumber: "123456789",
    },
  });

  const owner2 = await prisma.owner.upsert({
    where: { idNumber: "987654321" },
    update: {},
    create: {
      name: "שרה לוי",
      phone: "052-9876543",
      email: "sarah@example.com",
      idNumber: "987654321",
    },
  });

  // Sample building
  const building = await prisma.building.create({
    data: {
      name: "בניין גבעת שאול 12",
      address: "גבעת שאול 12",
      city: "תל אביב",
      floors: 8,
      units: 24,
    },
  });

  // Sample properties
  const properties = [
    { address: "רוטשילד 45, דירה 3", city: "תל אביב", neighborhood: "נווה צדק", floor: 3, type: "APARTMENT" as const, status: "AVAILABLE" as const, rooms: 3, size: 85, rentPrice: 7500, elevator: true, balcony: true, ownerId: owner1.id },
    { address: "דיזנגוף 120, דירה 8", city: "תל אביב", neighborhood: "לב העיר", floor: 4, type: "APARTMENT" as const, status: "RENTED" as const, rooms: 2.5, size: 65, rentPrice: 6500, elevator: true, ownerId: owner1.id },
    { address: "בן גוריון 7, דירה 2", city: "רמת גן", neighborhood: "קריית קריניצי", floor: 2, type: "APARTMENT" as const, status: "AVAILABLE" as const, rooms: 4, size: 110, rentPrice: 9000, parkingSpots: 1, elevator: true, balcony: true, ownerId: owner2.id },
    { address: "הרצל 88, דירת גן", city: "פתח תקווה", neighborhood: "מרכז העיר", floor: 0, type: "GARDEN_APARTMENT" as const, status: "AVAILABLE" as const, rooms: 3.5, size: 90, rentPrice: 6800, parkingSpots: 1, ownerId: owner2.id },
    { address: "ויצמן 200, דירה 15", city: "תל אביב", neighborhood: "הצפון הישן", floor: 5, type: "PENTHOUSE" as const, status: "FOR_SALE" as const, rooms: 5, size: 180, salePrice: 4500000, rentPrice: 18000, parkingSpots: 2, elevator: true, balcony: true, ownerId: owner1.id },
  ];

  for (const p of properties) {
    await prisma.property.create({ data: { ...p, buildingId: p.address.includes("גבעת שאול") ? building.id : undefined } });
  }

  // Sample tenant and lease
  const tenant = await prisma.tenant.create({
    data: { name: "משה ישראלי", phone: "054-1111111", email: "moshe@example.com", idNumber: "111111111" },
  });

  const rentedProp = await prisma.property.findFirst({ where: { status: "RENTED" } });
  if (rentedProp) {
    await prisma.lease.create({
      data: {
        propertyId: rentedProp.id,
        tenantId: tenant.id,
        startDate: new Date("2024-07-01"),
        endDate: new Date("2025-06-30"),
        monthlyRent: 6500,
        deposit: 13000,
        status: "ACTIVE",
      },
    });
  }

  // Sample lead
  await prisma.lead.create({
    data: {
      name: "נועה אברהם",
      phone: "053-2222222",
      city: "תל אביב",
      neighborhood: "הצפון",
      minRooms: 3,
      maxRooms: 4,
      minBudget: 7000,
      maxBudget: 9000,
      requireParking: true,
      rawText: "שלום, אני מחפשת דירת 3-4 חדרים בצפון תל אביב, תקציב 7000-9000 ש״ח לחודש, חייבת חניה.",
      source: "WHATSAPP",
      aiSummary: "לקוחה מחפשת דירת 3-4 חדרים בצפון תל אביב עם חניה, תקציב 7,000-9,000 ש״ח.",
      aiQuestions: ["מהו תאריך הכניסה המבוקש?", "האם נדרשת מעלית?", "האם מרוהטת?"],
      status: "NEW",
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
