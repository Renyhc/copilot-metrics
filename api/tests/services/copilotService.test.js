const { OctokitMock } = require('../../mocks/octokitMock');
const CopilotService = require('../../services/copilotService');
const MetricsTransformService = require('../../services/metricsTransformService');
const ChartService = require('../../services/chartService');
const ExportService = require('../../services/exportService');

const { mockTransformedData } = require('../../mocks/mockTransformedData');
const { mockChartResult } = require('../../mocks/mockChartResult');
const { mockExportResult } = require('../../mocks/mockExportResult');

// Mockear @octokit/core para que utilice OctokitMock
jest.mock('@octokit/core', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => new OctokitMock()),
  };
});

describe('CopilotService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mockear los servicios
    jest.spyOn(MetricsTransformService.prototype, 'getUsers').mockReturnValue(mockTransformedData);
    jest.spyOn(ChartService.prototype, 'generateUsersChart').mockResolvedValue(mockChartResult.usersChart);
    jest.spyOn(ExportService.prototype, 'exportMetricsToJson').mockResolvedValue(mockExportResult);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debe obtener métricas organizacionales correctamente', async () => {
    const result = await CopilotService.getOrgMetrics();

    // Obtener la instancia de Octokit mockeada
    const octokitInstance = require('@octokit/core').Octokit.mock.instances[0];
    const requestMock = octokitInstance.request;

    // Verificar que request haya sido llamado correctamente
    expect(requestMock).toHaveBeenCalledWith('GET /orgs/{org}/copilot/metrics', expect.any(Object));

    // Verificar que otros métodos hayan sido llamados
    expect(MetricsTransformService.prototype.getUsers).toHaveBeenCalledWith(expect.any(Object));
    expect(ChartService.prototype.generateUsersChart).toHaveBeenCalledWith(mockTransformedData);
    expect(ExportService.prototype.exportMetricsToJson).toHaveBeenCalledWith({
      raw: mockTransformedData,
      charts: mockChartResult
    }, 'organization');

    // Verificar las propiedades del resultado
    expect(result).toEqual({
      raw: mockTransformedData,
      charts: {
        usersChart: mockChartResult.usersChart
      },
      export: mockExportResult
    });
  });

  it('debe manejar errores al obtener métricas organizacionales', async () => {
    // Simular un error en la solicitud
    const octokitInstance = require('@octokit/core').Octokit.mock.instances[0];
    const requestMock = octokitInstance.request;
    requestMock.mockRejectedValueOnce(new Error('API Error'));

    await expect(CopilotService.getOrgMetrics()).rejects.toThrow('Error fetching organization metrics: API Error');
  });
}); 
