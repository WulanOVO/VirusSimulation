// 模拟控制器类 - 负责管理模拟流程和UI交互
class SimulationController {
  constructor(simulationArea, chartManager, domManager) {
    this.simulationArea = simulationArea;
    this.chartManager = chartManager;
    this.domManager = domManager;
    this.animationFrameId = null;
    this.frameCounter = 0;
    this.batchResults = []; // 批量模拟结果集

    // 缓存原始方法引用
    this._originalMethods = null;

    // 绑定this指向
    this.animate = this.animate.bind(this);
  }

  // 处理动画帧
  animate(params) {
    this.frameCounter++;

    // 根据速度设置更新频率（值越大更新越频繁）
    if (this.frameCounter % (11 - params.simulationSpeed) === 0) {
      this.simulationArea.update(params);
      this.frameCounter = 0;
    }

    // 每帧绘制以保持流畅视觉效果
    this.simulationArea.draw();
    this.animationFrameId = requestAnimationFrame(() => this.animate(params));
  }

  // 启动动画循环
  startAnimationLoop(params) {
    if (this.animationFrameId) return; // 避免重复启动
    this.animationFrameId = requestAnimationFrame(() => this.animate(params));
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
    window.showEachNotification = false;

    this.stopAnimationLoop();
    this.simulationArea.reset(
      params.populationSize,
      params.initialInfected
    );

    // 显示加载指示器
    this.domManager.showLoadingIndicator();
    this.domManager.updateLoadingText("正在快速模拟中...");

    // 利用浏览器空闲时间
    const scheduleNextBatch = window.requestIdleCallback || setTimeout;

    scheduleNextBatch(() => {
      this.executeFastSimulation(params, (result) => {
        // 模拟完成后处理
        this.domManager.hideLoadingIndicator();
        this.domManager.updateLoadingText("正在模拟中...");

        // 重置模拟状态
        this.simulationArea.pause();
        this.simulationArea.frameCount = 0;
        this.simulationArea.stoppedAutomatically = false;

        // 更新图表并显示结果
        const event = new CustomEvent('dataUpdated', { detail: this.simulationArea.historicalData });
        document.dispatchEvent(event);
        this.simulationArea.draw();

        // 滚动查看结果
        window.scrollTo(0, document.body.scrollHeight);

        window.showEachNotification = true;

        if (callback) callback(result);
      });
    }, { timeout: 100 });
  }

  // 执行批量模拟
  runBatchSimulation(params, callback) {
    window.showEachNotification = false;

    this.stopAnimationLoop();
    this.batchResults = [];

    // 准备UI
    this.domManager.showLoadingIndicator();
    this.domManager.updateLoadingText("正在批量模拟中...");

    const simulationCount = params.simulationCount || 10;
    this.domManager.updateProgress(`已完成: 0/${simulationCount}`);

    // 利用浏览器空闲时间
    const scheduleNextBatch = window.requestIdleCallback || setTimeout;

    scheduleNextBatch(() => {
      this.executeBatchSimulation(params, simulationCount, 0, (averagedData) => {
        // 批量模拟完成后处理
        this.domManager.hideLoadingIndicator();
        this.domManager.updateLoadingText("正在模拟中...");

        // 重置模拟状态
        this.simulationArea.pause();
        this.simulationArea.frameCount = 0;
        this.simulationArea.stoppedAutomatically = false;

        // 更新图表并显示结果
        const event = new CustomEvent('dataUpdated', { detail: averagedData });
        document.dispatchEvent(event);
        this.simulationArea.draw();

        // 滚动查看结果
        window.scrollTo(0, document.body.scrollHeight);

        this.domManager.showNotification(`已完成${simulationCount}次模拟的平均结果分析`);
        window.showEachNotification = true;

        if (callback) callback({ simulationCount, averagedData });
      });
    }, { timeout: 100 });
  }

