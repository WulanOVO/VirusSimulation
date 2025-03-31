const susceptibleCount = document.getElementById('susceptible-count');
const exposedCount = document.getElementById('exposed-count');
const infectedCount = document.getElementById('infected-count');
const recoveredCount = document.getElementById('recovered-count');
const deathCount = document.getElementById('death-count');

// 传染病模型状态常量
const STATUS = {
  SUSCEPTIBLE: 'susceptible', // 易感人群 - 健康但可能被感染的人群
  EXPOSED: 'exposed',         // 暴露人群 - 已感染但处于潜伏期的人群，可能具有低传染性
  INFECTED: 'infected',       // 感染人群 - 表现出明显症状且具有高传染性的人群
  RECOVERED: 'recovered',     // 康复人群 - 已恢复并可能获得免疫力的人群
  DEAD: 'dead'                // 死亡人群 - 因感染死亡的人群
};

// 各状态对应的颜色
const STATUS_COLORS = {
  [STATUS.SUSCEPTIBLE]: '#3498db', // 蓝色 - 易感人群
  [STATUS.EXPOSED]: '#f39c12',     // 黄色 - 潜伏期人群
  [STATUS.INFECTED]: '#e74c3c',    // 红色 - 感染人群
  [STATUS.RECOVERED]: '#2ecc71',   // 绿色 - 康复人群
  [STATUS.DEAD]: '#7f8c8d'         // 灰色 - 死亡人群
};

class Person {
  constructor(x, y, status = STATUS.SUSCEPTIBLE, simulationArea) {
    this.x = x;
    this.y = y;
    this.status = status;
    this.infectionDay = 0;               // 显性感染后的天数计数器
    this.exposureDay = 0;                // 潜伏期天数计数器
    this.simulationArea = simulationArea;
    this.dx = (Math.random() - 0.5) * 2; // 水平移动方向
    this.dy = (Math.random() - 0.5) * 2; // 垂直移动方向
    this.radius = 5;                     // 人物半径大小
    this.quarantined = false;            // 隔离状态标记
  }

  move(speed, quarantineEnabled, avoidInfectedEnabled) {
    // 已死亡的人不移动
    if (this.status === STATUS.DEAD) return;

    // 如果开启隔离措施且已感染并被隔离，则不移动
    if (quarantineEnabled && this.status === STATUS.INFECTED && this.quarantined) return;

    // 计算新位置
    let newX = this.x + this.dx * speed;
    let newY = this.y + this.dy * speed;

    // 当启用避开感染者功能时，健康人群会主动远离被隔离的病人
    if (avoidInfectedEnabled && (this.status === STATUS.SUSCEPTIBLE || this.status === STATUS.EXPOSED || this.status === STATUS.RECOVERED)) {
      if (quarantineEnabled) {
        const avoidanceForce = { x: 0, y: 0 };
        const avoidanceRadius = 50; // 避开距离半径

        for (const person of this.simulationArea.people) {
          if (person === this || !(person.status === STATUS.INFECTED && person.quarantined)) continue;

          const dx = this.x - person.x;
          const dy = this.y - person.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < avoidanceRadius) {
            // 计算远离力，距离越近力越大
            const force = (avoidanceRadius - distance) / avoidanceRadius;
            // 标准化方向向量
            const normalizedDx = dx / distance || 0;
            const normalizedDy = dy / distance || 0;

            avoidanceForce.x += normalizedDx * force * 2;
            avoidanceForce.y += normalizedDy * force * 2;
          }
        }

        // 应用避开力
        if (Math.abs(avoidanceForce.x) > 0.01 || Math.abs(avoidanceForce.y) > 0.01) {
          newX += avoidanceForce.x * speed;
          newY += avoidanceForce.y * speed;

          // 根据避开方向微调移动方向
          this.dx = this.dx * 0.8 + avoidanceForce.x * 0.2;
          this.dy = this.dy * 0.8 + avoidanceForce.y * 0.2;

          // 保持移动向量归一化
          const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
          if (magnitude > 0) {
            this.dx /= magnitude;
            this.dy /= magnitude;
          }
        }
      }
    }

