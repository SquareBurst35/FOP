// Public web-app configuration from Firebase Console → Project settings.
// Never put service-account keys or OAuth client secrets in this file.
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: "",
};
export const firebaseConfigured = Object.values(firebaseConfig).every(value => typeof value === "string" && value.trim());