  // 缓存原始方法
  _saveOriginalMethods() {
    if (!this._originalMethods) {
      this._originalMethods = {
        recordDailyData: this.simulationArea.recordDailyData,
        updateStatistics: this.simulationArea.updateStatistics,
        draw: this.simulationArea.draw
      };
    }
  }

  // 恢复原始方法
  _restoreOriginalMethods() {
    if (this._originalMethods) {
      this.simulationArea.recordDailyData = this._originalMethods.recordDailyData;
      this.simulationArea.updateStatistics = this._originalMethods.updateStatistics;
      this.simulationArea.draw = this._originalMethods.draw;
    }
  }

  // 替换为优化版方法
  _setupOptimizedMethods() {
    this._saveOriginalMethods();

    // 优化记录数据方法 - 避免触发图表更新
    this.simulationArea.recordDailyData = function() {
      const day = this.day;
      this.historicalData.push({
        day: day,
        susceptible: this.statistics.susceptible,
        exposed: this.statistics.exposed || 0,
        infected: this.statistics.infected,
        recovered: this.statistics.recovered,
        dead: this.statistics.dead,
        newExposed: this.dailyNewExposedAccumulator || 0,
        newInfections: this.dailyNewInfectionsAccumulator || 0,
        newRecovered: this.dailyNewRecoveredAccumulator || 0,
        newDeaths: this.dailyNewDeathsAccumulator || 0
      });

      // 重置累计器
      this.dailyNewInfectionsAccumulator = 0;
      this.dailyNewExposedAccumulator = 0;
      this.dailyNewRecoveredAccumulator = 0;
      this.dailyNewDeathsAccumulator = 0;
    };

    // 优化统计方法 - 不更新UI
    this.simulationArea.updateStatistics = function() {
      this.statistics.susceptible = 0;
      this.statistics.exposed = 0;
      this.statistics.infected = 0;
      this.statistics.recovered = 0;
      this.statistics.dead = 0;

      // 使用索引循环提高性能
      const people = this.people;
      const len = people.length;
      for (let i = 0; i < len; i++) {
        const person = people[i];
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

    // 优化绘制方法 - 批量模拟时禁用绘制
    this.simulationArea.draw = function() {
      // 空函数提高性能
    };
  }

  // 批量模拟内部方法
  executeBatchSimulation(params, totalCount, currentCount, callback) {
    const MAX_DAYS = 365;

    // 重置模拟
    this.simulationArea.reset(
      params.populationSize,
      params.initialInfected
    );

    // 首次调用时优化方法
    if (currentCount === 0) {
      this._setupOptimizedMethods();
    }

    this.simulationArea.isRunning = true;

    // 模拟循环
    let day = 0;
    const simulateNextBatch = () => {
      const batchSize = 10;
      let i = 0;

      // 批量更新
      while (i < batchSize && day < MAX_DAYS) {
        // 每天10次更新
        for (let j = 0; j < 10; j++) {
          this.simulationArea.update(params);
        }

        day++;
        i++;

        // 检查是否结束条件
        if (this._shouldStopSimulation(day)) {
          const stopReason = this._getStopReason(day);
          this.simulationArea.isRunning = false;

          // 保存结果
          this.batchResults.push([...this.simulationArea.historicalData]);

          // 更新进度
          const nextCount = currentCount + 1;
          this.domManager.updateProgress(`已完成: ${nextCount}/${totalCount}`);

          if (nextCount < totalCount) {
            // 继续下一次模拟
            const scheduleNextSim = window.requestIdleCallback || setTimeout;
            scheduleNextSim(() => {
              this.executeBatchSimulation(params, totalCount, nextCount, callback);
            }, { timeout: 0 });
          } else {
            // 所有模拟完成，恢复原始方法
            this._restoreOriginalMethods();

            // 重置状态
            this.simulationArea.pause();
            this.simulationArea.frameCount = 0;
            this.simulationArea.stoppedAutomatically = false;
            this.simulationArea.updateStatistics();

            // 计算平均结果
            const averagedData = this.calculateAverageResults(this.batchResults);
            callback(averagedData);
          }
          return;
        }
      }

      // 请求下一帧处理
      if (day < MAX_DAYS) {
        requestAnimationFrame(simulateNextBatch);
      }
    };

    requestAnimationFrame(simulateNextBatch);
  }

  // 判断是否应停止模拟
  _shouldStopSimulation(day) {
    const stats = this.simulationArea.statistics;

    // 三种停止条件
    if (day >= 365) return true;
    if (stats.infected === 0 && stats.exposed === 0 && day > 1) return true;
    if (stats.susceptible === 0 && stats.infected === 0 && stats.exposed === 0) return true;

    return false;
  }

  // 获取停止原因
  _getStopReason(day) {
    const stats = this.simulationArea.statistics;

    if (day >= 365) {
      return "模拟已完成：达到最大模拟天数";
    } else if (stats.infected === 0 && stats.exposed === 0) {
      return "模拟已完成：没有活跃感染者和潜伏期者";
    } else if (stats.susceptible === 0 && stats.infected === 0 && stats.exposed === 0) {
      return "模拟已完成：全部人口已被感染过";
    }

    return null;
  }

  // 快速模拟内部方法
  executeFastSimulation(params, callback) {
    const MAX_DAYS = 365;
    this.simulationArea.isRunning = true;

    let day = 0;
    const simulateNextBatch = () => {
      const batchSize = 10;
      let i = 0;

      // 批量更新
      while (i < batchSize && day < MAX_DAYS) {
        // 每天10次更新
        for (let j = 0; j < 10; j++) {
          this.simulationArea.update(params);
        }

        day++;
        i++;
        this.domManager.updateProgress(day);

        // 检查是否结束条件
        if (this._shouldStopSimulation(day)) {
          const stopReason = this._getStopReason(day);
          this.simulationArea.isRunning = false;
          this.domManager.showNotification(stopReason);
          callback({ day: day, reason: stopReason });
          return;
        }
      }

      // 请求下一帧处理
      if (day < MAX_DAYS) {
        requestAnimationFrame(simulateNextBatch);
      }
    };

    requestAnimationFrame(simulateNextBatch);
  }

  // 计算多次模拟的平均结果
  calculateAverageResults(batchResults) {
    if (batchResults.length === 0) return [];

    // 找出最长的模拟天数
    const maxDays = Math.max(...batchResults.map(result => result.length));
    const averagedData = new Array(maxDays);

    // 逐天计算平均值
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

      let validDataCount = 0;
      const resultCount = batchResults.length;

      // 累加有效结果
      for (let i = 0; i < resultCount; i++) {
        const result = batchResults[i];
        if (day < result.length) {
          validDataCount++;
          const dailyData = result[day];

          daySum.susceptible += dailyData.susceptible;
          daySum.exposed += dailyData.exposed || 0;
          daySum.infected += dailyData.infected;
          daySum.recovered += dailyData.recovered;
          daySum.dead += dailyData.dead;
          daySum.newExposed += dailyData.newExposed || 0;
          daySum.newInfections += dailyData.newInfections || 0;
          daySum.newRecovered += dailyData.newRecovered || 0;
          daySum.newDeaths += dailyData.newDeaths || 0;
        }
      }

      // 计算平均值
      if (validDataCount > 0) {
        const invCount = 1 / validDataCount; // 乘法替代除法提高性能

        daySum.susceptible = Math.round(daySum.susceptible * invCount);
        daySum.exposed = Math.round(daySum.exposed * invCount);
        daySum.infected = Math.round(daySum.infected * invCount);
        daySum.recovered = Math.round(daySum.recovered * invCount);
        daySum.dead = Math.round(daySum.dead * invCount);
        daySum.newExposed = Math.round(daySum.newExposed * invCount);
        daySum.newInfections = Math.round(daySum.newInfections * invCount);
        daySum.newRecovered = Math.round(daySum.newRecovered * invCount);
        daySum.newDeaths = Math.round(daySum.newDeaths * invCount);

        averagedData[day] = daySum;
      }
    }

    return averagedData.filter(Boolean);
  }
}
