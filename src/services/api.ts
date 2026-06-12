const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  getCreator: (username: string) => request<{ username: string; bio: string; stellarAddress: string }>(`/creators/${username}`),
  getCreators: () => request<{ username: string }[]>("/creators"),
  sendTip: (to: string, amount: number) =>
    request<{ txHash: string }>("/tips", {
      method: "POST",
      body: JSON.stringify({ to, amount }),
    }),
  registerCreator: (username: string, bio: string, stellarAddress: string) =>
    request<{ username: string }>("/creators", {
      method: "POST",
      body: JSON.stringify({ username, bio, stellarAddress }),
    }),
};
