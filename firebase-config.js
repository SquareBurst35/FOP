// Public web-app configuration from Firebase Console → Project settings.
// Never put service-account keys or OAuth client secrets in this file.
export const firebaseConfig = {
  apiKey: "AIzaSyCwxG0fb2w-pozXFZeU4muLhVNfqaamyDU",
  authDomain: "fichas-ordem-paranormal-ee063.firebaseapp.com",
  projectId: "fichas-ordem-paranormal-ee063",
  appId: "1:236576439453:web:20dc1b2bf34e4f5e536874",
};
export const firebaseConfigured = Object.values(firebaseConfig).every(value => typeof value === "string" && value.trim());
