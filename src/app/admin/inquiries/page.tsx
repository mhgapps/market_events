import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function AdminInquiriesPage() {
  // Fetch inquiries ordered by creation date (most recent first)
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Panel - Inquiries</h1>
      <table border={1} cellPadding={8} cellSpacing={0}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Primary Phone</th>
            <th>Event Date</th>
            <th>Event Time</th>
            <th>Service</th>
            <th>Message</th>
            <th>Submitted At</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inq) => (
            <tr key={inq.id}>
              <td>{inq.id}</td>
              <td>{inq.firstName} {inq.lastName}</td>
              <td>{inq.email}</td>
              <td>{inq.primaryPhone}</td>
              <td>{inq.eventDate ? new Date(inq.eventDate).toLocaleDateString() : "N/A"}</td>
              <td>{inq.eventTime ? new Date(inq.eventTime).toLocaleTimeString() : "N/A"}</td>
              <td>{inq.service || "N/A"}</td>
              <td>{inq.message || "N/A"}</td>
              <td>{new Date(inq.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}