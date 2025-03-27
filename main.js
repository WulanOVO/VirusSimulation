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
  avoidInfectedEnabled: true,
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
    // 如果动画帧ID为空，重新启动动画循环
    if (!animationFrameId) {
      startAnimationLoop();
    }
  });

  document.getElementById('pause-btn').addEventListener('click', () => {
    simulationArea.pause();
    // 取消动画帧
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    simulationArea.reset(
      simulationParams.populationSize,
      simulationParams.initialInfected
    );
  });

  // 快速模拟按钮
  document.getElementById('fast-sim-btn').addEventListener('click', () => {
    startFastSimulation();
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

  // 隔离措施
  const quarantineToggle = document.getElementById('quarantine');
  quarantineToggle.addEventListener('change', () => {
    simulationParams.quarantineEnabled = quarantineToggle.checked;
  });

  // 自动停止功能
  const autoStopToggle = document.getElementById('auto-stop');
  autoStopToggle.addEventListener('change', () => {
    simulationParams.autoStopEnabled = autoStopToggle.checked;
    if (simulationArea) {
      simulationArea.autoStopEnabled = autoStopToggle.checked;
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

// 快速模拟函数
function startFastSimulation() {
  // 暂停当前动画循环
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // 重置模拟
  simulationArea.reset(
    simulationParams.populationSize,
    simulationParams.initialInfected
  );

  // 显示加载指示器
  const loadingIndicator = document.getElementById('loading-indicator');
  const progressElement = document.getElementById('simulation-progress');
  loadingIndicator.classList.add('active');

  // 设置模拟参数
  const params = {...simulationParams};

  // 开始快速模拟过程（使用setTimeout以避免UI卡死）
  setTimeout(() => {
    runFastSimulation(params, progressElement, (result) => {
      // 模拟完成后的回调
      loadingIndicator.classList.remove('active');

      // 确保模拟状态重置
      simulationArea.pause();
      simulationArea.frameCount = 0;

      // 更新图表
      const event = new CustomEvent('dataUpdated', { detail: simulationArea.historicalData });
      document.dispatchEvent(event);

      // 重新绘制画布
      simulationArea.draw();

      window.scrollTo(0, document.body.scrollHeight);
    });
  }, 100);
}

// 执行快速模拟
function runFastSimulation(params, progressElement, callback) {
  // 最大天数限制，防止无限循环
  const MAX_DAYS = 365;

  // 标记模拟运行
  simulationArea.isRunning = true;

  // 模拟循环
  let day = 0;

  function simulateNextBatch() {
    // 每次批处理模拟10天
    for (let i = 0; i < 10; i++) {
      // 进行多次更新以模拟一天
      for (let j = 0; j < 10; j++) {
        simulationArea.update(params);
      }

      day++;
      progressElement.textContent = day;

      // 检查是否应该停止
      let stopReason = null;
      if (day >= MAX_DAYS) {
        stopReason = "模拟已完成：达到最大模拟天数";
      } else if (simulationArea.statistics.infected === 0 && simulationArea.statistics.exposed === 0) {
        stopReason = "模拟已完成：没有活跃感染者和潜伏期者";
      } else if (simulationArea.statistics.susceptible === 0 && simulationArea.statistics.infected === 0 && simulationArea.statistics.exposed === 0) {
        stopReason = "模拟已完成：全部人口已被感染过";
      }

      if (stopReason) {
        // 确保模拟停止
        simulationArea.isRunning = false;

        // 使用同样的通知方式显示结束信息
        showNotification(stopReason);

        // 调用回调并传递结果
        callback({day: day, reason: stopReason});
        return;
      }
    }

    // 使用setTimeout允许UI更新
    setTimeout(simulateNextBatch, 0);
  }

  // 开始批处理
  simulateNextBatch();
}

// 显示通知函数
function showNotification(message) {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = 'simulation-notification';

  // 创建通知内容
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.textContent = message;
  notification.appendChild(messageDiv);

  // 创建关闭按钮
  const closeButton = document.createElement('button');
  closeButton.className = 'close-notification';
  closeButton.innerHTML = '<i class="fas fa-times"></i>';
  closeButton.addEventListener('click', () => {
    notification.classList.remove('show');
    // 移除元素
    setTimeout(() => {
      notification.remove();
    }, 500); // 等待过渡效果完成
  });
  notification.appendChild(closeButton);

  // 添加到页面
  document.body.appendChild(notification);

  // 触发显示动画（使用延迟以确保过渡效果生效）
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // 5秒后自动隐藏
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 500);
    }
  }, 5000);
}

// 窗口加载完成后初始化
window.addEventListener('load', () => {
  initialize();
});