import { PrismaClient } from "@prisma/client"
import { hashPassword } from "../src/lib/auth"
import { generatePatientId } from "../src/lib/utils"

const prisma = new PrismaClient()

async function main() {
  // ── Users ──
  const admin = await prisma.user.upsert({
    where: { email: "admin@medicore.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@medicore.com",
      password: hashPassword("admin123"),
      role: "ADMIN",
    },
  })

  const doctor = await prisma.user.upsert({
    where: { email: "doctor@medicore.com" },
    update: {},
    create: {
      name: "Dr. Arjun Mehta",
      email: "doctor@medicore.com",
      password: hashPassword("doctor123"),
      role: "DOCTOR",
    },
  })

  const nurse = await prisma.user.upsert({
    where: { email: "nurse@medicore.com" },
    update: {},
    create: {
      name: "Nurse Priya",
      email: "nurse@medicore.com",
      password: hashPassword("nurse123"),
      role: "NURSE",
    },
  })

  const receptionist = await prisma.user.upsert({
    where: { email: "reception@medicore.com" },
    update: {},
    create: {
      name: "Receptionist Rahul",
      email: "reception@medicore.com",
      password: hashPassword("reception123"),
      role: "RECEPTIONIST",
    },
  })

  const pharmacist = await prisma.user.upsert({
    where: { email: "pharmacist@medicore.com" },
    update: {},
    create: {
      name: "Pharmacist Sneha",
      email: "pharmacist@medicore.com",
      password: hashPassword("pharmacist123"),
      role: "PHARMACIST",
    },
  })

  const accountant = await prisma.user.upsert({
    where: { email: "accountant@medicore.com" },
    update: {},
    create: {
      name: "Accountant Vikram",
      email: "accountant@medicore.com",
      password: hashPassword("accountant123"),
      role: "ACCOUNTANT",
    },
  })

  const labTech = await prisma.user.upsert({
    where: { email: "labtech@medicore.com" },
    update: {},
    create: {
      name: "Lab Technician Anita",
      email: "labtech@medicore.com",
      password: hashPassword("labtech123"),
      role: "LAB_TECHNICIAN",
    },
  })

  // Second doctor
  const doctor2 = await prisma.user.upsert({
    where: { email: "dr.patel@medicore.com" },
    update: {},
    create: {
      name: "Dr. Priya Patel",
      email: "dr.patel@medicore.com",
      password: hashPassword("doctor123"),
      role: "DOCTOR",
    },
  })

  // ── Doctor Profiles ──
  await prisma.doctor.upsert({
    where: { licenseNumber: "LIC-001" },
    update: {},
    create: {
      userId: doctor.id,
      specialization: "Cardiology",
      qualification: "MD, DM Cardiology",
      licenseNumber: "LIC-001",
      fee: 500,
      experience: 12,
      availableDays: "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY",
      availableTimeStart: "09:00",
      availableTimeEnd: "17:00",
    },
  })

  await prisma.doctor.upsert({
    where: { licenseNumber: "LIC-002" },
    update: {},
    create: {
      userId: doctor2.id,
      specialization: "Pediatrics",
      qualification: "MD Pediatrics",
      licenseNumber: "LIC-002",
      fee: 400,
      experience: 8,
    },
  })

  // ── Lab Tests ──
  await prisma.labTest.deleteMany()
  await prisma.labTest.createMany({
    data: [
      { name: "Complete Blood Count (CBC)", category: "Hematology", price: 200 },
      { name: "Blood Sugar Fasting", category: "Biochemistry", price: 150 },
      { name: "Lipid Profile", category: "Biochemistry", price: 300 },
      { name: "Urine Analysis", category: "Pathology", price: 100 },
      { name: "X-Ray Chest", category: "Radiology", price: 500 },
      { name: "ECG", category: "Cardiology", price: 400 },
    ],
  })

  // ── Medicines ──
  await prisma.medicine.deleteMany()
  await prisma.medicine.createMany({
    data: [
      { name: "Paracetamol 500mg", category: "Analgesics", price: 5, stock: 500 },
      { name: "Amoxicillin 250mg", category: "Antibiotics", price: 15, stock: 300 },
      { name: "Omeprazole 20mg", category: "Gastrointestinal", price: 8, stock: 200 },
      { name: "Metformin 500mg", category: "Diabetes", price: 10, stock: 150 },
      { name: "Atorvastatin 10mg", category: "Cholesterol", price: 12, stock: 100 },
      { name: "Aspirin 75mg", category: "Blood Thinners", price: 3, stock: 400 },
    ],
  })

  // ── Sample Patients ──
  await prisma.patient.deleteMany()
  await prisma.patient.createMany({
    data: [
      {
        patientId: generatePatientId(),
        name: "Rajesh Kumar",
        phone: "9876543210",
        dob: new Date("1985-06-15"),
        age: 39,
        gender: "MALE",
        bloodGroup: "O_POSITIVE",
        address: "12 MG Road, Mumbai",
        emergencyContact: "Sunita Kumar",
        emergencyPhone: "9876543211",
      },
      {
        patientId: generatePatientId(),
        name: "Meena Sharma",
        phone: "9876543212",
        dob: new Date("1992-11-03"),
        age: 32,
        gender: "FEMALE",
        bloodGroup: "B_POSITIVE",
        address: "45 Janpath, New Delhi",
        emergencyContact: "Amit Sharma",
        emergencyPhone: "9876543213",
      },
      {
        patientId: generatePatientId(),
        name: "Suresh Reddy",
        phone: "9876543214",
        dob: new Date("1978-02-20"),
        age: 46,
        gender: "MALE",
        bloodGroup: "A_POSITIVE",
        address: "78 Jubilee Hills, Hyderabad",
        emergencyContact: "Laxmi Reddy",
        emergencyPhone: "9876543215",
      },
      {
        patientId: generatePatientId(),
        name: "Fatima Begum",
        phone: "9876543216",
        dob: new Date("2000-08-12"),
        age: 24,
        gender: "FEMALE",
        bloodGroup: "AB_NEGATIVE",
        address: "23 Park Street, Kolkata",
        emergencyContact: "Mohammad Khan",
        emergencyPhone: "9876543217",
      },
    ],
  })

  console.log("Seed completed successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
