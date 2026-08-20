// Both values are optional on purpose: Vertex AI falls back to the project on
// the ambient Google credentials, and the location has a working default.
export const env = {
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
  GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION ?? "global",
};
