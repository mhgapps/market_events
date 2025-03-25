import { PrismaClient } from '@prisma/client';
import PackagesTable from './PackagesTable';

const prisma = new PrismaClient();

export default async function PackagesListPage() {
  // Fetch packages with brand info plus brandId, pricePerPerson, and description
  const packages = await prisma.package.findMany({
    select: {
      id: true,
      name: true,
      brandId: true,
      pricePerPerson: true,
      description: true,
      brand: {
        select: {
          name: true,
        },
      },
    },
  });

  // Map to the shape that includes all fields from PackageData
  const packageData = packages.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    brandId: p.brandId?.toString() || '',
    brandName: p.brand?.name || '',
    pricePerPerson: p.pricePerPerson ?? 0,
    description: p.description ?? '',
  }));

  // Fetch all brands
  const brands = await prisma.brand.findMany({
    select: {
      id: true, // numeric
      name: true,
    },
  });

  // Convert numeric brand IDs to string
  const allBrands = brands.map((b) => ({
    id: b.id.toString(),
    name: b.name,
  }));

  return (
    <div style={{ padding: '1rem' }}>
      <h1></h1>
      <PackagesTable packages={packageData} allBrands={allBrands} />
    </div>
  );
}