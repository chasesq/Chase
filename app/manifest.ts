import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyBank - Chase Banking",
    short_name: "MyBank",
    description:
      "Your personal banking app. Manage accounts, transfer funds, pay bills, and track finances on the go.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a4fa6",
    theme_color: "#0a4fa6",
    categories: ["finance", "business", "productivity"],
    lang: "en-US",
    dir: "ltr",
    scope: "/",
    icons: [
      {
        src: "/icon-512.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/icon-512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/apple-icon.jpg",
        sizes: "180x180",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Send Money",
        short_name: "Send",
        description: "Send money to friends and family",
        url: "/?action=send",
        icons: [{ src: "/icon-512.jpg", sizes: "192x192" }],
      },
      {
        name: "Deposit Check",
        short_name: "Deposit",
        description: "Deposit a check with your camera",
        url: "/?action=deposit",
        icons: [{ src: "/icon-512.jpg", sizes: "192x192" }],
      },
      {
        name: "Pay Bills",
        short_name: "Bills",
        description: "Pay bills and manage payees",
        url: "/?action=bills",
        icons: [{ src: "/icon-512.jpg", sizes: "192x192" }],
      },
    ],
  }
}
