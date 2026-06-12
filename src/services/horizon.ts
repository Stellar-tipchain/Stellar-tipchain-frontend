import { HORIZON_URL } from "@/utils";

export interface Payment {
  timestamp: string;
  amount: string;
  direction: "sent" | "received";
  counterpart: string;
  pagingToken: string;
}

export async function getPaymentHistory(
  address: string,
  cursor?: string
): Promise<{ records: Payment[]; nextCursor: string | null }> {
  const params = new URLSearchParams({ order: "desc", limit: "20" });
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(
    `${HORIZON_URL}/accounts/${address}/payments?${params}`
  );

  if (res.status === 404) return { records: [], nextCursor: null };
  if (!res.ok) throw new Error(`Horizon error ${res.status}`);

  const data = await res.json();
  const raw: Record<string, unknown>[] = data._embedded?.records ?? [];

  const records: Payment[] = raw
    .filter((r) => r.type === "payment" && r.asset_type === "native")
    .map((r) => ({
      timestamp: r.created_at as string,
      amount: r.amount as string,
      direction: r.to === address ? "received" : "sent",
      counterpart: (r.to === address ? r.from : r.to) as string,
      pagingToken: r.paging_token as string,
    }));

  const last = raw[raw.length - 1];
  const nextCursor = last ? (last.paging_token as string) : null;

  return { records, nextCursor };
}
