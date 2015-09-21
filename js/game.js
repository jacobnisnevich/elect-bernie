var monthNames = [
	"January", "February", "March",
	"April", "May", "June", "July",
	"August", "September", "October",
	"November", "December"
];

var Game = function(gameState) {
	this.paused = false;
	this.speed = 1;

	this.selectedState = null;

	this.day = gameState.date.day;
	this.month = gameState.date.month;
	this.year = gameState.date.year;

	this.displayDate = monthNames[this.month] + " " + this.day + ", " + this.year;

	self = this;

	this.tick(this);

	var counter = 0;

	setInterval(function() {
		if (!self.paused && self.speed == 1 && (counter / 1000) % 2 == 0) {
			self.tick(self);
		} else if (!self.paused && self.speed == 2) {
			self.tick(self);
		}
		counter += 1000;
	}, 1000);
};

Game.prototype.tick = function(self) {
	self.updateMap();
	self.incrementDate(1);
	$("#date-display").text(this.displayDate);
};

Game.prototype.updateMap = function() {

};

Game.prototype.incrementDate = function(daysAdded) {
	var currentDate = new Date(this.displayDate);
	var nextDate = new Date(currentDate);
	nextDate.setDate(currentDate.getDate() + daysAdded);

	this.day = nextDate.getDate();
	this.month = nextDate.getMonth();
	this.year = nextDate.getFullYear();

	this.displayDate = monthNames[this.month] + " " + this.day + ", " + this.year;
};

Game.prototype.playGame = function() {
	this.paused = false;
	this.speed = 1;
};

Game.prototype.pauseGame = function() {
	this.paused = true;
};

Game.prototype.fastForwardGame = function() {
	this.paused = false;
	this.speed = 2;
};

Game.prototype.stateClicked = function(stateData) {
	console.log("Clicked on " + stateData.name + " (" + stateData.code + ")");
	if (this.selectedState == null) {
		this.selectedState = stateData.code;
	} else {
		this.selectedState = null;
	}
};