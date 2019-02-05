// basic encryption system using Base64
function encrypt(name) {
    return window.btoa(name);
}

function decrypt(name) {
    return window.atob(name);
}

// global variable to store validation errors from input fields.
// this is so the submit button can be hidden until no errors.
var anyErrors = ko.observable(true);

// validation for fields - code transcribed from the knockout documentation
ko.extenders.required = function(target, overrideMessage) {
    //add some sub-observables to our observable
    target.hasError = ko.observable();
    target.validationMessage = ko.observable();

    //define a function to do validation
    function validate(newValue) {
        target.hasError(newValue ? false : true);
        target.validationMessage(newValue ? "" : overrideMessage || "This field is required");
        anyErrors(newValue ? false : true);
    }

    //initial validation
    validate(target());

    //validate whenever the value changes
    target.subscribe(validate);

    //return the original observable
    return target;
};


// prototype santa, or "gifter"
function Santa(name) {
    var self = this;

    // extended observable to track name, and give error if one is not entered
    self.name = ko.observable(name).extend({
        required: ""
    });

    // self.hideMe = function() {
    //     console.log("hiding");
    //     hidePaper(true);
    // }
    // each "santa"'s individual gift recipient
    self.giftee = ko.observable();

    // the budget is a global figure, so to speak, but it makes sense for binding
    // to link each object to it.
    self.budget = ko.observable(ViewModel.santaBudget);

    // the giftee encrypted, so that the results can be hidden from the user if they wish
    // to participate in said Secret Santa event.
    self.encGiftee = ko.computed(function() {
        return encrypt(self.giftee());
    }, self);

    // prefix stored for easy updating in case of moving hosts.
    self.urlPrefix = ko.observable("https://developingharry.github.io/SecretSanta2019/");

    // the full web address that's given to each santa
    self.secretUrl = ko.computed(function() {
        return (self.urlPrefix() + "index.htm?santa=" + self.name() + "&giftee=" + self.encGiftee() + "&secret=true" + "&budget=" + ViewModel.santaBudget);
    }, self);

    // function to copy the above url to the clipboard.
    // this is done by making an invisible input field, populating it with the text, copying and deleting it.
    self.copyUrl = function(id) {
        var elementId = id;
        var hiddenInput = document.createElement("input");
        hiddenInput.setAttribute("value", self.secretUrl());
        document.body.appendChild(hiddenInput);
        hiddenInput.select();
        document.execCommand("copy");
        document.body.removeChild(hiddenInput);
        alert("Link copied.  You can now paste this into an email, text or message for " + self.name() + "!");
    }
}

