let simulationArea;
let chartManager;
let domManager;
let simulationController;

// 模拟参数
const simulationParams = {
  populationSize: 200,
  initialInfected: 5,
  infectionRate: 30,
  infectionRadius: 15,
  incubationPeriod: 5,
  recoveryTime: 14,
  mortalityRate: 5,
  movementSpeed: 3,
  simulationSpeed: 5,
  quarantineEnabled: false,
  avoidInfectedEnabled: true,
  autoStopEnabled: true,
  canvasSize: 500,
  simulationCount: 10 // 批量模拟次数默认值
};

// 初始化函数
function initialize() {
  // 初始化DOM管理器
  domManager = new DOMManager();
  domManager.initialize();

  // 获取并设置画布尺寸
  const canvas = domManager.resizeCanvas(simulationParams.canvasSize, simulationParams.canvasSize);

  // 初始化模拟区域
  simulationArea = new SimulationArea(canvas);
  simulationArea.initialize(
    simulationParams.populationSize,
    simulationParams.initialInfected
  );
  simulationArea.autoStopEnabled = simulationParams.autoStopEnabled;

  // 初始化图表管理器
  chartManager = new ChartManager();
  chartManager.initialize();

  // 初始化模拟控制器
  simulationController = new SimulationController(simulationArea, chartManager, domManager);

  // 设置事件监听器
  setupEventListeners();

  // 开始动画循环
  simulationController.startAnimationLoop(simulationParams);

  // 添加ESC键监听，用于关闭对话框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      domManager.hideBatchSimulationDialog();
    }
  });
}

// 设置事件监听器
function setupEventListeners() {
  // 定义回调函数
  const simulationCallbacks = {
    onStart: () => {
      simulationArea.start();
      simulationController.startAnimationLoop(simulationParams);
    },

    onPause: () => {
      simulationArea.pause();
      simulationController.stopAnimationLoop();
    },

    onReset: (params) => {
      simulationArea.reset(params.populationSize, params.initialInfected);
    },

    onFastSim: () => {
      simulationController.runFastSimulation(simulationParams);
    },

    onBatchSim: () => {
      // 这个回调现在只在对话框中确认后才会触发
      simulationController.runBatchSimulation(simulationParams);
    },

    onAutoStopToggle: (enabled) => {
      simulationArea.autoStopEnabled = enabled;
    },

    onApplySize: (size) => {
      const isRunning = simulationArea.isRunning;

      // 如果模拟正在运行，先暂停
      if (isRunning) {
        simulationArea.pause();
        simulationController.stopAnimationLoop();
      }

      // 调整场地尺寸
      domManager.resizeCanvas(size, size);
      simulationArea.resizeCanvas(size, size);

      // 如果之前正在运行，恢复运行
      if (isRunning) {
        simulationArea.start();
        simulationController.startAnimationLoop(simulationParams);
      }
    }
  };

  // 使用DOM管理器设置事件监听器
  domManager.setupEventListeners(simulationParams, simulationCallbacks);
}

// 窗口加载完成后初始化
window.addEventListener('load', () => {
  initialize();
});