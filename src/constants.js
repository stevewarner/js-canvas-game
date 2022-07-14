export const canvas = document.getElementById('canvas');
export const ctx = canvas.getContext('2d');
export const playerSize = 32;
export const framerate = 30; // Valid values are 60,30,20,15,10...
export const frameMinTime = (1000 / 60) * (60 / framerate) - (1000 / 60) * 0.5;
