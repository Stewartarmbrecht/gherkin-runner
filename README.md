gherkin-runner
==============

And old solution built to run gherkin feature files in the browser.  I am recreating it so that I can review the architecture that was built and use it to help the cucumber-js team.

The list below is a dump of all the details of how the gherkinRunner works:

* Runs completely in the browser.
* You run the application by navigating to 'gherkinRunner.html'
* Uses jQuery, Knockout, and Bootstrap to render the UI.
* Uses require.js to load all features and libraries.
* It has two main interfaces: the Walker and the runner.

Working Example:  [Gherkin Runner!](http://gherkin-runner.herokuapp.com)