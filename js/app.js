function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

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
        required: "Please enter a first name"
    });

    self.giftee = ko.observable();

    self.budget = ko.observable(ViewModel.santaBudget);

    self.encGiftee = ko.computed(function() {
        return encrypt(self.giftee());
    }, self);

    self.unEncGiftee = ko.computed(function() {
        return decrypt(self.encGiftee());
    }, self);

    self.secretUrl = ko.computed(function() {
        // return ("index.htm?santa=" + self.name() + "&giftee=" + self.encGiftee() + "&secret=true" + "&budget=" + self.budget());
        return ("index.htm?santa=" + self.name() + "&giftee=" + self.encGiftee() + "&secret=true" + "&budget=" + ViewModel.santaBudget);
    }, self);

}



var ViewModel = function() {
    var self = this;

    // to track whether anyone has been matched with themself:
    var matchesFound = false;

    self.santas = ko.observableArray([
        new Santa("")
    ]);

    self.santaCount = ko.observable(self.santas().length);

    self.santaBudget = ko.observable();

    self.giftees = ko.observableArray([]);

    self.addSanta = function() {
        self.santas.push(new Santa(""));
        self.santaChange(true);
    };

    self.resultsOption = ko.observable("showResults");

    // small tweak to avoid old results being accesible when amendments are made such as adding/removing santas
    self.santaChange = ko.observable(false);

    self.finished = ko.observable(false);

    self.removeSanta = function(data) {
        self.santaChange(true);
        self.santas.remove(data);
    };

    self.cleanUrl = function() {
        console.log("cleaning url");
        var clean_url = location.protocol + "//" + location.host + location.pathname;
        window.history.replaceState({}, document.title, clean_url);
    };


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

    self.assignGiftees = function() {
    	// initial shuffle before testing
        self.giftees(self.shuffle(self.santas().slice()));
        // shuffle and test
        self.shuffleTilCorrect();
        self.finished(true);
        self.santaChange(false);


    }

    // self.santaData = getQueryVariable("santa");

    self.santaData = function() {
        return decodeURIComponent(getQueryVariable("santa"));
    }
    self.secretData = function() {
        return getQueryVariable("secret");
    }

    self.showBudget = function() {
        return decodeURIComponent(getQueryVariable("budget"));
    }

    self.gifteeData = function() {
        return decrypt(getQueryVariable("giftee"));
    }
 
};

ko.applyBindings(new ViewModel());