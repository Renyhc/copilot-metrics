const ChartService = require('../../services/chartService');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const sinon = require('sinon');

jest.mock('canvas', () => {
  const actual = jest.requireActual('canvas');
  return {
    ...actual,
    createCanvas: jest.fn(() => ({
      getContext: jest.fn(() => ({})),
      toBuffer: jest.fn(() => Buffer.from('fake-buffer')),
    })),
  };
});

describe('ChartService', () => {
  let writeFileSyncStub;
  let existsSyncStub;
  let mkdirSyncStub;

  beforeEach(() => {
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync').returns();
    existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
    mkdirSyncStub = sinon.stub(fs, 'mkdirSync').returns();
    ChartService.setExported(false);
  });

  afterEach(() => {
    sinon.restore();
    jest.clearAllMocks();
  });

  it('debe generar un gráfico sin exportar cuando `exported` es false', async () => {
    const chartData = { labels: ['A', 'B'], datasets: [], chart: {} };
    const result = await ChartService.generateUsersChart(chartData);

    expect(result.chart).toHaveProperty('success', true);
    expect(result.chart).toHaveProperty('message', 'Exportación deshabilitada. El gráfico no se ha guardado.');
    sinon.assert.notCalled(writeFileSyncStub);
  });

  it('debe generar y exportar un gráfico cuando `exported` es true', async () => {
    ChartService.setExported(true);
    const chartData = { labels: ['A', 'B'], datasets: [], chart: {} };
    const result = await ChartService.generateUsersChart(chartData);

    sinon.assert.calledWith(mkdirSyncStub, path.join(__dirname, '../../../exports'), { recursive: true });
    sinon.assert.called(writeFileSyncStub);
    expect(result.chart).toHaveProperty('success', true);
    expect(result.chart).toHaveProperty('filePath');
    expect(result.chart).toHaveProperty('fileName');
  });

  it('debe manejar errores durante la generación del gráfico', async () => {
    const chartData = null; // Datos inválidos para provocar un error

    await expect(ChartService.generateUsersChart(chartData)).rejects.toThrow('Error generando gráfico de Usuarios:');
  });
}); 