    // 边界检查与反弹
    if (newX < this.radius || newX > this.simulationArea.width - this.radius) {
      this.dx = -this.dx;
      newX = this.x + this.dx * speed;
    }
    if (newY < this.radius || newY > this.simulationArea.height - this.radius) {
      this.dy = -this.dy;
      newY = this.y + this.dy * speed;
    }

    this.x = newX;
    this.y = newY;
  }

  checkInfection(people, infectionRate, infectionRadius) {
    // 只有易感人群可能被感染
    if (this.status !== STATUS.SUSCEPTIBLE) return;

    for (const person of people) {
      if (person === this || (person.status !== STATUS.INFECTED && person.status !== STATUS.EXPOSED)) continue;

      const dx = this.x - person.x;
      const dy = this.y - person.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < infectionRadius) {
        // 根据传染率决定是否被感染
        // 潜伏期人群传染性降低50%
        let adjustedRate = infectionRate;
        if (person.status === STATUS.EXPOSED) {
          adjustedRate = infectionRate * 0.5;
        }

        if (Math.random() * 100 < adjustedRate) {
          this.status = STATUS.EXPOSED; // 先进入潜伏期状态，而非直接感染
          this.exposureDay = 0;
          return;
        }
      }
    }
  }

  updateDisease(recoveryTime, mortalityRate, incubationPeriod) {
    // 更新潜伏期状态
    if (this.status === STATUS.EXPOSED) {
      // 每10帧更新一次天数计数（模拟一天）
      if (this.simulationArea.frameCount % 10 === 0) {
        this.exposureDay++;
      }

      // 检查是否达到潜伏期结束时间
      if (this.exposureDay >= incubationPeriod) {
        this.status = STATUS.INFECTED; // 从潜伏期转为显性感染
        this.infectionDay = 0;
      }
    }
    // 更新感染状态
    else if (this.status === STATUS.INFECTED) {
      // 每10帧更新一次天数计数（模拟一天）
      if (this.simulationArea.frameCount % 10 === 0) {
        this.infectionDay++;
      }

      // 检查是否达到恢复或死亡的时间
      if (this.infectionDay >= recoveryTime) {
        // 根据死亡率决定是恢复还是死亡
        if (Math.random() * 100 < mortalityRate) {
          this.status = STATUS.DEAD;
        } else {
          this.status = STATUS.RECOVERED;
        }
      }
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    // 设置颜色根据状态
    ctx.fillStyle = STATUS_COLORS[this.status];

    ctx.fill();
    ctx.closePath();

    // 如果被隔离，绘制隔离标记（紫色环）
    if (this.quarantined && this.status === STATUS.INFECTED) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#8e44ad'; // 紫色
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    }
  }
}

class SimulationArea {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.people = [];            // 人群数组
    this.day = 0;                // 当前模拟天数
    this.isRunning = false;      // 模拟运行状态
    this.frameCount = 0;         // 帧计数器
    this.statistics = {
      susceptible: 0,            // 易感人数
      exposed: 0,                // 潜伏期人数
      infected: 0,               // 感染人数
      recovered: 0,              // 康复人数
      dead: 0,                   // 死亡人数
      dailyNewInfections: 0      // 每日新增感染
    };
    this.historicalData = [];    // 历史数据记录
    this.autoStopEnabled = true; // 是否启用自动停止功能
    this.stoppedAutomatically = false; // 是否已自动停止标记
    this.scale = 1;              // 缩放因子，保持人物视觉大小一致

