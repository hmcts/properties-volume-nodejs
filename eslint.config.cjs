const js = require("@eslint/js");
const globals = require("globals");
const { FlatCompat } = require("@eslint/eslintrc");

const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const importPlugin = require("eslint-plugin-import");
const jestPlugin = require("eslint-plugin-jest");
const prettierPlugin = require("eslint-plugin-prettier");

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  // replaces "eslint:recommended"
  js.configs.recommended,

  // reuse your existing "extends" (legacy -> flat)
  ...compat.extends(
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:jest/recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ),

  {
    files: ["**/*.{js,cjs,mjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "module",

      // TypeScript
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },

      // replaces env + globals
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2015,
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },
    },

    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
      jest: jestPlugin,
      prettier: prettierPlugin,
    },

    rules: {
      "@typescript-eslint/array-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
      "@typescript-eslint/no-var-requires": "off",

      curly: "error",
      eqeqeq: "error",
      "import/no-duplicates": "error",
      "import/no-named-as-default": "error",
      "import/order": "off",
      "jest/prefer-to-have-length": "error",
      "linebreak-style": ["error", "unix"],
      "no-console": "warn",
      "no-prototype-builtins": "off",
      "no-return-await": "error",
      "no-unneeded-ternary": ["error", { defaultAssignment: false }],
      "object-curly-spacing": ["error", "always"],
      "object-shorthand": ["error", "properties"],
      quotes: ["error", "single", { allowTemplateLiterals: false, avoidEscape: true }],
      semi: ["error", "always"],
      "sort-imports": [
        "error",
        {
          allowSeparatedGroups: false,
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
        },
      ],
    },
  },

  // Optional but recommended: only apply Jest globals/rules to test files
  {
    files: ["**/*.{test,spec}.{js,ts,tsx}", "**/__tests__/**/*.{js,ts,tsx}"],
    languageOptions: { globals: { ...globals.jest } },
  },
];
