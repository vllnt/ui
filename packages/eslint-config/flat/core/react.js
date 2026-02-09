import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import cssModulesPlugin from 'eslint-plugin-css-modules'

export const reactConfig = {
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
    'jsx-a11y': jsxA11yPlugin,
    'css-modules': cssModulesPlugin,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React recommended
    ...reactPlugin.configs.recommended.rules,
    ...reactPlugin.configs['jsx-runtime'].rules,

    // JSX A11y recommended
    ...jsxA11yPlugin.configs.recommended.rules,
    // Allow labels without htmlFor when using nesting
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        assert: 'either',
        depth: 3,
      },
    ],

    // React strict rules
    'react/display-name': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/boolean-prop-naming': 'error',
    'react/button-has-type': 'error',
    'react/hook-use-state': 'error',
    'react/jsx-child-element-spacing': 'error',
    'react/jsx-closing-bracket-location': 'error',
    'react/jsx-closing-tag-location': 'error',
    'react/jsx-curly-brace-presence': [
      'error',
      { props: 'never', children: 'never', propElementValues: 'always' },
    ],
    'react/jsx-curly-newline': 'error',
    'react/jsx-curly-spacing': 'error',
    'react/jsx-equals-spacing': 'error',
    'react/jsx-handler-names': 'error',
    'react/jsx-no-constructed-context-values': 'error',
    'react/jsx-no-leaked-render': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'react/jsx-pascal-case': ['error', { ignore: [], allowNamespace: true }],
    'react/jsx-props-no-multi-spaces': 'error',
    'react/jsx-wrap-multilines': [
      'error',
      {
        declaration: 'parens-new-line',
        assignment: 'parens-new-line',
        return: 'parens-new-line',
        arrow: 'parens-new-line',
        condition: 'parens-new-line',
        logical: 'parens-new-line',
      },
    ],
    'react/no-invalid-html-attribute': 'error',
    'react/no-this-in-sfc': 'error',
    'react/no-unstable-nested-components': 'error',
    'react/prefer-stateless-function': 'error',
    'react/self-closing-comp': 'error',
    'react/style-prop-object': 'error',
    'react/void-dom-elements-no-children': 'error',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowNumber: true },
    ],

    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // CSS Modules
    'css-modules/no-unused-class': 'off',
  },
}