    // 每日数据累计器
    this.dailyNewInfectionsAccumulator = 0; // 每日新增感染数累计
    this.dailyNewExposedAccumulator = 0;    // 每日新增潜伏数累计
    this.dailyNewRecoveredAccumulator = 0;  // 每日新增康复数累计
    this.dailyNewDeathsAccumulator = 0;     // 每日新增死亡数累计
  }

  initialize(populationSize, initialInfected) {
    if(!this.people) this.people = [];
    if(this.people.length > 0) this.people = [];

    // 创建初始人口
    for (let i = 0; i < populationSize; i++) {
      const x = Math.random() * (this.width - 20) + 10;
      const y = Math.random() * (this.height - 20) + 10;
      const status = i < initialInfected ? STATUS.INFECTED : STATUS.SUSCEPTIBLE;

      this.people.push(new Person(x, y, status, this));
    }

    this.updateStatistics();

    // 只有当历史数据为空时才记录，避免重复
    if(this.historicalData.length === 0) {
      this.recordDailyData();
    }
  }

  updateStatistics() {
    // 重置统计数据
    this.statistics.susceptible = 0;
    this.statistics.exposed = 0;
    this.statistics.infected = 0;
    this.statistics.recovered = 0;
    this.statistics.dead = 0;
    // 注意：新增感染、潜伏、康复和死亡通过累计器来跟踪，不在这里重置

    // 计算当前状态人数
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

    // 更新UI显示
    susceptibleCount.textContent = this.statistics.susceptible;
    exposedCount.textContent = this.statistics.exposed;
    infectedCount.textContent = this.statistics.infected;
    recoveredCount.textContent = this.statistics.recovered;
    deathCount.textContent = this.statistics.dead;
  }

  recordDailyData() {
    // 记录每日数据用于图表显示
    this.historicalData.push({
      day: this.day,
      susceptible: this.statistics.susceptible,
      exposed: this.statistics.exposed,
      infected: this.statistics.infected,
      recovered: this.statistics.recovered,
      dead: this.statistics.dead,
      newInfections: this.dailyNewInfectionsAccumulator, // 新增显性感染
      newExposed: this.dailyNewExposedAccumulator,       // 新增潜伏人数
      newRecovered: this.dailyNewRecoveredAccumulator,   // 新增康复人数
      newDeaths: this.dailyNewDeathsAccumulator          // 新增死亡人数
    });

    // 重置每日新增数据累计器
    this.dailyNewInfectionsAccumulator = 0;
    this.dailyNewExposedAccumulator = 0;
    this.dailyNewRecoveredAccumulator = 0;
    this.dailyNewDeathsAccumulator = 0;

    // 触发图表更新事件
    const event = new CustomEvent('dataUpdated', { detail: this.historicalData });
    document.dispatchEvent(event);
  }

  update(params) {
    if (!this.isRunning) return;

    // 同步自动停止设置
    this.autoStopEnabled = params.autoStopEnabled;

    for (const person of this.people) {
      // 记录更新前的状态
      const prevStatus = person.status;

      // 移动人群
      person.move(
        params.movementSpeed,
        params.quarantineEnabled,
        params.avoidInfectedEnabled
      );

      // 检查传染
      person.checkInfection(
        this.people,
        params.infectionRate,
        params.infectionRadius
      );

      // 更新疾病状态
      person.updateDisease(
        params.recoveryTime,
        params.mortalityRate,
        params.incubationPeriod
      );

      // 统计状态变化
      // 从易感到潜伏期
      if (prevStatus === STATUS.SUSCEPTIBLE && person.status === STATUS.EXPOSED) {
        this.dailyNewExposedAccumulator++;
      }

      // 从潜伏期到显性感染
      if (prevStatus === STATUS.EXPOSED && person.status === STATUS.INFECTED) {
        this.dailyNewInfectionsAccumulator++;
      }

      // 从感染到康复
      if (prevStatus === STATUS.INFECTED && person.status === STATUS.RECOVERED) {
        this.dailyNewRecoveredAccumulator++;
      }

      // 从感染到死亡
      if (prevStatus === STATUS.INFECTED && person.status === STATUS.DEAD) {
        this.dailyNewDeathsAccumulator++;
      }

      // 隔离措施：有20%概率发现并隔离有症状的感染者
      if (params.quarantineEnabled && person.status === STATUS.INFECTED && !person.quarantined) {
        if (Math.random() < 0.2) {
          person.quarantined = true;
        }
      }
    }

    // 更新统计数据
    this.updateStatistics();

    // 每10帧更新一次天数和记录数据（模拟一天）
    if (this.frameCount % 10 === 0) {
      this.day++;
      this.recordDailyData();

      // 检查是否应该自动停止模拟
      this.checkAutoStop();
    }

    this.frameCount++;
  }

  // 检查是否应该自动停止模拟
  checkAutoStop() {
    if (!this.autoStopEnabled || this.stoppedAutomatically) return;

    // 条件1：没有感染者和潜伏期者时停止
    if (this.statistics.infected === 0 && this.statistics.exposed === 0 && this.day > 1) {
      this.autoStop("模拟已自动停止：没有活跃感染者和潜伏期者");
      return;
    }

    // 条件2：连续7天无新增感染
    if (this.historicalData.length >= 8) {
      const last7Days = this.historicalData.slice(-8);
      const hasNewInfectionsOrExposed = last7Days.some(
        data => data.newInfections > 0 || data.newExposed > 0
      );

      if (!hasNewInfectionsOrExposed && this.statistics.infected === 0 && this.statistics.exposed === 0) {
        this.autoStop("模拟已自动停止：连续7天无新增感染和潜伏");
        return;
      }
    }

    // 条件3：所有人都已被感染过(已恢复或已死亡)，且没有活跃感染者和潜伏期者
    if (this.statistics.susceptible === 0 && this.statistics.infected === 0 && this.statistics.exposed === 0) {
      this.autoStop("模拟已自动停止：全部人口已被感染过");
      return;
    }
  }

  // 自动停止模拟
  autoStop(message) {
    this.pause();
    this.stoppedAutomatically = true;

    showNotification(message);
  }

  // 调整场地尺寸
  resizeCanvas(width, height) {
    // 保存当前运行状态
    const wasRunning = this.isRunning;
    if (wasRunning) this.pause();

    // 保存当前人群的相对位置
    const peopleRelativePositions = this.people.map(person => ({
      person,
      relX: person.x / this.width,
      relY: person.y / this.height
    }));

    // 计算缩放因子 - 反转计算，确保人物大小保持一致
    const oldArea = this.width * this.height;
    const newArea = width * height;
    this.scale = Math.sqrt(newArea / oldArea);

    // 更新画布尺寸
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;

    // 调整人群位置
    for (const item of peopleRelativePositions) {
      item.person.x = item.relX * width;
      item.person.y = item.relY * height;
    }

    // 重绘场景
    this.draw();

    // 如果之前在运行，恢复运行
    if (wasRunning) this.start();

    return true;
  }

  draw() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 绘制所有人
    for (const person of this.people) {
      person.draw(this.ctx);
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.frameCount = 0;
  }

  pause() {
    this.isRunning = false;
  }

  reset(populationSize, initialInfected) {
    this.pause();
    this.stoppedAutomatically = false; // 重置自动停止标记
    this.frameCount = 0; // 重置帧计数器
    this.day = 0; // 重置天数

    // 重置所有累计器
    this.dailyNewInfectionsAccumulator = 0;
    this.dailyNewExposedAccumulator = 0;
    this.dailyNewRecoveredAccumulator = 0;
    this.dailyNewDeathsAccumulator = 0;

    // 重置历史数据和重新初始化人口
    this.historicalData = [];
    this.people = [];
    this.initialize(populationSize, initialInfected);

    // 移除可能存在的自动停止提示
    const existingAlerts = document.querySelectorAll('.auto-stop-alert');
    existingAlerts.forEach(alert => alert.remove());

    // 确保UI更新
    this.updateStatistics();

    // 重新绘制场景
    this.draw();
  }
}