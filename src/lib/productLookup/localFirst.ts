export async function localFirstLookup<TLocal, TExternal>(
  localLookup: () => Promise<TLocal | null>,
  externalLookup: () => Promise<TExternal>
) {
  const local = await localLookup();
  if (local) return { source: "local" as const, value: local };

  return { source: "external" as const, value: await externalLookup() };
}
