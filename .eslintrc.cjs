module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],
    },
    overrides: [
        {
            files: ['*.ts'],
            rules: {
                "no-unused-vars": "off",
                "@typescript-eslint/no-unused-vars": "off",
                "@typescript-eslint/naming-convention": [
                    "error",
                    {
                        "selector": "memberLike",
                        "modifiers": ["private"],
                        "format": ["camelCase"],
                        "leadingUnderscore": "require"
                    },
                    {
                        "selector": "memberLike",
                        "modifiers": ["protected"],
                        "format": ["camelCase"],
                        "leadingUnderscore": "require"
                    },
                    {
                        "selector": "function",
                        "format": ["PascalCase"]
                    },
                    {
                        "selector": "method",
                        "format": ["PascalCase"]
                    },
                    {
                        "selector": "memberLike",
                        "modifiers": ["public"],
                        "format": ["PascalCase"],
                    }
                ]
            }
        }
    ]
}