const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS = ["♥", "♦", "♣", "♠"];

const board = document.querySelector("#board");
const movesLabel = document.querySelector("#moves");
const winLabel = document.querySelector("#win");
const drawModeButton = document.querySelector("#draw-mode");

let drawCount = 1;
let moves = 0;
let stock = [];
let waste = [];
let foundations = [[], [], [], []];
let tableau = [[], [], [], [], [], [], []];
let selected = null;

function isRed(card) {
  return card.s < 2;
}

function shuffle(cards) {
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function newGame() {
  const deck = [];
  for (let s = 0; s < 4; s += 1) {
    for (let r = 1; r <= 13; r += 1) deck.push({ r, s, up: false });
  }
  shuffle(deck);
  tableau = [[], [], [], [], [], [], []];
  for (let row = 0; row < 7; row += 1) {
    for (let column = row; column < 7; column += 1) {
      const card = deck.pop();
      card.up = row === column;
      tableau[column].push(card);
    }
  }
  stock = deck;
  waste = [];
  foundations = [[], [], [], []];
  selected = null;
  moves = 0;
  render();
}

function pileTop(pile) {
  return pile[pile.length - 1];
}

function canFoundation(card, pile) {
  if (!card) return false;
  if (pile.length === 0) return card.r === 1;
  const current = pileTop(pile);
  return current.s === card.s && card.r === current.r + 1;
}

function canTableau(card, column) {
  if (column.length === 0) return card.r === 13;
  const current = pileTop(column);
  if (!current.up) return false;
  return isRed(card) !== isRed(current) && card.r === current.r - 1;
}

function sequenceFrom(column, index) {
  return column.slice(index);
}

function sequenceIsMovable(column, index) {
  const cards = sequenceFrom(column, index);
  if (cards.length === 0 || cards.some((card) => !card.up)) return false;
  for (let i = 1; i < cards.length; i += 1) {
    if (isRed(cards[i]) === isRed(cards[i - 1])) return false;
    if (cards[i].r !== cards[i - 1].r - 1) return false;
  }
  return true;
}

function flipTop(column) {
  const card = pileTop(column);
  if (card && !card.up) card.up = true;
}

function sourceCards() {
  if (!selected) return [];
  if (selected.kind === "waste") return waste.length ? [pileTop(waste)] : [];
  if (selected.kind === "foundation") return foundations[selected.index].length ? [pileTop(foundations[selected.index])] : [];
  return sequenceFrom(tableau[selected.index], selected.cardIndex);
}

function takeSource() {
  if (selected.kind === "waste") return [waste.pop()];
  if (selected.kind === "foundation") return [foundations[selected.index].pop()];
  return tableau[selected.index].splice(selected.cardIndex);
}

function tryMoveToFoundation(foundationIndex) {
  const cards = sourceCards();
  if (cards.length !== 1 || !canFoundation(cards[0], foundations[foundationIndex])) return false;
  foundations[foundationIndex].push(takeSource()[0]);
  if (selected.kind === "tableau") flipTop(tableau[selected.index]);
  selected = null;
  moves += 1;
  return true;
}

function tryMoveToTableau(columnIndex) {
  const cards = sourceCards();
  if (!cards.length || !canTableau(cards[0], tableau[columnIndex])) return false;
  if (selected.kind === "tableau" && selected.index === columnIndex) return false;
  tableau[columnIndex].push(...takeSource());
  if (selected.kind === "tableau") flipTop(tableau[selected.index]);
  selected = null;
  moves += 1;
  return true;
}

function autoFoundation() {
  const cards = sourceCards();
  if (cards.length !== 1) return false;
  const index = foundations.findIndex((pile) => canFoundation(cards[0], pile));
  if (index === -1) return false;
  return tryMoveToFoundation(index);
}

function draw() {
  selected = null;
  if (stock.length === 0) {
    stock = waste.reverse();
    waste = [];
    stock.forEach((card) => { card.up = false; });
    render();
    return;
  }
  const count = Math.min(drawCount, stock.length);
  for (let i = 0; i < count; i += 1) {
    const card = stock.pop();
    card.up = true;
    waste.push(card);
  }
  render();
}

function won() {
  return foundations.every((pile) => pile.length === 13);
}

function cardButton(card, action, isSelected) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `card-btn${card && isRed(card) ? " red" : ""}${!card || !card.up ? " back" : ""}${isSelected ? " selected" : ""}`;
  button.textContent = card && card.up ? `${RANKS[card.r - 1]}${SUITS[card.s]}` : "Card";
  if (!card || !card.up) button.setAttribute("aria-label", "Face-down card");
  button.addEventListener("click", action);
  return button;
}

function slot(label, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "slot";
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

function sameSelection(next) {
  return selected && selected.kind === next.kind && selected.index === next.index && selected.cardIndex === next.cardIndex;
}

function render() {
  board.replaceChildren();
  const piles = document.createElement("div");
  piles.className = "piles";
  piles.appendChild(stock.length ? cardButton(null, draw) : slot("Stock", draw));
  if (waste.length) {
    piles.appendChild(cardButton(pileTop(waste), () => {
      const next = { kind: "waste", index: 0, cardIndex: 0 };
      if (sameSelection(next)) autoFoundation();
      else selected = next;
      render();
    }, selected && selected.kind === "waste"));
  } else {
    piles.appendChild(slot("Waste", () => {}));
  }
  foundations.forEach((pile, index) => {
    const action = () => {
      if (selected) {
        tryMoveToFoundation(index);
        render();
        return;
      }
      if (pile.length) selected = { kind: "foundation", index, cardIndex: 0 };
      render();
    };
    piles.appendChild(pile.length
      ? cardButton(pileTop(pile), action, selected && selected.kind === "foundation" && selected.index === index)
      : slot("Ace", action));
  });
  board.appendChild(piles);

  const table = document.createElement("div");
  table.className = "tableau";
  tableau.forEach((column, columnIndex) => {
    const element = document.createElement("div");
    element.className = "column";
    if (column.length === 0) {
      element.appendChild(slot("Empty", () => {
        if (selected) tryMoveToTableau(columnIndex);
        render();
      }));
    }
    column.forEach((card, cardIndex) => {
      element.appendChild(cardButton(card, () => {
        if (!card.up) {
          if (cardIndex === column.length - 1) card.up = true;
          selected = null;
          render();
          return;
        }
        if (!sequenceIsMovable(column, cardIndex)) return;
        const next = { kind: "tableau", index: columnIndex, cardIndex };
        if (sameSelection(next)) {
          if (!autoFoundation()) selected = null;
        } else if (selected) {
          if (!tryMoveToTableau(columnIndex)) selected = next;
        } else {
          selected = next;
        }
        render();
      }, selected && selected.kind === "tableau" && selected.index === columnIndex && selected.cardIndex === cardIndex));
    });
    table.appendChild(element);
  });
  board.appendChild(table);
  movesLabel.textContent = `${moves} move${moves === 1 ? "" : "s"}`;
  winLabel.hidden = !won();
}

document.querySelector("#new-game").addEventListener("click", newGame);
drawModeButton.addEventListener("click", () => {
  drawCount = drawCount === 1 ? 3 : 1;
  drawModeButton.textContent = `Draw ${drawCount}`;
});
newGame();
