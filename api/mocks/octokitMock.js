const sinon = require('sinon');
const schemaMockData = require('./schemaMockData.json');

class OctokitMock {
    constructor() {
        this.request = sinon.stub();
        
        this.request.withArgs('GET /orgs/{org}/copilot/metrics', sinon.match.object).resolves({
            data: schemaMockData
        });

        this.request.withArgs('GET /enterprises/{enterprise}/copilot/metrics', sinon.match.object).resolves({
            data: schemaMockData
        });

        this.request.withArgs('GET /orgs/{org}/team/{team_slug}/copilot/metrics', sinon.match.object).resolves({
            data: schemaMockData
        });
    }
}

module.exports = { OctokitMock }; 