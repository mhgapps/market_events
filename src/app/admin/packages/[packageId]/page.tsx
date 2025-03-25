export const dynamic = "force-dynamic";

import { PrismaClient } from "@prisma/client";
import PackageDetail from "./PackageDetail";

const prisma = new PrismaClient();

interface PackageDetailPageProps {
  params: { packageId: string };
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { packageId } = params;

  // Force a cast to `any` so we can access all fields (like appetizerUpcharge) without TS error
  const pkg = (await prisma.package.findUnique({
    where: { id: Number(packageId) },
    include: {
      brand: true,
      packageItems: {
        include: { item: true },
      },
    },
  })) as any;

  if (!pkg) {
    return <div>Package not found</div>;
  }

  // Convert numeric fields to string if needed
  const packageData = {
    ...pkg,
    id: pkg.id.toString(),
    brandId: pkg.brandId ? pkg.brandId.toString() : "",
    brandName: pkg.brand?.name || "",
    appetizerUpcharge: pkg.appetizerUpcharge ?? 0, // No more TS error
  };

  // Extract items from packageItems
  const items = pkg.packageItems?.map((pi: any) => pi.item) || [];

  // If you need all items for brand filtering:
  const allItems = await prisma.items.findMany({
    include: {
      brand: true,
    },
  });

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Package Detail</h1>
      <PackageDetail packageData={packageData} items={items} allItems={allItems} />
    </div>
  );
}