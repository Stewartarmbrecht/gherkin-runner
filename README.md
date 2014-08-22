gherkin-runner
==============

And old solution built to run gherkin feature files in the browser.  I am recreating it so that I can review the architecture that was built and use it to help the cucumber-js team.

The list below is a dump of all the details of how the gherkinRunner works:

* Runs completely in the browser.
* You run the application by navigating to 'gherkinRunner.html'
* Uses jQuery, Knockout, and Bootstrap to render the UI.
* Uses require.js to load all features and libraries.
* It has two main interfaces: the Walker and the runner.

##Using the Gherkin Runner

###Launch the Gherkin Runner
###Browse Features
####Expand and Collapse a Feature Set
####View the Feature Set and Feature Count in a Feature Set
####Select and Deselect a Feature Set or Feature
###Load Features
###Navigate the Loaded Features
####Expand and Collapse a Feature Set
####Expand and Collapse the Steps of a Scenario
####Expand and Collapse the Steps of an Example
####View the Step Definition for a Step
####View the Count Summary
###Run All Loaded Features
####View What is Currently Current Running
####View the Counts as They Update
####View the Step, Scenario, and Feature Status Update
###View the Run Results
###View the Results of the Previous Run
###Run A Single Loaded Feature
####Run With Current State
####Reset State And Run
###Set A Breakpoint
###Break On Exceptions
###Pause the Runner
###Cancel the Runner
###Reload the Selected Features
###Return to the Walker from the Runner
###Link to the Selected Features and Feature Sets
###Run a UI Feature
####Toggle Between the UI and the Gherkin Runner
####Move the Run Summary
####Move the Runner Controls (Pause, Start, Cancel)

##Defining Features

###Define a Feature

The first file to create when defining features is a feature file.  The system uses html files to store feature definitions.

1. Create a features folder in the root of the application.   
1. Add a helloWorld.html file.  
1. Add the following content to myFeature.html:  

```
Feature: Hello World  
  In order to the system is running  
  As a public user  
  I should be able to view a hello world page from the application     
```

You have now created a simple, but empty, feature file.  See Defining a Simple Scenario for creating the first scenario in the file.  

###Define a Simple Scenario

1. Open the helloWorld.html file you created in the previous section. 

1. Update the file to have the following: 
    Feature: Hello World
      In order to the system is running
      As a public user
      I should be able to view a hello world page from the application

    Scenario: View Hello World
      Given I have a browser open
      When I navigate to the Hello World Page
      Then I should see a message of Hello World! 

You now have a complete feature file ready to be automated.

###Create a Feature Set

In order for the Gherkin Runner to access your feature and load it, you will need to define a feature set file.  
A feature set file is a javascript file that defines the features that the Gherkin Runner should load.
It can also include references to other feature set files.  This allows your to organize your features into 
a hierarchy.
###Create a Step Definition
###Run the Feature
###Define a Step with an Inline Argument
###Define a Step with a Table Argument Step
###Define a Scenario Outline
###Define a Scenario Outline that Nests the Example Arguments 
###Define a Background
###Define a Feature Background
###Define a Feature with an Import
###Define a Step Group for a Step
###Reference an Inline Parameter in a Step Group
###Reference an Inline Parameter in a Table Argument
###Add Comments to a Feature
####Inline Comments
####Full Line Comments
###Use an Expression in a Step
###Add Code Folding in a Feature With Div Tags

##Feature Sets
* The tool is told what features to run via a concept call feature sets.
* Feature Sets are javascript files that use require.js define statements and return an object like the following:
    define(function () {
        return {
            name: "Features", //Name of feature set to display in the tool.
            featureSetPaths: [
                "Features/API/featureSet", //Path to javascript file that contains another feature set definition like this.
                "Features/UI/featureSet",
        ],
            featurePaths: [
                "Features/API/myFeature" //Path to html file that contains the feature definition. 
            ]
        };
    });
* Feature set files define a name to display in the tool as well as paths to either additional feature sets or the actual features.
* Nesting feature sets allows you to organize your features in any way you desire.  
* You can include one feature or feature set in multiple feature sets.
* The feature sets and feature will be executed in the order you add them.
* Feature sets will be loaded before any features included in the feature set.
* You can tell the tool to load a feature set (instead of the default root) by using a featureSetPaths URL parameter with multiple paths separated by comma's.
    http://localhost:3000/gherkinrunner.html?featureSetPaths=features/API/APIRoot/featureSet,features/UI/Login/featureSet
* 
* Loads the list of features by looking for a root level featureSet.js.
* Feature Set definitions are just javascript files that return javascript objects in require define() statements:

* featureSet.js either points to additional featureSet.js files or to feature.html files.
