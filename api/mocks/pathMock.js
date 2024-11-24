const path = jest.requireActual('path');

module.exports = {
    ...path,
    join: jest.fn((...args) => path.join(...args)),
}; 