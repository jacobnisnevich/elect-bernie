var monthNames = [
	"January", "February", "March",
	"April", "May", "June", "July",
	"August", "September", "October",
	"November", "December"
];

var candidateColors = {
	"Hillary Clinton": "rgb(77, 197, 77)",
	"Bernie Sanders": "rgb(245, 91, 91)",
	"Joe Biden": "rgb(255, 174, 98)"
}

var Game = function(gameState) {
	this.paused = false;
	this.speed = 1;

	this.selectedState = null;

	this.money = gameState.finances["Bernie Sanders"].total;
	this.staff = gameState.finances["Bernie Sanders"].staff;
	this.totalStaff = gameState.finances["Bernie Sanders"].staff.total;
	this.monthlyRevenue = gameState.finances["Bernie Sanders"].raisedPerMonth;
	this.financeLog = [];

	this.day = gameState.date.day;
	this.month = gameState.date.month;
	this.year = gameState.date.year;

	this.states = gameState.states;

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
	self.incrementDate(1);
	self.checkIfMoneyBomb();
	if (this.day == 1) {
		self.updatePolls();
		self.doMonthlyFinances();
	}
	self.updateMap();
	$("#date-display").text(this.displayDate);
	$("#finance-total").text(formatDollar(this.money));
};

Game.prototype.updateMap = function() {
	$.each(this.states, function(state, stateData) {
		var frontRunner = getFrontRunner(stateData.polling).candidate;
		var stateColor = candidateColors[frontRunner];
		$("*[data-state='" + state + "']").css("fill", stateColor);
	});
};

Game.prototype.updatePolls = function() {

};

Game.prototype.doMonthlyFinances = function() {
	this.paySalaries();
	this.addRevenue();
	this.updateFinanceTable();
};

Game.prototype.paySalaries = function() {
	var totalSalaries = -1 * (42000 * this.totalStaff);

	this.money += totalSalaries;

	this.financeLog.push({
		"Description": "Payed " + this.totalStaff + " staff for month of " + monthNames[this.month - 1],
		"Date": this.displayDate,
		"Amount": totalSalaries
	});
};

Game.prototype.addRevenue = function() {
	var randomVariation = Math.floor((Math.random() * 1000000) - 500000); // random number between -$500,000 and $500,000
	var totalRevenue = this.monthlyRevenue + randomVariation;

	this.money += totalRevenue;

	this.financeLog.push({
		"Description": "Campaign earnings for month of " + monthNames[this.month - 1],
		"Date": this.displayDate,
		"Amount": totalRevenue
	});
};

Game.prototype.addMoneyBomb = function() {
	var randomEarning = Math.floor((Math.random() * 150000) + 50000); // random number between $50,000 and $150,000
	var totalMoneyBomb = randomEarning;

	this.money += totalMoneyBomb;

	this.financeLog.push({
		"Description": "Money bomb from /r/SandersForPresident",
		"Date": this.displayDate,
		"Amount": totalMoneyBomb
	});
};

Game.prototype.checkIfMoneyBomb = function() {
	var randomChance = Math.floor(Math.random() * 100);
	if (randomChance <= 1) {
		this.addMoneyBomb();
		this.updateFinanceTable();
	}
};

Game.prototype.updateFinanceTable = function() {
	$tableBody = $("#finance-table tbody");
	$tableBody.empty();

	this.financeLog.forEach(function(transaction) {
		var tableRow = "<tr><td>" + transaction["Description"] + "</td><td>" + transaction["Date"] + "</td>";
		if (transaction["Amount"] < 0) {
			tableRow = tableRow + "<td style='color: rgb(245, 91, 91); text-align: right;'>" +  formatDollar(-1 * transaction["Amount"]) + "</td></tr>";
		} else {
			tableRow = tableRow + "<td style='text-align: right;'>" +  formatDollar(transaction["Amount"]) + "</td></tr>";
		}
		$tableBody.append(tableRow);
	});
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

var formatDollar = function(num) {
	var p = num.toFixed(2).split(".");
	return "$" + p[0].split("").reverse().reduce(function(acc, num, i, orig) {
		return  num + (i && !(i % 3) ? "," : "") + acc;
	}, "") + "." + p[1];
};

var getFrontRunner = function(pollingData) {
	var leadingCandidate = {
		"candidate": "",
		"percent": 0,
	}

	$.each(pollingData, function(candidate, percent) {
		if (percent > leadingCandidate.percent) {
			leadingCandidate.candidate = candidate;
			leadingCandidate.percent = percent;
		}
	});

	return leadingCandidate;
};
