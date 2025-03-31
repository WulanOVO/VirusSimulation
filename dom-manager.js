// DOM管理器类
class DOMManager {
  constructor() {
    this.elements = {};
    this.callbacks = {};
  }

  // 初始化DOM元素引用
  initialize() {
    // 获取控制按钮
    this.elements.startBtn = document.getElementById('start-btn');
    this.elements.pauseBtn = document.getElementById('pause-btn');
    this.elements.resetBtn = document.getElementById('reset-btn');
    this.elements.fastSimBtn = document.getElementById('fast-sim-btn');
    this.elements.batchSimBtn = document.getElementById('batch-sim-btn'); // 批量模拟按钮

    // 获取人口参数元素
    this.elements.populationSizeSlider = document.getElementById('population-size');
    this.elements.populationSizeValue = document.getElementById('population-size-value');
    this.elements.initialInfectedSlider = document.getElementById('initial-infected');
    this.elements.initialInfectedValue = document.getElementById('initial-infected-value');

    // 获取病毒参数元素
    this.elements.infectionRateSlider = document.getElementById('infection-rate');
    this.elements.infectionRateValue = document.getElementById('infection-rate-value');
    this.elements.infectionRadiusSlider = document.getElementById('infection-radius');
    this.elements.infectionRadiusValue = document.getElementById('infection-radius-value');
    this.elements.incubationPeriodSlider = document.getElementById('incubation-period');
    this.elements.incubationPeriodValue = document.getElementById('incubation-period-value');
    this.elements.recoveryTimeSlider = document.getElementById('recovery-time');
    this.elements.recoveryTimeValue = document.getElementById('recovery-time-value');
    this.elements.mortalityRateSlider = document.getElementById('mortality-rate');
    this.elements.mortalityRateValue = document.getElementById('mortality-rate-value');

    // 获取行为参数元素
    this.elements.movementSpeedSlider = document.getElementById('movement-speed');
    this.elements.movementSpeedValue = document.getElementById('movement-speed-value');
    this.elements.simulationSpeedSlider = document.getElementById('simulation-speed');
    this.elements.simulationSpeedValue = document.getElementById('simulation-speed-value');

    // 获取批量模拟对话框元素
    this.elements.batchSimulationDialog = document.getElementById('batch-simulation-dialog');
    this.elements.closeModalBtn = document.querySelector('.close-modal-btn');
    this.elements.batchSimulationCountSlider = document.getElementById('batch-simulation-count');
    this.elements.batchSimulationCountValue = document.getElementById('batch-simulation-count-value');
    this.elements.startBatchSimBtn = document.getElementById('start-batch-simulation-btn');

    // 获取开关元素
    this.elements.quarantineToggle = document.getElementById('quarantine');
    this.elements.autoStopToggle = document.getElementById('auto-stop');

    // 获取场地尺寸元素
    this.elements.canvasSizeSlider = document.getElementById('canvas-size');
    this.elements.canvasSizeValue = document.getElementById('canvas-size-value');
    this.elements.applySizeBtn = document.getElementById('apply-size-btn');

    // 获取加载指示器
    this.elements.loadingIndicator = document.getElementById('loading-indicator');
    this.elements.progressElement = document.getElementById('simulation-progress');
    this.elements.loadingText = document.getElementById('loading-text');

    // 获取模拟画布
    this.elements.canvas = document.getElementById('simulation-canvas');
  }

