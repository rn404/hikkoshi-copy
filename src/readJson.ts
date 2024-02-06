const readJson = async (filePath: string) => {
  const { default: settings } = await import(filePath, {
    with: { type: "json" },
  });
  return settings;
}

export { readJson }
