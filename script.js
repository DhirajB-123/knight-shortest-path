function coordinatesToString([x, y]) {
  let string = "";
  string += x;
  string += y;
  return string;
}

function stringToCoordinates(string) {
  let x = parseInt(string[0]);
  let y = parseFloat(string[1]);
  let coordinates = [x, y];
  return coordinates;
}

let inputs = [];

function handleInputs(e) {
  console.log(e.path[0].id);
  if (inputs.length == 1) {
    inputs.push(e.path[0].id);
    console.log(findShortestPath(inputs[0], inputs[1]));
    inputs = [];
  } else if (inputs.length == 0) {
    inputs.push(e.path[0].id);
  }
}

function clickToReset() {
  console.log("reset");
}

function generateSquare([x, y], i) {
  let grid = document.getElementById("board");
  let square = document.createElement("div");
  square.id = coordinatesToString([x, y]);
  square.classList = "square";
  if (i % 2 === 0) {
    square.classList.add("dark");
  }
  square.addEventListener("click", handleInputs);
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
  let i = 0;
  for (let x = 1; x < 9; x++, i++) {
    for (let y = 1; y < 9; y++, i++) {
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

let visitedSquares = {};

function findShortestPath(coordString, goal) {
  visitedSquares[coordString] = null;
  let queue = queueFactory();
  queue.enqueue(coordString);
  while (queue.length != 0) {
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
}
