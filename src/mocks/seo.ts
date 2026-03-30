interface MetadataInput {
  title: string;
  description: string;
  path: string;
}

export function createMetadata(input: MetadataInput) {
  return {
    title: input.title,
    description: input.description,
  };
}
