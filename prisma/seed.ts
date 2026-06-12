import prisma from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

async function createUserWithPassword({
  name,
  email,
  password,
  role,
}: {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "GURU" | "SISWA";
}) {
  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      isActive: true,
      accounts: {
        create: {
          providerId: "credential",
          accountId: email,
          password: hashedPassword,
        },
      },
    },
  });
  return user;
}

function calculateNilai(tugas: number, uts: number, uas: number, kkm: number) {
  const akhir = tugas * 0.3 + uts * 0.3 + uas * 0.4;
  const lulus = akhir >= kkm;
  return { akhir, lulus };
}

async function createNilai({
  siswaId,
  mapelId,
  guruId,
  tahunAjaranId,
  tugas,
  uts,
  uas,
  kkm,
}: {
  siswaId: string;
  mapelId: string;
  guruId: string;
  tahunAjaranId: string;
  tugas: number;
  uts: number;
  uas: number;
  kkm: number;
}) {
  const { akhir, lulus } = calculateNilai(tugas, uts, uas, kkm);
  return await prisma.nilai.create({
    data: {
      siswaId,
      mapelId,
      guruId,
      tahunAjaranId,
      nilaiTugas: tugas,
      nilaiUts: uts,
      nilaiUas: uas,
      nilaiAkhir: akhir,
      statusLulus: lulus,
    },
  });
}

