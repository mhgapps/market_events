import { PrismaClient } from "@prisma/client";
import ContractReview from "./ContractReview";

const prisma = new PrismaClient();

export default async function ContractPage({ params }: { params: { contractId: string } }) {
  const contractId = Number(params.contractId);
  
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
  });
  
  if (!contract) {
    return (
      <div style={{ padding: "1rem" }}>
        <h1>Contract Not Found</h1>
        <p>No contract with ID {contractId} exists.</p>
      </div>
    );
  }
  
  return <ContractReview contract={contract} />;
}