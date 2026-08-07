# ESLint Rules Reference

## Table of Contents

Rules in ESLint are grouped by type to help you understand their purpose. Each rule has emojis denoting:

| Emoji | Meaning |
|-------|---------|
| ✅ | **Recommended** — Using the recommended config from `@eslint/js` in a configuration file enables this rule |
| 🔧 | **Fixable** — Some problems reported by this rule are automatically fixable by the `--fix` command line option |
| 💡 | **hasSuggestions** — Some problems reported by this rule are manually fixable by editor suggestions |
| ❄️ | **Frozen** — This rule is currently frozen and is not accepting feature requests |

---

## Possible Problems

These rules relate to possible logic errors in code:

### array-callback-return
Enforce return statements in callbacks of array methods

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### constructor-super
Require super() calls in constructors

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### for-direction
Enforce for loop update clause moving the counter in the right direction

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### getter-return
Enforce return statements in getters

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-async-promise-executor
Disallow using an async function as a Promise executor

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-await-in-loop
Disallow await inside of loops

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-class-assign
Disallow reassigning class members

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-compare-neg-zero
Disallow comparing against -0

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-cond-assign
Disallow assignment operators in conditional expressions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-const-assign
Disallow reassigning const, using, and await using variables

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-constant-binary-expression
Disallow expressions where the operation doesn't affect the value

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-constant-condition
Disallow constant expressions in conditions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-constructor-return
Disallow returning value from constructor

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-control-regex
Disallow control characters in regular expressions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-debugger
Disallow the use of debugger

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-dupe-args
Disallow duplicate arguments in function definitions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-dupe-class-members
Disallow duplicate class members

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-dupe-else-if
Disallow duplicate conditions in if-else-if chains

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-dupe-keys
Disallow duplicate keys in object literals

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-duplicate-case
Disallow duplicate case labels

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-duplicate-imports
Disallow duplicate module imports

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-empty-character-class
Disallow empty character classes in regular expressions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-empty-pattern
Disallow empty destructuring patterns

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-ex-assign
Disallow reassigning exceptions in catch clauses

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-fallthrough
Disallow fallthrough of case statements

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-func-assign
Disallow reassigning function declarations

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-import-assign
Disallow assigning to imported bindings

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-inner-declarations
Disallow variable or function declarations in nested blocks

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-invalid-regexp
Disallow invalid regular expression strings in RegExp constructors

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-irregular-whitespace
Disallow irregular whitespace

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-loss-of-precision
Disallow literal numbers that lose precision

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-misleading-character-class
Disallow characters which are made with multiple code points in character class syntax

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-new-native-nonconstructor
Disallow new operators with global non-constructor functions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-obj-calls
Disallow calling global object properties as functions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-promise-executor-return
Disallow returning values from Promise executor functions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-prototype-builtins
Disallow calling some Object.prototype methods directly on objects

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-self-assign
Disallow assignments where both sides are exactly the same

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-self-compare
Disallow comparisons where both sides are exactly the same

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-setter-return
Disallow returning values from setters

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-sparse-arrays
Disallow sparse arrays

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-template-curly-in-string
Disallow template literal placeholder syntax in regular strings

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-this-before-super
Disallow this/super before calling super() in constructors

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-unassigned-vars
Disallow let or var variables that are read but never assigned

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-undef
Disallow the use of undeclared variables unless mentioned in /*global */ comments

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-unexpected-multiline
Disallow confusing multiline expressions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-unmodified-loop-condition
Disallow unmodified loop conditions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-unreachable
Disallow unreachable code after return, throw, continue, and break statements

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-unreachable-loop
Disallow loops with a body that allows only one iteration

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-unsafe-finally
Disallow control flow statements in finally blocks

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-unsafe-negation
Disallow negating the left operand of relational operators

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-unsafe-optional-chaining
Disallow use of optional chaining in contexts where the undefined value is not allowed

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-unused-private-class-members
Disallow unused private class members

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-unused-vars
Disallow unused variables

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-use-before-define
Disallow the use of variables before they are defined

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-useless-assignment
Disallow variable assignments when the value is not used

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-useless-backreference
Disallow useless backreferences in regular expressions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### require-atomic-updates
Disallow assignments that can lead to race conditions due to usage of await or yield

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### use-isnan
Require calls to isNaN() when checking for NaN

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### valid-typeof
Enforce comparing typeof expressions against valid strings

Categories: ✅Extends | 🔧Fix | 💡Suggestions

---

## Suggestions

These rules suggest alternate ways of doing things:

