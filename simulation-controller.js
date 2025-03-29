// 模拟控制器类
class SimulationController {
  constructor(simulationArea, chartManager, domManager) {
    this.simulationArea = simulationArea;
    this.chartManager = chartManager;
    this.domManager = domManager;
    this.animationFrameId = null;
    this.frameCounter = 0;
    this.batchResults = []; // 存储批量模拟的结果
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
    this.domManager.updateLoadingText("正在快速模拟中...");

    // 开始快速模拟过程（使用setTimeout以避免UI卡死）
    setTimeout(() => {
      this.executeFastSimulation(params, (result) => {
        // 模拟完成后的回调
        this.domManager.hideLoadingIndicator();
        this.domManager.updateLoadingText("正在模拟中..."); // 恢复默认文本

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

  // 执行批量模拟
  runBatchSimulation(params, callback) {
    // 停止当前动画循环
    this.stopAnimationLoop();

    // 重置结果数组
    this.batchResults = [];

    // 显示加载指示器
    this.domManager.showLoadingIndicator();
    this.domManager.updateLoadingText("正在批量模拟中...");

    // 设置批量模拟的参数
    const simulationCount = params.simulationCount || 10; // 默认10次模拟
    let completedSimulations = 0;

    // 更新进度信息
    this.domManager.updateProgress(`已完成: 0/${simulationCount}`);

    // 开始批量模拟过程
    setTimeout(() => {
      this.executeBatchSimulation(params, simulationCount, completedSimulations, (averagedData) => {
        // 批量模拟完成后的回调
        this.domManager.hideLoadingIndicator();
        this.domManager.updateLoadingText("正在模拟中..."); // 恢复默认文本

        // 确保模拟状态重置
        this.simulationArea.pause();
        this.simulationArea.frameCount = 0;

        // 更新图表显示
        const event = new CustomEvent('dataUpdated', { detail: averagedData });
        document.dispatchEvent(event);

        // 重新绘制画布
        this.simulationArea.draw();

        // 滚动到页面底部以查看结果
        window.scrollTo(0, document.body.scrollHeight);

        // 显示完成消息
        this.domManager.showNotification(`已完成${simulationCount}次模拟的平均结果分析`);

        // 调用外部回调（如果有的话）
        if (callback) callback({ simulationCount, averagedData });
      });
    }, 100);
  }

  // 执行批量模拟的内部方法
  executeBatchSimulation(params, totalCount, currentCount, callback) {
    // 最大天数限制，防止无限循环
    const MAX_DAYS = 365;

    // 重置当前模拟
    this.simulationArea.reset(
      params.populationSize,
      params.initialInfected
    );

    // 批量模拟过程中禁用绘制和UI更新
    const originalRecordDailyData = this.simulationArea.recordDailyData;
    const originalUpdateStatistics = this.simulationArea.updateStatistics;
    const originalDraw = this.simulationArea.draw;

    // 重写recordDailyData方法，避免触发图表更新
    this.simulationArea.recordDailyData = function() {
      // 只记录数据，不触发图表更新
      const day = this.day;
      this.historicalData.push({
        day: day,
        susceptible: this.statistics.susceptible,
        exposed: this.statistics.exposed,
        infected: this.statistics.infected,
        recovered: this.statistics.recovered,
        dead: this.statistics.dead,
        newInfections: this.dailyNewInfectionsAccumulator,
        newExposed: this.dailyNewExposedAccumulator,
        newRecovered: this.dailyNewRecoveredAccumulator,
        newDeaths: this.dailyNewDeathsAccumulator
      });

      // 重置每日新增数据累计器
      this.dailyNewInfectionsAccumulator = 0;
      this.dailyNewExposedAccumulator = 0;
      this.dailyNewRecoveredAccumulator = 0;
      this.dailyNewDeathsAccumulator = 0;
    };

    // 重写updateStatistics方法，避免更新UI
    this.simulationArea.updateStatistics = function() {
      // 重置统计数据
      this.statistics.susceptible = 0;
      this.statistics.exposed = 0;
      this.statistics.infected = 0;
      this.statistics.recovered = 0;
      this.statistics.dead = 0;

      // 计算当前状态人数但不更新UI
      for (const person of this.people) {
        switch (person.status) {
          case STATUS.SUSCEPTIBLE:
            this.statistics.susceptible++;
            break;
          case STATUS.EXPOSED:
            this.statistics.exposed++;
            break;
          case STATUS.INFECTED:
            this.statistics.infected++;
            break;
          case STATUS.RECOVERED:
            this.statistics.recovered++;
            break;
          case STATUS.DEAD:
            this.statistics.dead++;
            break;
        }
      }
    };

    // 重写draw方法，在批量模拟中不实际绘制
    this.simulationArea.draw = function() {
      // 批量模拟中不执行绘制操作，提高性能
    };

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

          // 存储这次模拟的历史数据
          this.batchResults.push([...this.simulationArea.historicalData]);

          // 更新进度
          const nextCount = currentCount + 1;
          this.domManager.updateProgress(`已完成: ${nextCount}/${totalCount}`);

          // 检查是否完成了所有模拟
          if (nextCount < totalCount) {
            // 继续下一次模拟
            setTimeout(() => {
              this.executeBatchSimulation(params, totalCount, nextCount, callback);
            }, 0);
          } else {
            // 恢复原始方法
            this.simulationArea.recordDailyData = originalRecordDailyData;
            this.simulationArea.updateStatistics = originalUpdateStatistics;
            this.simulationArea.draw = originalDraw;

            // 恢复UI状态
            this.simulationArea.updateStatistics();

            // 所有模拟已完成，计算平均值
            const averagedData = this.calculateAverageResults(this.batchResults);

            // 回调返回平均结果
            callback(averagedData);
          }
          return;
        }
      }

      // 继续模拟
      setTimeout(simulateNextBatch, 0);
    };

    // 开始批处理
    simulateNextBatch();
  }

  // 计算多次模拟的平均结果
  calculateAverageResults(batchResults) {
    if (batchResults.length === 0) return [];

    // 找出最长的模拟天数
    const maxDays = Math.max(...batchResults.map(result => result.length));

    // 创建平均结果数组
    const averagedData = [];

    // 对每一天的数据求平均
    for (let day = 0; day < maxDays; day++) {
      let daySum = {
        day,
        susceptible: 0,
        exposed: 0,
        infected: 0,
        recovered: 0,
        dead: 0,
        newExposed: 0,
        newInfections: 0,
        newRecovered: 0,
        newDeaths: 0
      };

      // 计算这一天有多少有效数据
      let validDataCount = 0;

      // 累加所有有效的模拟结果
      batchResults.forEach(result => {
        if (day < result.length) {
          validDataCount++;

          daySum.susceptible += result[day].susceptible;
          daySum.exposed += result[day].exposed || 0;
          daySum.infected += result[day].infected;
          daySum.recovered += result[day].recovered;
          daySum.dead += result[day].dead;
          daySum.newExposed += result[day].newExposed || 0;
          daySum.newInfections += result[day].newInfections || 0;
          daySum.newRecovered += result[day].newRecovered || 0;
          daySum.newDeaths += result[day].newDeaths || 0;
        }
      });

      // 计算平均值
      if (validDataCount > 0) {
        daySum.susceptible = Math.round(daySum.susceptible / validDataCount);
        daySum.exposed = Math.round(daySum.exposed / validDataCount);
        daySum.infected = Math.round(daySum.infected / validDataCount);
        daySum.recovered = Math.round(daySum.recovered / validDataCount);
        daySum.dead = Math.round(daySum.dead / validDataCount);
        daySum.newExposed = Math.round(daySum.newExposed / validDataCount);
        daySum.newInfections = Math.round(daySum.newInfections / validDataCount);
        daySum.newRecovered = Math.round(daySum.newRecovered / validDataCount);
        daySum.newDeaths = Math.round(daySum.newDeaths / validDataCount);

        averagedData.push(daySum);
      }
    }

    return averagedData;
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