async function main() {
  console.log("Starting database seeding...");

  // 1. Clear existing data safely in dependency order
  console.log("Cleaning up existing data...");
  await prisma.nilai.deleteMany();
  await prisma.guruMapel.deleteMany();

  // Reset self-referential / cyclic constraints first
  await prisma.siswa.updateMany({ data: { kelasId: null } });
  await prisma.kelas.updateMany({ data: { waliKelasId: null } });

  await prisma.siswa.deleteMany();
  await prisma.kelas.deleteMany();
  await prisma.guru.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.mataPelajaran.deleteMany();
  await prisma.tahunAjaran.deleteMany();

  // 2. Create academic years (TahunAjaran)
  console.log("Seeding academic years (TahunAjaran)...");
  const thn1 = await prisma.tahunAjaran.create({
    data: {
      namaPeriode: "2024/2025 Genap",
      isActive: false,
    },
  });
  const thn2 = await prisma.tahunAjaran.create({
    data: {
      namaPeriode: "2025/2026 Ganjil",
      isActive: true,
    },
  });

  // 3. Create subjects (MataPelajaran)
  console.log("Seeding subjects (MataPelajaran)...");
  const mtk = await prisma.mataPelajaran.create({
    data: {
      kodeMapel: "MTK",
      namaMapel: "Matematika",
      kkm: 75.0,
    },
  });
  const bhsInd = await prisma.mataPelajaran.create({
    data: {
      kodeMapel: "BHS-IND",
      namaMapel: "Bahasa Indonesia",
      kkm: 70.0,
    },
  });
  const bhsIng = await prisma.mataPelajaran.create({
    data: {
      kodeMapel: "BHS-ING",
      namaMapel: "Bahasa Inggris",
      kkm: 70.0,
    },
  });
  const webRpl = await prisma.mataPelajaran.create({
    data: {
      kodeMapel: "WEB-RPL",
      namaMapel: "Pemrograman Web",
      kkm: 78.0,
    },
  });

  // 4. Create Admin Account
  console.log("Seeding admin account...");
  await createUserWithPassword({
    name: "Administrator",
    email: "admin@nilai.local",
    password: "password123",
    role: "ADMIN",
  });

  // 5. Create Teachers (GURU)
  console.log("Seeding teachers (GURU)...");
  const userBudi = await createUserWithPassword({
    name: "Budi Setiawan, S.Pd",
    email: "guru.budi@nilai.local",
    password: "password123",
    role: "GURU",
  });
  const guruBudi = await prisma.guru.create({
    data: {
      userId: userBudi.id,
      nip: "198001012005011002",
      namaLengkap: "Budi Setiawan, S.Pd",
    },
  });

  const userSiti = await createUserWithPassword({
    name: "Siti Rahma, M.Pd",
    email: "guru.siti@nilai.local",
    password: "password123",
    role: "GURU",
  });
  const guruSiti = await prisma.guru.create({
    data: {
      userId: userSiti.id,
      nip: "198502022010022001",
      namaLengkap: "Siti Rahma, M.Pd",
    },
  });

  // 6. Create Classes (Kelas)
  console.log("Seeding classes (Kelas)...");
  const kelasA = await prisma.kelas.create({
    data: {
      tingkat: "XII",
      namaKelas: "RPL A",
      waliKelasId: guruBudi.id,
    },
  });

  const kelasB = await prisma.kelas.create({
    data: {
      tingkat: "XII",
      namaKelas: "RPL B",
      waliKelasId: guruSiti.id,
    },
  });

  // 7. Create Students (SISWA)
  console.log("Seeding students (SISWA)...");
  const userAndi = await createUserWithPassword({
    name: "Andi Wijaya",
    email: "siswa.andi@nilai.local",
    password: "password123",
    role: "SISWA",
  });
  const siswaAndi = await prisma.siswa.create({
    data: {
      userId: userAndi.id,
      nis: "12001",
      nisn: "0051234561",
      namaLengkap: "Andi Wijaya",
      kelasId: kelasA.id,
    },
  });

  const userBudiSiswa = await createUserWithPassword({
    name: "Budi Cahyono",
    email: "siswa.budi@nilai.local",
    password: "password123",
    role: "SISWA",
  });
  const siswaBudi = await prisma.siswa.create({
    data: {
      userId: userBudiSiswa.id,
      nis: "12002",
      nisn: "0051234562",
      namaLengkap: "Budi Cahyono",
      kelasId: kelasA.id,
    },
  });

  const userCitra = await createUserWithPassword({
    name: "Citra Lestari",
    email: "siswa.citra@nilai.local",
    password: "password123",
    role: "SISWA",
  });
  const siswaCitra = await prisma.siswa.create({
    data: {
      userId: userCitra.id,
      nis: "12003",
      nisn: "0051234563",
      namaLengkap: "Citra Lestari",
      kelasId: kelasB.id,
    },
  });

  // 8. Create Guru-MataPelajaran associations (GuruMapel)
  console.log("Seeding teacher-subject relations (GuruMapel)...");
  await prisma.guruMapel.createMany({
    data: [
      { guruId: guruBudi.id, mapelId: mtk.id },
      { guruId: guruBudi.id, mapelId: webRpl.id },
      { guruId: guruSiti.id, mapelId: bhsInd.id },
      { guruId: guruSiti.id, mapelId: bhsIng.id },
    ],
  });

  // 9. Create Grades (Nilai)
  console.log("Seeding student grades (Nilai)...");
  // Andi's grades (Active Semester: 2025/2026 Ganjil)
  await createNilai({
    siswaId: siswaAndi.id,
    mapelId: mtk.id,
    guruId: guruBudi.id,
    tahunAjaranId: thn2.id,
    tugas: 80,
    uts: 78,
    uas: 85,
    kkm: 75.0,
  });
  await createNilai({
    siswaId: siswaAndi.id,
    mapelId: webRpl.id,
    guruId: guruBudi.id,
    tahunAjaranId: thn2.id,
    tugas: 85,
    uts: 90,
    uas: 88,
    kkm: 78.0,
  });
  await createNilai({
    siswaId: siswaAndi.id,
    mapelId: bhsInd.id,
    guruId: guruSiti.id,
    tahunAjaranId: thn2.id,
    tugas: 75,
    uts: 70,
    uas: 80,
    kkm: 70.0,
  });

  // Budi's grades
  await createNilai({
    siswaId: siswaBudi.id,
    mapelId: mtk.id,
    guruId: guruBudi.id,
    tahunAjaranId: thn2.id,
    tugas: 60,
    uts: 70,
    uas: 65,
    kkm: 75.0,
  });
  await createNilai({
    siswaId: siswaBudi.id,
    mapelId: webRpl.id,
    guruId: guruBudi.id,
    tahunAjaranId: thn2.id,
    tugas: 70,
    uts: 72,
    uas: 75,
    kkm: 78.0,
  });

  // Citra's grades
  await createNilai({
    siswaId: siswaCitra.id,
    mapelId: bhsInd.id,
    guruId: guruSiti.id,
    tahunAjaranId: thn2.id,
    tugas: 90,
    uts: 85,
    uas: 92,
    kkm: 70.0,
  });
  await createNilai({
    siswaId: siswaCitra.id,
    mapelId: bhsIng.id,
    guruId: guruSiti.id,
    tahunAjaranId: thn2.id,
    tugas: 88,
    uts: 80,
    uas: 85,
    kkm: 70.0,
  });

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
