import js from '@eslint/js';
import globals from 'globals';

// Layer rules (see the header of each example.js). Real imports between layers:
//   usecases -> domain      controllers -> dto      dto -> domain/errors.js
//   dao -> dao/db.js        routes -> express
// Everything else is handed over by app.js, which is free to import anything.
const forbid = (message, ...group) => ({
  'no-restricted-imports': ['error', { patterns: [{ group, message }] }],
});

const noClock = {
  'no-restricted-syntax': [
    'error',
    {
      selector: "NewExpression[callee.name='Date']",
      message: 'Do not read the clock here: use the injected clock, or take the time as a parameter.',
    },
    {
      selector: "CallExpression[callee.object.name='Date']",
      message: 'Do not read the clock here: use the injected clock, or take the time as a parameter.',
    },
  ],
};

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    languageOptions: { globals: globals.node },
    rules: {
      eqeqeq: 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/domain/**/*.js'],
    rules: {
      ...forbid(
        'domain/ must stay pure: no imports from other layers, express or the database.',
        '**/dao/**',
        '**/usecases/**',
        '**/dto/**',
        '**/controllers/**',
        '**/routes/**',
        'express',
        'better-sqlite3',
      ),
      ...noClock,
    },
  },
  {
    files: ['src/usecases/**/*.js'],
    rules: {
      ...forbid(
        'usecases/ import only domain/: dao modules arrive as parameters from app.js.',
        '**/dao/**',
        '**/dto/**',
        '**/controllers/**',
        '**/routes/**',
        'express',
        'better-sqlite3',
      ),
      ...noClock,
    },
  },
  {
    files: ['src/dto/**/*.js'],
    rules: forbid(
      'dto/ only shapes data: it may import domain/errors.js and nothing else from the project.',
      '**/dao/**',
      '**/usecases/**',
      '**/controllers/**',
      '**/routes/**',
      '**/domain/**',
      '!**/domain/errors.js',
      'express',
      'better-sqlite3',
    ),
  },
  {
    files: ['src/controllers/**/*.js'],
    rules: forbid(
      'controllers/ call the use cases they are given: no dao/, domain/, usecases/ or database imports.',
      '**/dao/**',
      '**/domain/**',
      '**/usecases/**',
      '**/routes/**',
      'better-sqlite3',
    ),
  },
  {
    files: ['src/routes/**/*.js'],
    rules: forbid(
      'routes/ only map URLs to the controllers they are given: no project imports.',
      '**/dao/**',
      '**/domain/**',
      '**/usecases/**',
      '**/dto/**',
      '**/controllers/**',
      'better-sqlite3',
    ),
  },
  {
    files: ['src/dao/**/*.js'],
    rules: forbid(
      'dao/ only talks to the database: no imports from other layers or express.',
      '**/domain/**',
      '**/usecases/**',
      '**/dto/**',
      '**/controllers/**',
      '**/routes/**',
      'express',
    ),
  },
];
