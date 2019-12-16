module.exports = {
    'env': {
        'browser': false,
        'es6': true,
        'node': true,
    },
    'extends': ['eslint:recommended', 'prettier'],
    'plugins': ['prettier'],
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2018,
        'sourceType': 'module'
    },
    parser: 'babel-eslint',

    'rules': {
        'no-constant-condition': 'off',
        'no-unused-vars': 'warn',
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ]
    }
};