var ViewModel = function() {
    var self = this;

    // to track whether anyone has been matched with themself:
    var matchesFound = false;

    // main array of Santas,starting with one empty entry to get user started.
    self.santas = ko.observableArray([
        new Santa("")
    ]);

    self.hidePaper = ko.observable(false);
    self.hideSecret = ko.observable(false);

    self.hideMe = function() {
        console.log("hiding");
        self.hidePaper(true);
    }

    self.hideSecretResults = function() {
        console.log("hiding secret results");
        self.hideSecret(true);
    }


    // the main function for adding Santas to the array
    self.addSanta = function() {
        self.santas.push(new Santa(""));
        self.santaChange(true);
    };

    //...and the function for removing them (done by clicking the recycle bin button)
    self.removeSanta = function(data) {
        self.santaChange(true);
        self.santas.remove(data);
    };

    // empty array of giftees, or recipients.  this will later be populated with 
    // the contents of the santas array, and shuffled.
    self.giftees = ko.observableArray([]);

    // function to read the bespoke urls sent to each Santa
    self.getQueryVariable = function(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }
        return (false);
    }

    // copy of santas array, showing only names...

    self.justSantaNames = ko.computed(function() {
        var names = ko.utils.arrayMap(this.santas(), function(item) {
            return item.name();
        });
        return names.sort();
    }, self);

    // ...filtered copy of above array, showing only unique names.
    // This is so that validation can check for duplicates

    self.uniqueSantaNames = ko.dependentObservable(function() {
        return ko.utils.arrayGetDistinctValues(self.justSantaNames()).sort();
    }, self);

    // record of what the max spend is on this secret santa, if the user wishes to set one.
    self.santaBudget = ko.observable();

    // to hold the value of the "would you like to see the results" radio button
    self.resultsOption = ko.observable("showResults");

    // small tweak to avoid old results being accesible when amendments are made such as adding/removing santas
    self.santaChange = ko.observable(false);

    // records whether the assignment of giftees is truly finished, so that the user 
    // doesn't see the "work in progress" as the results are generated.
    self.finished = ko.observable(false);

    // a "Knuth" shuffle, for use and reuse as required
    self.shuffle = function(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        console.log("shuffled");
        return a;
    }

    // as name suggests, a function to keep calling shuffle until no matches found
    self.shuffleTilCorrect = function() {
        console.log("shuffleTilCorrect Starting with initial shuffle");
        // populate giftees array with a shuffled "slice" or clone of the santas array 
        self.giftees(self.shuffle(self.santas().slice()));
        console.log("checking shuffle");
        self.checkShuffle();
        console.log(matchesFound + "matches found");
        while (matchesFound) {
            console.log("shuffling again");
            self.giftees(self.shuffle(self.santas().slice()));
            console.log("match found");
            self.checkShuffle();
        }

        var a = self.santas();
        var b = self.giftees();
        for (var i = 0; i < a.length; i++) {
            a[i].giftee(b[i].name());
        }
    }

    // self-auditing on the shuffle to check whether anyone has been matched with themself
    self.checkShuffle = function() {
        // compare the two arrays (gifters and giftees) with a fairly simple loop
        var a = self.santas();
        var b = self.giftees();
        matchesFound = false;
        for (var i = 0; i < a.length; i++) {
            console.log(a[i].name() + b[i].name());
            if (a[i].name() === b[i].name()) {
                console.log(a[i].name() + "matches" + b[i].name() + "so I'll need to shuffle again");
                matchesFound = true;
            }
            console.log(i + a[i].name());
        }
    }

    // master function of the "FINISHED"
    // button, which shuffles until appropriate matches made.
    self.assignGiftees = function() {
        // counting the total santas
        var allSantas = self.justSantaNames().length;
        // counting the UNIQUE santas
        var uniqueSantas = self.uniqueSantaNames().length;
        // checking if there are any duplicates, before proceeding with the shuffle, to avoid infinite looping.
        if (allSantas == uniqueSantas) {
            // initial shuffle before testing
            self.giftees(self.shuffle(self.santas().slice()));
            // shuffle and test
            self.shuffleTilCorrect();
            self.finished(true);
            // this variable shows whether changes have been made since last submission, and hides the results until
            // the point this function changes it back.
            self.santaChange(false);
            self.hidePaper(false);
            self.hideSecret(false);
            // new method for showing public results/
            $( "#showResultsDialog" ).dialog( "open" );
        } else {
            alert("Sorry, I found two or more matching names in there.  Maybe add the surname to avoid confusion?")
        };

    }

    // reads the bespoke url to check who the santa is.  as with the budget, this also
    // removes any url formatting, just in case spaces/characters have been used
    self.santaData = function() {
        return decodeURIComponent(self.getQueryVariable("santa"));
    }

    // as above, this one doesn't need the characters removed though as it will be an encoded string already.
    self.gifteeData = function() {
        return decrypt(self.getQueryVariable("giftee"));
    }

    // simple method to display either the hidden, "secret" page, or the main submission page.
    // the information is again taken from the url.
    self.secretData = function() {
        return self.getQueryVariable("secret");
    }

    self.showSecret = ko.observable(true);

    // function to show budget if it's been set, and a custom message if it hasn't.
    self.showBudget = function() {
        var budget = decodeURIComponent(self.getQueryVariable("budget"));
        if (budget === "undefined") {
            return ("unlimited, apparently!");
        } else {
            return budget;
        }
    }

    // prepare the public results dialog without showing it
    $("#showResultsDialog").dialog({
        autoOpen: false,
        closeText: "",
        position: { my: "center center", at: "center center", of: "#santaform" }
    });
    // enable tooltips (mainly for the recycle bin button)
    $( function() {
        $( document ).tooltip();
  } );

};

ko.applyBindings(new ViewModel());