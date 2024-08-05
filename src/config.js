console.log("hello");

export let current_speed = 5;
export let bullets = [];
export let bulletCount = 0;
export let enemies = [];
export let enemyCount = 0;
export let mouseY = 0;
export let mouseX = 0;
export let angle_in_deg;
export let keysPressed = {};
export let lost_game = false;
export let spawningID;

export let playerTop = 0;
export let playerLeft = 0;
export let PLAYER_OFFSET_X = 0;
export let PLAYER_OFFSET_Y = 0;
export let RELOADING = false;
export let SPEED = 5;
export const SHOOT_KEY_1 = "";
export const SHOOT_KEY_2 = null;
export const BOOST_KEY = " ";
export const UP_KEY = "w" || "W";
export const LEFT_KEY = "a" || "A";
export const DOWN_KEY = "s" || "S";
export const RIGHT_KEY = "d" || "D";

export const PLAYER_WIDTH = 30;
export const PLAYER_HEIGHT = 60;
export const BULLET_SPEED = 10;
export const ENEMY_SPEED = 5;
export const MAX_BULLETS = 5;
export const MAX_ENEMIES = 40;
export const ENEMY_MINW = 40;
export const ENEMY_MAXW = 50;
export const SPAWN_RATE = 1000; // in ms
