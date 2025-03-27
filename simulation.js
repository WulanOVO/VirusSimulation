const susceptibleCount = document.getElementById('susceptible-count');
const exposedCount = document.getElementById('exposed-count');
const infectedCount = document.getElementById('infected-count');
const recoveredCount = document.getElementById('recovered-count');
const deathCount = document.getElementById('death-count');

const SUSCEPTIBLE = 'susceptible'; // 易感人群
const EXPOSED = 'exposed';         // 已感染但在潜伏期的人群
const INFECTED = 'infected';       // 感染人群 (有症状)
const RECOVERED = 'recovered';     // 恢复人群
const DEAD = 'dead';               // 死亡人群

class Person {
  constructor(x, y, status = SUSCEPTIBLE, simulationArea) {
    this.x = x;
    this.y = y;
    this.status = status;
    this.infectionDay = 0;
    this.exposureDay = 0; // 潜伏期计数器
    this.simulationArea = simulationArea;
    this.dx = (Math.random() - 0.5) * 2;
    this.dy = (Math.random() - 0.5) * 2;
    this.radius = 5;
    this.quarantined = false;
  }

  move(speed, quarantineEnabled, avoidInfectedEnabled) {
    // 如果已死亡，不移动
    if (this.status === DEAD) return;

    // 如果被隔离且已感染(显性症状)，不移动
    if (quarantineEnabled && this.status === INFECTED && this.quarantined) return;

    // 计算新位置
    let newX = this.x + this.dx * speed;
    let newY = this.y + this.dy * speed;

    // 健康人群主动远离隔离中的病人
    if (avoidInfectedEnabled && (this.status === SUSCEPTIBLE || this.status === EXPOSED || this.status === RECOVERED)) {
      if (quarantineEnabled) {
        const avoidanceForce = { x: 0, y: 0 };
        const avoidanceRadius = 50; // 避开距离

        for (const person of this.simulationArea.people) {
          if (person === this || !(person.status === INFECTED && person.quarantined)) continue;

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

    // 边界检查
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
    if (this.status !== SUSCEPTIBLE) return;

    for (const person of people) {
      if (person === this || (person.status !== INFECTED && person.status !== EXPOSED)) continue;

      const dx = this.x - person.x;
      const dy = this.y - person.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < infectionRadius) {
        // 根据传染率决定是否被感染
        // 潜伏期的人传染性降低50%
        let adjustedRate = infectionRate;
        if (person.status === EXPOSED) {
          adjustedRate = infectionRate * 0.5;
        }

        if (Math.random() * 100 < adjustedRate) {
          this.status = EXPOSED; // 现在变为潜伏期状态，而不是直接感染
          this.exposureDay = 0;
          return;
        }
      }
    }
  }

  updateDisease(recoveryTime, mortalityRate, incubationPeriod) {
    // 更新潜伏期状态
    if (this.status === EXPOSED) {
      // 只有在模拟天数更新时才增加潜伏天数
      if (this.simulationArea.frameCount % 10 === 0) {
        this.exposureDay++;
      }

      // 检查是否达到了潜伏期结束时间
      if (this.exposureDay >= incubationPeriod) {
        this.status = INFECTED; // 从潜伏期转为显性感染
        this.infectionDay = 0;
      }
    }
    // 更新感染状态
    else if (this.status === INFECTED) {
      // 只有在模拟天数更新时才增加感染天数
      if (this.simulationArea.frameCount % 10 === 0) {
        this.infectionDay++;
      }

      // 检查是否达到恢复或死亡的时间
      if (this.infectionDay >= recoveryTime) {
        // 根据死亡率决定是恢复还是死亡
        if (Math.random() * 100 < mortalityRate) {
          this.status = DEAD;
        } else {
          this.status = RECOVERED;
        }
      }
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    // 根据状态设置颜色
    switch (this.status) {
      case SUSCEPTIBLE:
        ctx.fillStyle = '#3498db'; // 蓝色
        break;
      case EXPOSED:
        ctx.fillStyle = '#f39c12'; // 黄色 (潜伏期)
        break;
      case INFECTED:
        ctx.fillStyle = '#e74c3c'; // 红色
        break;
      case RECOVERED:
        ctx.fillStyle = '#2ecc71'; // 绿色
        break;
      case DEAD:
        ctx.fillStyle = '#7f8c8d'; // 灰色
        break;
    }

    ctx.fill();
    ctx.closePath();

    // 如果被隔离，绘制隔离标记
    if (this.quarantined && this.status === INFECTED) {
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
    this.people = [];
    this.day = 0;
    this.isRunning = false;
    this.frameCount = 0;
    this.statistics = {
      susceptible: 0,
      exposed: 0,
      infected: 0,
      recovered: 0,
      dead: 0,
      dailyNewInfections: 0
    };
    this.historicalData = [];
    this.autoStopEnabled = true; // 默认启用自动停止功能
    this.stoppedAutomatically = false; // 标记是否已自动停止
    this.scale = 1; // 缩放因子，保持人物视觉大小一致
    this.dailyNewInfectionsAccumulator = 0; // 累计每日新增感染数
    this.dailyNewExposedAccumulator = 0; // 累计每日新增潜伏人数
    this.dailyNewRecoveredAccumulator = 0; // 累计每日康复数
    this.dailyNewDeathsAccumulator = 0; // 累计每日新增死亡数
  }

  initialize(populationSize, initialInfected) {
    if(!this.people) this.people = [];
    if(this.people.length > 0) this.people = [];

    // 创建初始人口
    for (let i = 0; i < populationSize; i++) {
      const x = Math.random() * (this.width - 20) + 10;
      const y = Math.random() * (this.height - 20) + 10;
      const status = i < initialInfected ? INFECTED : SUSCEPTIBLE;

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
    this.statistics.exposed = 0; // 重置潜伏期统计
    this.statistics.infected = 0;
    this.statistics.recovered = 0;
    this.statistics.dead = 0;
    // 注意：新增感染、潜伏、康复和死亡通过累计器来跟踪，不在这里重置

    // 计算当前状态
    for (const person of this.people) {
      switch (person.status) {
        case SUSCEPTIBLE:
          this.statistics.susceptible++;
          break;
        case EXPOSED:
          this.statistics.exposed++; // 统计潜伏期人数
          break;
        case INFECTED:
          this.statistics.infected++;
          break;
        case RECOVERED:
          this.statistics.recovered++;
          break;
        case DEAD:
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
      exposed: this.statistics.exposed, // 记录潜伏期数据
      infected: this.statistics.infected,
      recovered: this.statistics.recovered,
      dead: this.statistics.dead,
      newInfections: this.dailyNewInfectionsAccumulator, // 使用累计器中的值
      newExposed: this.dailyNewExposedAccumulator, // 记录新增潜伏人数
      newRecovered: this.dailyNewRecoveredAccumulator, // 使用康复累计器中的值
      newDeaths: this.dailyNewDeathsAccumulator // 记录新增死亡人数
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

      // 移动
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

      // 更新疾病状态，加入潜伏期参数
      person.updateDisease(
        params.recoveryTime,
        params.mortalityRate,
        params.incubationPeriod
      );

      // 统计每次更新中的新增暴露人数
      if (prevStatus === SUSCEPTIBLE && person.status === EXPOSED) {
        this.dailyNewExposedAccumulator++;
      }

      // 统计每次更新中的新增感染人数（从潜伏期转为显性感染）
      if (prevStatus === EXPOSED && person.status === INFECTED) {
        this.dailyNewInfectionsAccumulator++;
      }

      // 统计每次更新中的新增康复人数
      if (prevStatus === INFECTED && person.status === RECOVERED) {
        this.dailyNewRecoveredAccumulator++;
      }

      // 统计每次更新中的新增死亡人数
      if (prevStatus === INFECTED && person.status === DEAD) {
        this.dailyNewDeathsAccumulator++;
      }

      // 如果启用隔离措施，随机隔离感染者(只隔离有症状的感染者)
      if (params.quarantineEnabled && person.status === INFECTED && !person.quarantined) {
        // 有20%的概率被发现并隔离
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

    // 使用全局通知函数
    if (typeof showNotification === 'function') {
      showNotification(message);
    }
  }

  // 调整场地尺寸
  resizeCanvas(width, height) {
    // 暂停模拟标志
    const wasRunning = this.isRunning;
    if (wasRunning) this.pause();

    // 保存当前人群的相对位置
    const peopleRelativePositions = this.people.map(person => ({
      person,
      relX: person.x / this.width,
      relY: person.y / this.height
    }));

    // 计算缩放因子 - 反转计算，这样人物大小会保持一致
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

    // 不再显示天数在canvas中
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
    this.day = 0; // 明确重置天数
    this.dailyNewInfectionsAccumulator = 0; // 重置新增感染累计器
    this.dailyNewExposedAccumulator = 0; // 重置新增潜伏累计器
    this.dailyNewRecoveredAccumulator = 0; // 重置康复累计器
    this.dailyNewDeathsAccumulator = 0; // 重置新增死亡累计器

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