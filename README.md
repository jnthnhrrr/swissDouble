This is an application for running tournaments in sports where teams consist of
two players. Team partners are not fixed throughout the tournament, but are
assigned at random every new round.

It is inspired by the Swiss System most prominently used in chess, but does not
follow it to the letter. The general idea is that the tournament has no
out-rounds, so every participant plays the same amount of matches. Teams are
"power paired" in each round, that means each team plays against a team which
has gained the same amount of points so far.

For the exact specifications, have a look at SPECIFICATIONS.md.

# Use

In order to use the app, download the file `swissDouble.html` and open it in a
web browser (In most browsers, this works by using the shortcut `Ctrl + O`.)

![Screencast of Usage
Example](https://github.com/jonathan-scholbach/swissDouble/raw/master/screencast.gif)

## Data Protection

The whole application runs offline, in your local browser, no data is shared
with anybody.

# Contributing

Pull Requests for bug fixes or additional features are welcome. Please open a
GitHub issue before providing a PR, so we can discuss your idea first.

# Building

To build the html file from the source code located in `app` directory, run

    npm run build

You will need Node 20 or higher.

# Testing

The tests can be run, with node installed, by invoking

    npm run test

from the root directory of the repository.
