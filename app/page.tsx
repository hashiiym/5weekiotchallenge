"use client";

import { useEffect, useMemo, useState } from "react";

type DayTask = {
  id: string;
  day: string;
  title: string;
  voltage: number;
  category: "mission" | "boss" | "rest" | "buffer";
};

type WeekTrack = {
  week: number;
  title: string;
  tasks: DayTask[];
};

const roadmap: WeekTrack[] = [
  {
    week: 1,
    title: "Python Foundations & Hardware Prep",
    tasks: [
      { id: "w1-mon-fri-python", day: "Mon-Fri", title: "Python basic variables, loops, OOP scripts", voltage: 50, category: "mission" },
      { id: "w1-sat-esp32", day: "Sat", title: "Wire up physical ESP32 and check local DHT22 serial output", voltage: 100, category: "boss" },
      { id: "w1-sun-rest", day: "Sun", title: "Rest/Review", voltage: 0, category: "rest" },
    ],
  },
  {
    week: 2,
    title: "Finish Python Cert & Start Cisco IoT",
    tasks: [
      { id: "w2-mon-cert", day: "Mon", title: "Take assessment and claim Python Cert", voltage: 50, category: "mission" },
      { id: "w2-tue-thu-cisco", day: "Tue-Thu", title: "Cisco NetAcad Modules 1-4", voltage: 50, category: "mission" },
      { id: "w2-fri-sat-mqtt", day: "Fri-Sat", title: "ESP32 WiFi to HiveMQ MQTT data pipeline active", voltage: 100, category: "boss" },
      { id: "w2-sun-rest", day: "Sun", title: "Rest", voltage: 0, category: "rest" },
    ],
  },
  {
    week: 3,
    title: "Finish Cisco & Springboard IoT + Dashboard Live",
    tasks: [
      { id: "w3-mon-wed-cisco-boss", day: "Mon-Wed", title: "Cisco IoT Modules 5-8 + Final Exam Boss Fight", voltage: 150, category: "boss" },
      { id: "w3-wed-fri-springboard", day: "Wed-Fri", title: "Springboard IoT track setup", voltage: 50, category: "mission" },
      { id: "w3-sat-telemetry", day: "Sat", title: "ThingSpeak telemetry dashboard & Telegram alert bot live", voltage: 100, category: "boss" },
      { id: "w3-sun-rest", day: "Sun", title: "Rest", voltage: 0, category: "rest" },
    ],
  },
  {
    week: 4,
    title: "IBM Badge, SSCS Project & Project Polish",
    tasks: [
      { id: "w4-mon-ibm", day: "Mon", title: "IBM SkillsBuild IoT/AI Foundations single-day badge", voltage: 100, category: "boss" },
      { id: "w4-tue-wed-mqtt-logging", day: "Tue-Wed", title: "Apply MQTT logging script patterns to SSCS Arduino workspace", voltage: 100, category: "mission" },
      { id: "w4-thu-fri-oled-video", day: "Thu-Fri", title: "Solder local SSD1306 OLED layout and record portfolio demo video", voltage: 100, category: "mission" },
      { id: "w4-sat-gsa", day: "Sat", title: "Construct GSA content outline", voltage: 0, category: "buffer" },
      { id: "w4-sun-rest", day: "Sun", title: "Rest", voltage: 0, category: "rest" },
    ],
  },
  {
    week: 5,
    title: "Buffer, Content Creation & Final Push",
    tasks: [
      { id: "w5-mon-buffer", day: "Mon", title: "System Buffer Mode - clear lingering Tech Debt tasks", voltage: 0, category: "buffer" },
      { id: "w5-tue-thu-launch", day: "Tue-Thu", title: "Draft killer LinkedIn launch post and slide layout for TinkerHub", voltage: 0, category: "mission" },
      { id: "w5-wed-isolation-forest", day: "Wed", title: "Optional data science layer: fit scikit-learn Isolation Forest logic to CSV logs", voltage: 100, category: "boss" },
      { id: "w5-fri-portfolio", day: "Fri", title: "Update PDF portfolio master profiles", voltage: 0, category: "mission" },
      { id: "w5-sat-sun-rest", day: "Sat-Sun", title: "Sacred rest before college re-entry", voltage: 0, category: "rest" },
    ],
  },
];

