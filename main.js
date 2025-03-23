// 主控制模块

// 全局变量
let simulationArea;
let chartManager;
let animationFrameId;

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
  autoStopEnabled: true,
  canvasSize: 500
};

// 初始化函数
function initialize() {
  // 获取画布并设置尺寸
  const canvas = document.getElementById('simulation-canvas');
  canvas.width = simulationParams.canvasSize;
  canvas.height = simulationParams.canvasSize;

  // 初始化模拟区域
  simulationArea = new SimulationArea(canvas);
  simulationArea.initialize(
    simulationParams.populationSize,
    simulationParams.initialInfected
  );

  // 初始化图表管理器
  chartManager = new ChartManager();
  chartManager.initialize();

  // 设置事件监听器
  setupEventListeners();

  // 开始动画循环
  startAnimationLoop();
}

// 设置事件监听器
function setupEventListeners() {
  // 控制按钮
  document.getElementById('start-btn').addEventListener('click', () => {
    simulationArea.start();
  });

  document.getElementById('pause-btn').addEventListener('click', () => {
    simulationArea.pause();
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    simulationArea.reset(
      simulationParams.populationSize,
      simulationParams.initialInfected
    );
  });

  // 人口参数
  const populationSizeSlider = document.getElementById('population-size');
  const populationSizeValue = document.getElementById('population-size-value');

  populationSizeSlider.addEventListener('input', () => {
    simulationParams.populationSize = parseInt(populationSizeSlider.value);
    populationSizeValue.textContent = simulationParams.populationSize;
  });

  const initialInfectedSlider = document.getElementById('initial-infected');
  const initialInfectedValue = document.getElementById('initial-infected-value');

  initialInfectedSlider.addEventListener('input', () => {
    simulationParams.initialInfected = parseInt(initialInfectedSlider.value);
    initialInfectedValue.textContent = simulationParams.initialInfected;
  });

  // 病毒参数
  const infectionRateSlider = document.getElementById('infection-rate');
  const infectionRateValue = document.getElementById('infection-rate-value');

  infectionRateSlider.addEventListener('input', () => {
    simulationParams.infectionRate = parseInt(infectionRateSlider.value);
    infectionRateValue.textContent = `${simulationParams.infectionRate}%`;
  });

  const infectionRadiusSlider = document.getElementById('infection-radius');
  const infectionRadiusValue = document.getElementById('infection-radius-value');

  infectionRadiusSlider.addEventListener('input', () => {
    simulationParams.infectionRadius = parseInt(infectionRadiusSlider.value);
    infectionRadiusValue.textContent = simulationParams.infectionRadius;
  });

  // 潜伏期滑块
  const incubationPeriodSlider = document.getElementById('incubation-period');
  const incubationPeriodValue = document.getElementById('incubation-period-value');

  incubationPeriodSlider.addEventListener('input', () => {
    simulationParams.incubationPeriod = parseInt(incubationPeriodSlider.value);
    incubationPeriodValue.textContent = simulationParams.incubationPeriod;
  });

  const recoveryTimeSlider = document.getElementById('recovery-time');
  const recoveryTimeValue = document.getElementById('recovery-time-value');

  recoveryTimeSlider.addEventListener('input', () => {
    simulationParams.recoveryTime = parseInt(recoveryTimeSlider.value);
    recoveryTimeValue.textContent = simulationParams.recoveryTime;
  });

  const mortalityRateSlider = document.getElementById('mortality-rate');
  const mortalityRateValue = document.getElementById('mortality-rate-value');

  mortalityRateSlider.addEventListener('input', () => {
    simulationParams.mortalityRate = parseInt(mortalityRateSlider.value);
    mortalityRateValue.textContent = `${simulationParams.mortalityRate}%`;
  });

  // 行为参数
  const movementSpeedSlider = document.getElementById('movement-speed');
  const movementSpeedValue = document.getElementById('movement-speed-value');

  movementSpeedSlider.addEventListener('input', () => {
    simulationParams.movementSpeed = parseInt(movementSpeedSlider.value);
    movementSpeedValue.textContent = simulationParams.movementSpeed;
  });

  const simulationSpeedSlider = document.getElementById('simulation-speed');
  const simulationSpeedValue = document.getElementById('simulation-speed-value');

  simulationSpeedSlider.addEventListener('input', () => {
    simulationParams.simulationSpeed = parseInt(simulationSpeedSlider.value);
    simulationSpeedValue.textContent = simulationParams.simulationSpeed;
  });

  const quarantineCheckbox = document.getElementById('quarantine');

  quarantineCheckbox.addEventListener('change', () => {
    simulationParams.quarantineEnabled = quarantineCheckbox.checked;
  });

  // 自动停止功能
  const autoStopCheckbox = document.getElementById('auto-stop');

  autoStopCheckbox.addEventListener('change', () => {
    simulationParams.autoStopEnabled = autoStopCheckbox.checked;
    if (simulationArea) {
      simulationArea.autoStopEnabled = autoStopCheckbox.checked;
    }
  });

  // 场地尺寸设置
  const canvasSizeSlider = document.getElementById('canvas-size');
  const canvasSizeValue = document.getElementById('canvas-size-value');

  canvasSizeSlider.addEventListener('input', () => {
    simulationParams.canvasSize = parseInt(canvasSizeSlider.value);
    canvasSizeValue.textContent = simulationParams.canvasSize;
  });

  // 应用场地尺寸按钮
  const applySizeBtn = document.getElementById('apply-size-btn');

  applySizeBtn.addEventListener('click', () => {
    if (simulationArea) {
      const isRunning = simulationArea.isRunning;

      // 如果模拟正在运行，先暂停
      if (isRunning) {
        simulationArea.pause();
      }

      // 调整场地尺寸
      simulationArea.resizeCanvas(
        simulationParams.canvasSize,
        simulationParams.canvasSize
      );

      // 如果之前正在运行，恢复运行
      if (isRunning) {
        simulationArea.start();
      }
    }
  });
}

// 动画循环
function startAnimationLoop() {
  let frameCounter = 0;

  function animate() {
    // 根据模拟速度控制更新频率
    frameCounter++;

    // 当frameCounter是simulationSpeed的倍数时更新模拟
    // 速度值越大，更新越频繁（simulationSpeed=10时每帧都更新）
    if (frameCounter % (11 - simulationParams.simulationSpeed) === 0) {
      // 更新模拟
      simulationArea.update(simulationParams);
      frameCounter = 0;
    }

    // 绘制模拟（每帧都绘制以保持流畅的视觉效果）
    simulationArea.draw();

    // 请求下一帧
    animationFrameId = requestAnimationFrame(animate);
  }

  // 开始动画循环
  animate();
}

// 窗口加载完成后初始化
window.addEventListener('load', () => {
  initialize();
});

// 窗口大小改变时调整画布大小
window.addEventListener('resize', () => {
  // 不需要自动调整画布尺寸了，由用户控制
});