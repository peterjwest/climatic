# climatic

[![npm version][npm-badge]][npm-url] [![build status][circle-badge]][circle-url] [![coverage status][coverage-badge]][coverage-url] [![dependencies status][dependencies-badge]][dependencies-url]

### Command line API tool built for subcommands

## Installation

    npm install climatic --save


## Usage

### Creation

To start create a new instance of your command:

```
var Climatic = require('climatic');
var command = new Climatic('cake');
```

The command name `cake` is used in the help message as the command file name.

### Help & version

You can define a help description and version number:

```
command
  .help('Makes cake')
  .version('1.2.3');
```


### Options

```
command.options({
  piping: { short: 'p', help: 'Text to be iced on the cake' },
  size: { help: 'Size of the cake' },
  square: { flag: true, help: 'Whether the cake should be square' }
});
```

Options can have a single character alias, and also a help message. Options normally expect a value in the format `--option=value` or `-o=value`, however they can be set to be a flag, which expect no value in the format `--option` or `-o`.

### Arguments

```
command.arguments(
  { name: 'type', help: 'Type of cake' },
  { name: 'layers', help: 'Number of layers (default 2)', optional: true }
);
```

Arguments must have a name, this is used to map the arguments from an array to an object. Arguments can also have a help message. They can also be set as optional, but optional arguments must come after required arguments.


### Run the command

```
command.run(process.ARGV);
```

This will run the command, passing it the raw command line arguments. By default commands  output their help message when run.


### Action

```
command.action(function(args, options, raw, next) {
  var layers = args.layers || 2;
  console.log('Your ' + args.type + ' cake will have ' + layers + ' layers');

  if (options.piping) {
    console.log('Your cake will read: ' + options.piping);
  }

  console.log('That sounds delicious! Let me save myself a note');

  var fs = require('fs');
  fs.writeFile('notes.md', '- Eat a delicious cake', function(err) {
    console.log(err ? 'What was I trying to remember?' : 'Thanks for waiting');
    next(err);
  });
});
```

You can define an action for a command, this will run when you run the command with correct syntax. This replaces default action of outputting the help message of the command.

You can cause the command to fail with a non-zero exit code in several ways:

- Throw an exception (this will only work in synchronous code)
- Return a promise which gets rejected
- If you include the `next` argument, call this callback with an error


[npm-badge]: https://badge.fury.io/js/climatic.svg
[npm-url]: https://www.npmjs.com/package/climatic

[circle-badge]: https://circleci.com/gh/peterjwest/climatic.svg?&style=shield&circle-token=2289d7cf77eacc941c35a5eec73328ba2d1e8ea0
[circle-url]: https://circleci.com/gh/peterjwest/climatic

[coverage-badge]: https://coveralls.io/repos/peterjwest/climatic/badge.svg?branch=master&service=github
[coverage-url]: https://coveralls.io/github/peterjwest/climatic?branch=master

[dependencies-badge]: https://david-dm.org/peterjwest/climatic.svg
[dependencies-url]: https://david-dm.org/peterjwest/climatic

