const stages = [
  "ghost1.png",
  "golem1.png",
  "monster_1s.png",
  "mummy1.png",
  "skeleton1.png",
  "slime1.png",
  "dragon.png",
];
let canAttack = false;
let player = null;
let enemy = null;
let startBattle = false;
let win = false;
let stageName = document.querySelector('.stageName')

function colorfulText(){
  let text = document.querySelector('.thanks-text')
  const colors = ['black', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white']
  i = 0
  setInterval(() => {
    text.style.color = colors[i%8];
    i++;
  }, 100);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function update() {
  document.querySelector("#playerHPBar").value = parseInt(
    (player.stat.HP / player.stat.MaxHP) * 100
  ).toString();
  document.querySelector("#enemyHPBar").value = parseInt(
    (enemy.stat.HP / enemy.stat.MaxHP) * 100
  ).toString();
}

async function slash() {
  for (let i = 1; i < 7; i++) {
    player.character.style.left = `${30 + i}%`;
    await sleep(8);
  }
  for (let i = 6; i >= 0; i--) {
    player.character.style.left = `${30 + i}%`;
    await sleep(8);
  }
}

class Player {
  character = document.querySelector(".player");
  stat = {
    HP: 1000,
    AP: 20,
    DP: 20,
    MaxHP: 1000,
    MaxP: 40,
  };

  async initialMove() {
    for (let i = 0; i < 31; i++) {
      await sleep(30);
      this.character.style.left = `${i}%`;
    }
  }

  async knockback() {
    for (let i = 1; i < 7; i++) {
      this.character.style.left = `${30 - i}%`;
      await sleep(10);
    }
    for (let i = 6; i >= 0; i--) {
      this.character.style.left = `${30 - i}%`;
      await sleep(10);
    }
  }

  setStat(value) {
    this.stat.AP = Math.round((value / 100) * this.stat.MaxP);
    this.stat.DP = Math.round(((100 - value) / 100) * this.stat.MaxP);
  }

  async attack() {
    if (canAttack) {
      await slash();
      enemy.damage(this.stat.AP);
      await enemy.knockback();
      update();
      canAttack = false;
      setTimeout(() => {
        canAttack = true;
      }, 450);
    }
  }

  damage(value) {
    let attack = value * 10 - this.stat.DP * 7 + (Math.random()*10 > 9 ? value*0.5 : 0);
    this.stat.HP -= attack > 0 ? attack : 1;
  }

  stageComplete() {
    this.stat.MaxP += this.stat.HP > this.stat.MaxHP / 2 ? 7 : 5;
    this.stat.MaxHP += 100;
    this.stat.HP = this.stat.MaxHP;
    document.querySelector("#formControlRange").disabled = false;
  }
}

class Enemy {
  character = document.querySelector(".enemy");
  stat = {
    HP: 850,
    AP: 18,
    DP: 16,
    MaxHP: 850,
  };
  constructor(url) {
    document.querySelector(".enemy img").src = `./Image/Enemy/${url}`;
  }

  set(url) {
    document.querySelector(".enemy img").src = `./Image/Enemy/${url}`;
    this.stat.HP += 100;
    this.stat.MaxHP += 100;
    this.stat.AP += 3;
    this.stat.DP += 3;
  }

  async initialMove() {
    let i = 1;
    while (
      this.character.getBoundingClientRect().x -
        player.character.getBoundingClientRect().right > window.innerWidth * -0.02
    ) {
      await sleep(30);
      this.character.style.right = `${i}%`;
      i++;
    }
    this.right = parseInt(this.character.style.right.slice(0, -1));
  }

  async knockback() {
    for (let i = 1; i < 7; i++) {
      this.character.style.right = `${this.right - i}%`;
      await sleep(10);
    }
    for (let i = 6; i > 0; i--) {
      this.character.style.right = `${this.right - i}%`;
      await sleep(10);
    }
  }

  async attack() {
    player.damage(this.stat.AP);
    update();
    await player.knockback();
  }

  damage(value) {
    let attack = value * 10 - this.stat.DP * 7 + (Math.random()*10 > 8 ? value*0.5 : 0);
    this.stat.HP -= attack > 0 ? attack : 1;
  }

  stageComplete() {
    this.character.style.right = "0";
    this.stat.HP = this.stat.MaxHP;
  }
}

async function main() {
  player = new Player();
  enemy = new Enemy(stages[0]);
  await player.initialMove();
  let stageNum = 1;
  while (stageNum < stages.length + 1) {
    update();
    win = false;
    stageName.innerHTML = `스테이지 ${stageNum}(s를 눌러 시작하세요)`;
    enemy.set(stages[stageNum - 1]);
    await enemy.initialMove();
    while (!startBattle) {
      await sleep(100);
    }
    stageName.innerHTML = `스테이지 ${stageNum}`;
    canAttack = true;
    await attackProcess();
    if (win) {
      stageNum++;
    }
  }
  player.character.style.display = 'none'
  enemy.character.style.display = 'none'
  document.querySelector('.row').style.display = 'none'
  stageName.innerHTML = '축하합니다! 모든 스테이지를 통과하셨습니다!'
  document.querySelector('.end-comment').style.display = 'inline';
  colorfulText();
}

async function attackProcess() {
  let slider = document.querySelector("#formControlRange");
  slider.disabled = true;
  player.setStat(parseInt(slider.value));
  while (enemy.stat.HP > 0 && player.stat.HP > 0) {
    await enemy.attack();
    await sleep(500);
  }
  if (enemy.stat.HP <= 0) {
    win = true;
  } else {
    win = false;
  }
  startBattle = false;
  canAttack = false;
  enemy.stageComplete();
  player.stageComplete();
}

document.addEventListener("keyup", async (key) => {
  if (key.code === "KeyS") {
    startBattle = true;
  }
  if (key.code === "Space" && startBattle && canAttack) {
    await player.attack();
  }
});
main();
