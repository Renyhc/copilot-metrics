const sinon = require('sinon');

const fsMock = {
    promises: {
        writeFile: sinon.stub().resolves(),
    },
    existsSync: sinon.stub().returns(false),
    mkdirSync: sinon.stub(),
    writeFileSync: sinon.stub(),
};

module.exports = fsMock; 