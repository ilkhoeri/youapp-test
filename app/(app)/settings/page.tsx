interface Params {
  params: Promise<{ userId: string }>;
}
export default async function SettingsPage({ params }: Params) {
  const [{ userId }] = await Promise.all([params]);
  return <>Settings Page</>;
}
