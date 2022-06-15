export const getAngleFromCoords = (x1, y1, x2, y2, rtrnVal) => {
    let deltaX = x2 - x1;
    let deltaY = y2 - y1;
    let rad = Math.atan2(deltaY, deltaX); // In radians
    let deg = rad * (180 / Math.PI);
    if (rtrnVal === 'rad') {
        return rad;
    } else {
        return deg;
    }
};

export const getDistanceFromCoords = (x1, y1, x2, y2) => {
    let deltaX = x2 - x1;
    let deltaY = y2 - y1;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

export const randomNum = (min, max) => {
    return Math.random() * (max - min) + min;
};
