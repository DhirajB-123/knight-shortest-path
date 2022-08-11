let blockedSqaures = {};
let inputs = [];

const messages = [
	"Left click: select start and goal \n Right click: block squares",
	"Shortest path was found! \n Click the board to reset.",
	"No path from start to goal. \n Click the board to reset.",
];

function coordinatesToString([x, y]) {
	let string = "";
	string += x;
	string += y;
	return string;
}

function handleResults(path) {
	if (path != null) {
		path = path.split(" ");
		path.pop();
		path.shift();
		let i = 1;
		path.forEach((id) => {
			let square = document.getElementById(id);
			square.classList.add("path");
			square.innerText = i;
			i++;
		});
		msg.innerText = messages[1];
	} else {
		msg.innerText = messages[2];
	}
}

function handleInputs(e) {
	let msg = document.getElementById("msg");
	let clickedSquare = e.path[0];
	if (inputs.length == 1) {
		inputs.push(clickedSquare.id);
		clickedSquare.classList.add("selected");
		let path = findShortestPath(inputs[0], inputs[1]);
		handleResults(path);
	} else if (inputs.length == 0) {
		inputs.push(clickedSquare.id);
		clickedSquare.classList.add("selected");
	} else {
		let blockedSquares = document.querySelectorAll(".blocked");
		let selectedSquares = document.querySelectorAll(".selected");
		let pathSquares = document.querySelectorAll(".path");
		blockedSquares.forEach((square) => unblockSquare(square));
		selectedSquares.forEach((square) => square.classList.remove("selected"));
		pathSquares.forEach((square) => {
			square.classList.remove("path");
			square.innerText = "";
		});
		inputs = [];
		msg.innerText = messages[0];
	}
}

function unblockSquare(square) {
	square.classList.remove("blocked");
	delete blockedSqaures[square.id];
	square.addEventListener("click", handleInputs);
}

function handleBlock(e) {
	e.preventDefault();
	let square = document.getElementById(e.path[0].id);
	if (e.path[0].classList.contains("blocked")) {
		unblockSquare(square);
	} else {
		square.classList.add("blocked");
		blockedSqaures[square.id] = null;
		square.removeEventListener("click", handleInputs);
	}
}

function generateSquare([x, y], i) {
	let grid = document.getElementById("gameboard");
	let square = document.createElement("div");
	square.id = coordinatesToString([x, y]);
	square.classList = "square";
	if (i % 2 === 0) {
		square.classList.add("dark");
	}
	square.addEventListener("click", handleInputs);
	square.addEventListener("contextmenu", handleBlock);
	grid.appendChild(square);
}

const graph = (function generateGraph() {
	let pairs = {};
	const deltas = [
		[1, 2],
		[2, 1],
		[2, -1],
		[1, -2],
		[-1, -2],
		[-2, -1],
		[-2, 1],
		[-1, 2],
	];
	function generateMoves([x, y]) {
		let possibleMoves = [];
		deltas.forEach((change) => {
			let xNew = x + change[0];
			let yNew = y + change[1];
			if (xNew > 0 && xNew < 9 && yNew > 0 && yNew < 9) {
				possibleMoves.push([xNew, yNew]);
			}
		});
		return possibleMoves;
	}
	let i = 1;
	for (let y = 8; y > 0; y--, i++) {
		for (let x = 1; x < 9; x++, i++) {
			pairs[coordinatesToString([x, y])] = generateMoves([x, y]);
			generateSquare([x, y], i);
		}
	}
	return pairs;
})();

const nodeFactory = (element) => {
	let next = null;
	return { element, next };
};

const queueFactory = () => {
	let head = null;
	let length = 0;
	function enqueue(element) {
		let node = nodeFactory(element);
		let current;
		if (this.head === null) {
			this.head = node;
			this.tail = node;
		} else {
			current = this.head;
			while (current.next) {
				current = current.next;
			}
			current.next = node;
			this.tail.next = node;
			this.tail = node;
		}
		this.length++;
	}
	function dequeue() {
		if (this.head === null) {
			return null;
		} else if (this.length === 1) {
			let removed = this.head;
			this.head = null;
			this.tail = null;
			length--;
			return removed;
		} else {
			let removed = this.head;
			this.head = this.head.next;
			removed.next = null;
			length--;
			return removed;
		}
	}

	return { head, length, enqueue, dequeue };
};

function findShortestPath(coordString, goal) {
	let visitedSquares = {};
	visitedSquares = structuredClone(blockedSqaures);
	visitedSquares[coordString] = null;
	let queue = queueFactory();
	queue.enqueue(coordString);
	while (queue.head != null) {
		let current = queue.dequeue().element;
		if (current === goal) {
			let path = current;
			let previous = visitedSquares[current];
			while (!(previous === null)) {
				path = previous + " " + path;
				previous = visitedSquares[previous];
			}
			visitedSquares = {};
			return path;
		}
		graph[current].forEach((e) => {
			edge = coordinatesToString(e);
			if (!(edge in visitedSquares)) {
				visitedSquares[edge] = current;
				queue.enqueue(edge);
			}
		});
	}
	return null;
}