const allTasks = roadmap.flatMap((week) => week.tasks);
const scoreFor = (taskId: string) => allTasks.find((task) => task.id === taskId)?.voltage ?? 0;
const labelFor = (taskId: string) => allTasks.find((task) => task.id === taskId)?.title ?? taskId;

const initialDebtTasks = allTasks
  .filter((task) => task.category !== "rest" && task.category !== "buffer")
  .map((task) => task.id);

export default function HomePage() {
  const [totalVoltage, setTotalVoltage] = useState<number>(0);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [techDebtTasks, setTechDebtTasks] = useState<string[]>(initialDebtTasks);
  const [displayVoltage, setDisplayVoltage] = useState<number>(0);

  useEffect(() => {
    const delta = totalVoltage - displayVoltage;
    if (delta === 0) return;

    const increment =
      delta > 0 ? Math.max(1, Math.ceil(delta / 8)) : Math.min(-1, Math.floor(delta / 8));

    const timeout = window.setTimeout(() => {
      setDisplayVoltage((current) => {
        const next = current + increment;
        if ((increment > 0 && next > totalVoltage) || (increment < 0 && next < totalVoltage)) {
          return totalVoltage;
        }
        return next;
      });
    }, 45);

    return () => window.clearTimeout(timeout);
  }, [displayVoltage, totalVoltage]);

  const activeWeek = useMemo(
    () => roadmap.find((week) => week.week === currentWeek) ?? roadmap[0],
    [currentWeek],
  );

  const weekTasks = activeWeek.tasks;

  const weekCompletedCount = useMemo(
    () => weekTasks.filter((task) => completedTasks.includes(task.id)).length,
    [completedTasks, weekTasks],
  );

  const actionableWeekTasks = useMemo(
    () => weekTasks.filter((task) => task.category !== "rest").length,
    [weekTasks],
  );

  const completionRate = useMemo(() => {
    const eligible = allTasks.filter((task) => task.category !== "rest").length;
    return Math.round((completedTasks.length / eligible) * 100);
  }, [completedTasks]);

  const weekProgress = actionableWeekTasks === 0
    ? 0
    : Math.round((weekCompletedCount / actionableWeekTasks) * 100);

  const techDebtVoltage = useMemo(
    () => techDebtTasks.reduce((sum, taskId) => sum + scoreFor(taskId), 0),
    [techDebtTasks],
  );

  const nextTask = useMemo(
    () => weekTasks.find((task) => task.category !== "rest" && !completedTasks.includes(task.id)),
    [completedTasks, weekTasks],
  );

  const toggleTask = (task: DayTask) => {
    if (task.category === "rest") return;

    const isComplete = completedTasks.includes(task.id);

    if (task.category === "buffer") {
      setCompletedTasks((current) =>
        isComplete ? current.filter((taskId) => taskId !== task.id) : [...current, task.id],
      );

      if (!isComplete) {
        setTechDebtTasks([]);
      }
      return;
    }

    if (isComplete) {
      setCompletedTasks((current) => current.filter((taskId) => taskId !== task.id));
      setTechDebtTasks((current) => (current.includes(task.id) ? current : [...current, task.id]));
      setTotalVoltage((current) => Math.max(0, current - task.voltage));
      return;
    }

    setCompletedTasks((current) => [...current, task.id]);
    setTechDebtTasks((current) => current.filter((taskId) => taskId !== task.id));
    setTotalVoltage((current) => current + task.voltage);
  };

  const clearDebtTask = (taskId: string) => {
    if (currentWeek !== 5) return;

    setTechDebtTasks((current) => current.filter((id) => id !== taskId));
    if (!completedTasks.includes("w5-mon-buffer")) {
      setCompletedTasks((current) => [...current, "w5-mon-buffer"]);
    }
  };

  return (
    <main className="min-h-screen bg-[#050511] px-4 py-6 text-[#d7fbff] sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-[28px] border border-white/10 bg-[#0a1020]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00f3ff]/75">
                5-Week IoT Learning Tracker
              </p>
              <h1 className="mt-3 font-display text-3xl font-black uppercase tracking-[0.08em] text-white sm:text-4xl">
                Clear, focused sprint tracking
              </h1>
              <p className="mt-4 max-w-2xl font-mono text-sm leading-7 text-[#b8d5e6]">
                Pick a week, complete the listed tasks, and use Week 5 buffer mode to clear missed items from tech debt.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8bb6c8]">
                    Voltage
                  </p>
                  <p className="mt-2 font-display text-3xl tracking-[0.08em] text-[#00f3ff]">
                    {displayVoltage.toString().padStart(4, "0")}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8bb6c8]">
                    Overall Progress
                  </p>
                  <p className="mt-2 font-display text-3xl tracking-[0.08em] text-white">
                    {completionRate}%
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8bb6c8]">
                    Tech Debt
                  </p>
                  <p className="mt-2 font-display text-3xl tracking-[0.08em] text-[#ff6b87]">
                    {techDebtTasks.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#00f3ff]/20 bg-[#07111d] p-5">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-[#00f3ff]">
                Current Focus
              </p>
              <h2 className="mt-3 font-display text-2xl uppercase tracking-[0.08em] text-white">
                Week {activeWeek.week}
              </h2>
              <p className="mt-2 font-mono text-sm leading-6 text-[#b8d5e6]">
                {activeWeek.title}
              </p>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8bb6c8]">
                    Week progress
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white">
                    {weekCompletedCount}/{actionableWeekTasks}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#00f3ff] transition-all duration-300"
                    style={{ width: `${weekProgress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8bb6c8]">
                  Next objective
                </p>
                <p className="mt-2 font-mono text-sm leading-6 text-white">
                  {nextTask ? nextTask.title : "This week is complete."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-[24px] border border-white/10 bg-[#0a1020]/88 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.28)]">
            <div className="mb-4">
              <h2 className="font-display text-lg uppercase tracking-[0.08em] text-white">
                Weeks
              </h2>
              <p className="mt-1 font-mono text-xs leading-5 text-[#8bb6c8]">
                Choose the sprint you want to review or work through.
              </p>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-col">
              {roadmap.map((week) => {
                const isActive = currentWeek === week.week;
                const done = week.tasks.filter((task) => completedTasks.includes(task.id)).length;

                return (
                  <button
                    key={week.week}
                    type="button"
                    onClick={() => setCurrentWeek(week.week)}
                    className={[
                      "min-w-[170px] rounded-2xl border px-4 py-4 text-left transition lg:min-w-0",
                      isActive
                        ? "border-[#00f3ff]/40 bg-[#0d1930] shadow-[0_0_0_1px_rgba(0,243,255,0.08)]"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]",
                    ].join(" ")}
                  >
                    <p className="font-display text-base uppercase tracking-[0.08em] text-white">
                      Week {week.week}
                    </p>
                    <p className="mt-2 font-mono text-xs leading-5 text-[#8bb6c8]">
                      {week.title}
                    </p>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[#00f3ff]">
                      {done}/{week.tasks.length} checked
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-[24px] border border-white/10 bg-[#0a1020]/88 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#8bb6c8]">
                  Active Week
                </p>
                <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.08em] text-white">
                  {activeWeek.title}
                </h2>
                <p className="mt-2 font-mono text-sm leading-6 text-[#b8d5e6]">
                  Mark a task complete to add voltage and remove it from tech debt.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8bb6c8]">
                  At a glance
                </p>
                <p className="mt-2 font-mono text-sm text-white">
                  {weekCompletedCount} completed, {Math.max(actionableWeekTasks - weekCompletedCount, 0)} remaining
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {weekTasks.map((task) => {
                const isComplete = completedTasks.includes(task.id);
                const isRest = task.category === "rest";
                const isBoss = task.category === "boss";
                const isBuffer = task.category === "buffer";
                const isDebt = techDebtTasks.includes(task.id) && !isComplete;

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => toggleTask(task)}
                    disabled={isRest}
                    className={[
                      "rounded-3xl border p-5 text-left transition",
                      isRest
                        ? "cursor-default border-white/10 bg-white/[0.03] opacity-75"
                        : isComplete
                          ? "border-[#39ff14]/35 bg-[#08170b]"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#8bb6c8]">
                            {task.day}
                          </span>
                          {isBoss ? (
                            <span className="rounded-full border border-[#ff00ff]/20 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#f0a7ff]">
                              Milestone
                            </span>
                          ) : null}
                          {isBuffer ? (
                            <span className="rounded-full border border-[#00f3ff]/20 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#8fdfea]">
                              Buffer
                            </span>
                          ) : null}
                          {isDebt ? (
                            <span className="rounded-full border border-[#ff003c]/20 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#ff91a8]">
                              Tech Debt
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-4 font-display text-xl uppercase tracking-[0.06em] text-white">
                          {task.title}
                        </h3>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span className="rounded-full border border-white/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-white">
                          {isRest ? "Rest" : `${task.voltage.toString().padStart(3, "0")}V`}
                        </span>
                        <span
                          className={[
                            "rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.18em]",
                            isRest
                              ? "border border-white/10 text-[#8bb6c8]"
                              : isComplete
                                ? "border border-[#39ff14]/30 bg-[#0d1f10] text-[#8ef17a]"
                                : "border border-white/10 text-[#d7fbff]",
                          ].join(" ")}
                        >
                          {isRest ? "Idle" : isComplete ? "Complete" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <section className="rounded-[24px] border border-white/10 bg-[#0a1020]/88 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#8bb6c8]">
                Tech Debt Drawer
              </p>
              <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.08em] text-white">
                Missed items to clear later
              </h2>
              <p className="mt-2 font-mono text-sm leading-6 text-[#b8d5e6]">
                These tasks stay here until completed or cleared during Week 5 buffer mode.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8bb6c8]">
                Risk Snapshot
              </p>
              <p className="mt-2 font-mono text-sm text-white">
                {techDebtTasks.length} items, {techDebtVoltage}V at risk
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {techDebtTasks.length === 0 ? (
              <div className="rounded-3xl border border-[#39ff14]/20 bg-[#09140c] p-5">
                <p className="font-display text-lg uppercase tracking-[0.08em] text-[#9ff58e]">
                  Tech debt cleared
                </p>
                <p className="mt-2 font-mono text-sm leading-6 text-[#bfe4be]">
                  Nothing is waiting in the recovery queue right now.
                </p>
              </div>
            ) : (
              techDebtTasks.map((taskId) => (
                <div
                  key={taskId}
                  className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-display text-sm uppercase tracking-[0.08em] text-white">
                      {labelFor(taskId)}
                    </p>
                    <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-[#ff91a8]">
                      {scoreFor(taskId)}V debt
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => clearDebtTask(taskId)}
                    disabled={currentWeek !== 5}
                    className={[
                      "rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition",
                      currentWeek === 5
                        ? "border-[#00f3ff]/30 text-[#00f3ff] hover:bg-[#00f3ff]/10"
                        : "cursor-not-allowed border-white/10 text-[#6f8591]",
                    ].join(" ")}
                  >
                    {currentWeek === 5 ? "Clear in Buffer Mode" : "Week 5 Required"}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
