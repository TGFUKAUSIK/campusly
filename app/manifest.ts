import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Campusly Student Companion",
    short_name: "Campusly",
    description: "Attendance, timetable, academics, and campus life in one place.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7f3",
    theme_color: "#164d45",
    orientation: "portrait",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
