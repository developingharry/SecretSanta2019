function Santa(name,giftee) {
    var self = this;

    self.name = ko.observable(name);
    self.giftee = ko.observable(giftee);   
}


var ViewModel = function() {
	var self = this;

	self.santas = ko.observableArray([
		new Santa("Mary"),
		new Santa("Dave")
	]);

	self.addSanta = function() {
        self.santas.push(new Santa("",""));
    }

    self.assignGiftees = function() {
    	// TODO: add mechanism to assign giftees
    	console.log("assigning giftees...");
    }
};
 
ko.applyBindings(new ViewModel());