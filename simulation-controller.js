// 模拟控制器类
class SimulationController {
  constructor(simulationArea, chartManager, domManager) {
    this.simulationArea = simulationArea;
    this.chartManager = chartManager;
    this.domManager = domManager;
    this.animationFrameId = null;
    this.frameCounter = 0;
  }

  // 开始动画循环
  startAnimationLoop(params) {
    // 如果已经在运行，不要创建新的动画循环
    if (this.animationFrameId) return;

    const animate = () => {
      // 根据模拟速度控制更新频率
      this.frameCounter++;

      // 当frameCounter是simulationSpeed的倍数时更新模拟
      // 速度值越大，更新越频繁（simulationSpeed=10时每帧都更新）
      if (this.frameCounter % (11 - params.simulationSpeed) === 0) {
        // 更新模拟
        this.simulationArea.update(params);
        this.frameCounter = 0;
      }

      // 绘制模拟（每帧都绘制以保持流畅的视觉效果）
      this.simulationArea.draw();

      // 请求下一帧
      this.animationFrameId = requestAnimationFrame(animate);
    };

    // 开始动画循环
    animate();
  }

  // 停止动画循环
  stopAnimationLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // 执行快速模拟
  runFastSimulation(params, callback) {
    // 停止当前动画循环
    this.stopAnimationLoop();

    // 重置模拟
    this.simulationArea.reset(
      params.populationSize,
      params.initialInfected
    );

    // 显示加载指示器
    this.domManager.showLoadingIndicator();

    // 开始快速模拟过程（使用setTimeout以避免UI卡死）
    setTimeout(() => {
      this.executeFastSimulation(params, (result) => {
        // 模拟完成后的回调
        this.domManager.hideLoadingIndicator();

        // 确保模拟状态重置
        this.simulationArea.pause();
        this.simulationArea.frameCount = 0;

        // 更新图表
        const event = new CustomEvent('dataUpdated', { detail: this.simulationArea.historicalData });
        document.dispatchEvent(event);

        // 重新绘制画布
        this.simulationArea.draw();

        // 滚动到页面底部以查看结果
        window.scrollTo(0, document.body.scrollHeight);

        // 调用外部回调（如果有的话）
        if (callback) callback(result);
      });
    }, 100);
  }

  // 执行快速模拟的内部方法
  executeFastSimulation(params, callback) {
    // 最大天数限制，防止无限循环
    const MAX_DAYS = 365;

    // 标记模拟运行
    this.simulationArea.isRunning = true;

    // 模拟循环
    let day = 0;

    const simulateNextBatch = () => {
      // 每次批处理模拟10天
      for (let i = 0; i < 10; i++) {
        // 进行多次更新以模拟一天
        for (let j = 0; j < 10; j++) {
          this.simulationArea.update(params);
        }

        day++;
        this.domManager.updateProgress(day);

        // 检查是否应该停止
        let stopReason = null;
        if (day >= MAX_DAYS) {
          stopReason = "模拟已完成：达到最大模拟天数";
        } else if (this.simulationArea.statistics.infected === 0 && this.simulationArea.statistics.exposed === 0) {
          stopReason = "模拟已完成：没有活跃感染者和潜伏期者";
        } else if (
          this.simulationArea.statistics.susceptible === 0 &&
          this.simulationArea.statistics.infected === 0 &&
          this.simulationArea.statistics.exposed === 0
        ) {
          stopReason = "模拟已完成：全部人口已被感染过";
        }

        if (stopReason) {
          // 确保模拟停止
          this.simulationArea.isRunning = false;

          // 显示结束信息
          this.domManager.showNotification(stopReason);

          // 调用回调并传递结果
          callback({ day: day, reason: stopReason });
          return;
        }
      }

      // 使用setTimeout允许UI更新
      setTimeout(simulateNextBatch, 0);
    };

    // 开始批处理
    simulateNextBatch();
  }
}

// 导出模拟控制器类
window.SimulationController = SimulationController;