### accessor-pairs
Enforce getter and setter pairs in objects and classes

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### arrow-body-style
❄️Frozen — Require braces around arrow function bodies

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### block-scoped-var
Enforce the use of variables within the scope they are defined

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### camelcase
❄️Frozen — Enforce camelcase naming convention

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### capitalized-comments
❄️Frozen — Enforce or disallow capitalization of the first letter of a comment

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### class-methods-use-this
Enforce that class methods utilize this

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### complexity
Enforce a maximum cyclomatic complexity allowed in a program

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### consistent-return
Require return statements to either always or never specify values

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### consistent-this
❄️Frozen — Enforce consistent naming when capturing the current execution context

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### curly
❄️Frozen — Enforce consistent brace style for all control statements

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### default-case
Require default cases in switch statements

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### default-case-last
Enforce default clauses in switch statements to be last

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### default-param-last
❄️Frozen — Enforce default parameters to be last

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### dot-notation
❄️Frozen — Enforce dot notation whenever possible

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### eqeqeq
Require the use of === and !==

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### func-name-matching
❄️Frozen — Require function names to match the name of the variable or property to which they are assigned

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### func-names
Require or disallow named function expressions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### func-style
❄️Frozen — Enforce the consistent use of either function declarations or expressions assigned to variables

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### grouped-accessor-pairs
Require grouped accessor pairs in object literals and classes

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### guard-for-in
Require for-in loops to include an if statement

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### id-denylist
❄️Frozen — Disallow specified identifiers

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### id-length
❄️Frozen — Enforce minimum and maximum identifier lengths

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### id-match
❄️Frozen — Require identifiers to match a specified regular expression

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### init-declarations
❄️Frozen — Require or disallow initialization in variable declarations

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### logical-assignment-operators
❄️Frozen — Require or disallow logical assignment operator shorthand

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### max-classes-per-file
Enforce a maximum number of classes per file

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### max-depth
Enforce a maximum depth that blocks can be nested

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### max-lines
Enforce a maximum number of lines per file

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### max-lines-per-function
Enforce a maximum number of lines of code in a function

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### max-nested-callbacks
Enforce a maximum depth that callbacks can be nested

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### max-params
Enforce a maximum number of parameters in function definitions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### max-statements
Enforce a maximum number of statements allowed in function blocks

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### new-cap
Require constructor names to begin with a capital letter

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-alert
Disallow the use of alert, confirm, and prompt

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-array-constructor
Disallow Array constructors

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-bitwise
Disallow bitwise operators

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-caller
Disallow the use of arguments.caller or arguments.callee

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-case-declarations
Disallow lexical declarations in case clauses

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-console
Disallow the use of console

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-continue
❄️Frozen — Disallow continue statements

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-delete-var
Disallow deleting variables

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-div-regex
❄️Frozen — Disallow equal signs explicitly at the beginning of regular expressions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-else-return
❄️Frozen — Disallow else blocks after return statements in if statements

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-empty
Disallow empty block statements

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-empty-function
Disallow empty functions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-empty-static-block
Disallow empty static blocks

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-eq-null
Disallow null comparisons without type-checking operators

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-eval
Disallow the use of eval()

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-extend-native
Disallow extending native types

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-extra-bind
Disallow unnecessary calls to .bind()

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-extra-boolean-cast
❄️Frozen — Disallow unnecessary boolean casts

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-extra-label
❄️Frozen — Disallow unnecessary labels

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-global-assign
Disallow assignments to native objects or read-only global variables

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-implicit-coercion
❄️Frozen — Disallow shorthand type conversions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-implicit-globals
Disallow declarations in the global scope

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-implied-eval
Disallow the use of eval()-like methods

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-inline-comments
❄️Frozen — Disallow inline comments after code

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-invalid-this
Disallow use of this in contexts where the value of this is undefined

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-iterator
Disallow the use of the __iterator__ property

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-label-var
❄️Frozen — Disallow labels that share a name with a variable

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-labels
❄️Frozen — Disallow labeled statements

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-lone-blocks
Disallow unnecessary nested blocks

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-lonely-if
❄️Frozen — Disallow if statements as the only statement in else blocks

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-loop-func
Disallow function declarations that contain unsafe references inside loop statements

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-magic-numbers
❄️Frozen — Disallow magic numbers

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-multi-assign
Disallow use of chained assignment expressions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-multi-str
❄️Frozen — Disallow multiline strings

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-negated-condition
❄️Frozen — Disallow negated conditions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-nested-ternary
❄️Frozen — Disallow nested ternary expressions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-new
Disallow new operators outside of assignments or comparisons

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-new-func
Disallow new operators with the Function object

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-new-wrappers
Disallow new operators with the String, Number, and Boolean objects

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-nonoctal-decimal-escape
Disallow \8 and \9 escape sequences in string literals

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-object-constructor
Disallow calls to the Object constructor without an argument

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-octal
Disallow octal literals

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-octal-escape
Disallow octal escape sequences in string literals

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-param-reassign
Disallow reassigning function parameters

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-plusplus
❄️Frozen — Disallow the unary operators ++ and --

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-proto
Disallow the use of the __proto__ property

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-redeclare
Disallow variable redeclaration

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-regex-spaces
Disallow multiple spaces in regular expressions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-restricted-exports
Disallow specified names in exports

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-restricted-globals
Disallow specified global variables

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-restricted-imports
Disallow specified modules when loaded by import

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-restricted-properties
Disallow certain properties on certain objects

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-restricted-syntax
Disallow specified syntax

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-return-assign
Disallow assignment operators in return statements

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-script-url
Disallow javascript: URLs

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-sequences
Disallow comma operators

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-shadow
Disallow variable declarations from shadowing variables declared in the outer scope

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-shadow-restricted-names
Disallow identifiers from shadowing restricted names

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-ternary
❄️Frozen — Disallow ternary operators

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-throw-literal
Disallow throwing literals as exceptions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-undef-init
❄️Frozen — Disallow initializing variables to undefined

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-undefined
❄️Frozen — Disallow the use of undefined as an identifier

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-underscore-dangle
❄️Frozen — Disallow dangling underscores in identifiers

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-unneeded-ternary
❄️Frozen — Disallow ternary operators when simpler alternatives exist

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-unused-expressions
Disallow unused expressions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-unused-labels
Disallow unused labels

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-useless-call
Disallow unnecessary calls to .call() and .apply()

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-useless-catch
Disallow unnecessary catch clauses

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-useless-computed-key
❄️Frozen — Disallow unnecessary computed property keys in objects and classes

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-useless-concat
❄️Frozen — Disallow unnecessary concatenation of literals or template literals

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-useless-constructor
Disallow unnecessary constructors

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-useless-escape
Disallow unnecessary escape characters

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-useless-rename
Disallow renaming import, export, and destructured assignments to the same name

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-useless-return
Disallow redundant return statements

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-var
Require let or const instead of var

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-void
❄️Frozen — Disallow void operators

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-warning-comments
❄️Frozen — Disallow specified warning terms in comments

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### no-with
Disallow with statements

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### object-shorthand
❄️Frozen — Require or disallow method and property shorthand syntax for object literals

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### one-var
❄️Frozen — Enforce variables to be declared either together or separately in functions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### operator-assignment
❄️Frozen — Require or disallow assignment operator shorthand where possible

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### prefer-arrow-callback
❄️Frozen — Require using arrow functions for callbacks

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### prefer-const
Require const declarations for variables that are never reassigned after declared

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### prefer-destructuring
❄️Frozen — Require destructuring from arrays and/or objects

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### prefer-exponentiation-operator
❄️Frozen — Disallow the use of Math.pow in favor of the ** operator

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### prefer-named-capture-group
Enforce using named capture group in regular expression

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### prefer-numeric-literals
❄️Frozen — Disallow parseInt() and Number.parseInt() in favor of binary, octal, and hexadecimal literals

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### prefer-object-has-own
Disallow use of Object.prototype.hasOwnProperty.call() and prefer use of Object.hasOwn()

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### prefer-object-spread
❄️Frozen — Disallow using Object.assign with an object literal as the first argument and prefer the use of object spread instead

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### prefer-promise-reject-errors
Require using Error objects as Promise rejection reasons

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### prefer-regex-literals
Disallow use of the RegExp constructor in favor of regular expression literals

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### prefer-rest-params
Require rest parameters instead of arguments

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### prefer-spread
❄️Frozen — Require spread operators instead of .apply()

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### prefer-template
❄️Frozen — Require template literals instead of string concatenation

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### preserve-caught-error
Disallow losing originally caught error when re-throwing custom errors

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### radix
Enforce the use of the radix argument when using parseInt()

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### require-await
Disallow async functions which have no await expression

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### require-unicode-regexp
Enforce the use of u or v flag on regular expressions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### require-yield
Require generator functions to contain yield

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### sort-imports
❄️Frozen — Enforce sorted import declarations within modules

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### sort-keys
❄️Frozen — Require object keys to be sorted

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### sort-vars
❄️Frozen — Require variables within the same declaration block to be sorted

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### strict
Require or disallow strict mode directives

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### symbol-description
Require symbol descriptions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### vars-on-top
❄️Frozen — Require var declarations be placed at the top of their containing scope

Categories: ✅Extends | 🔧Fix | 💡Suggestions

### yoda
❄️Frozen — Require or disallow "Yoda" conditions

Categories: ✅Extends | 🔧Fix | 💡Suggestions

---

## Layout & Formatting

These rules care about how the code looks rather than how it executes:

### unicode-bom
Require or disallow Unicode byte order mark (BOM)

Categories: ✅Extends | 🔧Fix | 💡Suggestions

---

## Source

Reference: [ESLint Rules Documentation](https://eslint.org/docs/latest/rules/)