  // 设置所有事件监听器
  setupEventListeners(params, simulationCallbacks) {
    this.callbacks = simulationCallbacks;

    // 控制按钮事件
    this.elements.startBtn.addEventListener('click', this.callbacks.onStart);
    this.elements.pauseBtn.addEventListener('click', this.callbacks.onPause);
    this.elements.resetBtn.addEventListener('click', () => this.callbacks.onReset(params));
    this.elements.fastSimBtn.addEventListener('click', this.callbacks.onFastSim);

    // 添加批量模拟按钮事件 - 现在点击只是显示对话框
    if (this.elements.batchSimBtn) {
      this.elements.batchSimBtn.addEventListener('click', () => {
        this.showBatchSimulationDialog();
      });
    }

    // 批量模拟对话框事件
    if (this.elements.batchSimulationDialog) {
      // 关闭对话框按钮
      this.elements.closeModalBtn.addEventListener('click', () => {
        this.hideBatchSimulationDialog();
      });

      // 设置批量模拟次数滑块事件
      this.setupSliderEvent(
        this.elements.batchSimulationCountSlider,
        this.elements.batchSimulationCountValue,
        (value) => {
          params.simulationCount = value;
          this.elements.batchSimulationCountValue.textContent = value;
        }
      );

      // 开始批量模拟按钮
      this.elements.startBatchSimBtn.addEventListener('click', () => {
        // 获取设置的模拟次数
        const simulationCount = parseInt(this.elements.batchSimulationCountSlider.value);
        params.simulationCount = simulationCount;

        // 隐藏对话框
        this.hideBatchSimulationDialog();

        // 开始批量模拟
        this.callbacks.onBatchSim();
      });

      // 点击对话框外部关闭对话框
      this.elements.batchSimulationDialog.addEventListener('click', (e) => {
        if (e.target === this.elements.batchSimulationDialog) {
          this.hideBatchSimulationDialog();
        }
      });
    }

    // 人口参数事件
    this.setupSliderEvent(
      this.elements.populationSizeSlider,
      this.elements.populationSizeValue,
      (value) => {
        params.populationSize = value;
        this.elements.populationSizeValue.textContent = value;
      }
    );

    this.setupSliderEvent(
      this.elements.initialInfectedSlider,
      this.elements.initialInfectedValue,
      (value) => {
        params.initialInfected = value;
        this.elements.initialInfectedValue.textContent = value;
      }
    );

    // 病毒参数事件
    this.setupSliderEvent(
      this.elements.infectionRateSlider,
      this.elements.infectionRateValue,
      (value) => {
        params.infectionRate = value;
        this.elements.infectionRateValue.textContent = `${value}%`;
      }
    );

    this.setupSliderEvent(
      this.elements.infectionRadiusSlider,
      this.elements.infectionRadiusValue,
      (value) => {
        params.infectionRadius = value;
        this.elements.infectionRadiusValue.textContent = value;
      }
    );

    this.setupSliderEvent(
      this.elements.incubationPeriodSlider,
      this.elements.incubationPeriodValue,
      (value) => {
        params.incubationPeriod = value;
        this.elements.incubationPeriodValue.textContent = value;
      }
    );

    this.setupSliderEvent(
      this.elements.recoveryTimeSlider,
      this.elements.recoveryTimeValue,
      (value) => {
        params.recoveryTime = value;
        this.elements.recoveryTimeValue.textContent = value;
      }
    );

    this.setupSliderEvent(
      this.elements.mortalityRateSlider,
      this.elements.mortalityRateValue,
      (value) => {
        params.mortalityRate = value;
        this.elements.mortalityRateValue.textContent = `${value}%`;
      }
    );

    // 行为参数事件
    this.setupSliderEvent(
      this.elements.movementSpeedSlider,
      this.elements.movementSpeedValue,
      (value) => {
        params.movementSpeed = value;
        this.elements.movementSpeedValue.textContent = value;
      }
    );

    this.setupSliderEvent(
      this.elements.simulationSpeedSlider,
      this.elements.simulationSpeedValue,
      (value) => {
        params.simulationSpeed = value;
        this.elements.simulationSpeedValue.textContent = value;
      }
    );

    // 隔离措施事件
    this.elements.quarantineToggle.addEventListener('change', () => {
      params.quarantineEnabled = this.elements.quarantineToggle.checked;
    });

    // 自动停止功能事件
    this.elements.autoStopToggle.addEventListener('change', () => {
      params.autoStopEnabled = this.elements.autoStopToggle.checked;
      this.callbacks.onAutoStopToggle(this.elements.autoStopToggle.checked);
    });

    // 场地尺寸设置事件
    this.setupSliderEvent(
      this.elements.canvasSizeSlider,
      this.elements.canvasSizeValue,
      (value) => {
        params.canvasSize = value;
        this.elements.canvasSizeValue.textContent = value;
      }
    );

    // 应用场地尺寸按钮事件
    this.elements.applySizeBtn.addEventListener('click', () => {
      this.callbacks.onApplySize(params.canvasSize);
    });
  }

  // 设置滑块通用事件处理
  setupSliderEvent(slider, valueElement, callback) {
    slider.addEventListener('input', () => {
      const value = parseInt(slider.value);
      callback(value);
    });
  }

  // 显示批量模拟设置对话框
  showBatchSimulationDialog() {
    if (this.elements.batchSimulationDialog) {
      this.elements.batchSimulationDialog.classList.add('active');
    }
  }

  // 隐藏批量模拟设置对话框
  hideBatchSimulationDialog() {
    if (this.elements.batchSimulationDialog) {
      this.elements.batchSimulationDialog.classList.remove('active');
    }
  }

  // 显示加载指示器
  showLoadingIndicator() {
    this.elements.loadingIndicator.classList.add('active');
  }

  // 隐藏加载指示器
  hideLoadingIndicator() {
    this.elements.loadingIndicator.classList.remove('active');
  }

  // 更新进度
  updateProgress(value) {
    this.elements.progressElement.textContent = value;
  }

  // 更新加载文本
  updateLoadingText(text) {
    if (this.elements.loadingText) {
      this.elements.loadingText.textContent = text;
    }
  }

  // 调整画布大小
  resizeCanvas(width, height) {
    this.elements.canvas.width = width;
    this.elements.canvas.height = height;
    return this.elements.canvas;
  }

  // 显示通知
  showNotification(message) {
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
}