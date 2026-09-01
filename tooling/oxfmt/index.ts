import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 80,
  sortPackageJson: false,
  ignorePatterns: ["**/*.hbs", "apps/expo/expo-env.d.ts"],
  sortTailwindcss: {
    functions: ["cn", "cva"],
  },
  sortImports: {
    newlinesBetween: false,
    customGroups: [
      {
        groupName: "acme-type",
        selector: "type",
        elementNamePattern: ["@acme/**"],
      },
      {
        groupName: "local-type",
        selector: "type",
        elementNamePattern: ["~/**", "./**", "../**"],
      },
      { groupName: "external-type", selector: "type" },
      {
        groupName: "react",
        elementNamePattern: [
          "react",
          "react/**",
          "react-native*",
          "react-native*/**",
        ],
      },
      { groupName: "next", elementNamePattern: ["next", "next/**"] },
      { groupName: "expo", elementNamePattern: ["expo*", "expo*/**"] },
      { groupName: "acme", elementNamePattern: ["@acme/**"] },
      { groupName: "tilde", elementNamePattern: ["~/**"] },
    ],
    groups: [
      "external-type",
      "react",
      "next",
      "expo",
      ["builtin", "external", "unknown"],
      { newlinesBetween: true },
      "acme-type",
      "acme",
      { newlinesBetween: true },
      "local-type",
      ["tilde", "internal", "subpath"],
      ["parent", "sibling", "index"],
      ["side_effect_style", "style"],
    ],
  },
});
