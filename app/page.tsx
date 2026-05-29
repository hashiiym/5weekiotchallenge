"use client";

import { useEffect, useMemo, useState } from "react";

type DayTask = {
  id: string;
  day: string;
  task: string;
  points: number;
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
      { id: "w1-mon-fri-python", day: "Mon-Fri", task: "Python basic variables, loops, OOP scripts", points: 50, category: "mission" },
      { id: "w1-sat-esp32", day: "Sat", task: "Wire up physical ESP32 and check local DHT22 serial output", points: 100, category: "boss" },
      { id: "w1-sun-rest", day: "Sun", task: "Rest/Review", points: 0, category: "rest" },
    ],
  },
  {
    week: 2,
    title: "Finish Python Cert & Start Cisco IoT",
    tasks: [
      { id: "w2-mon-cert", day: "Mon", task: "Take assessment and claim Python Cert", points: 50, category: "mission" },
      { id: "w2-tue-thu-cisco", day: "Tue-Thu", task: "Cisco NetAcad Modules 1-4", points: 50, category: "mission" },
      { id: "w2-fri-sat-mqtt", day: "Fri-Sat", task: "ESP32 WiFi to HiveMQ MQTT data pipeline active", points: 100, category: "boss" },
      { id: "w2-sun-rest", day: "Sun", task: "Rest", points: 0, category: "rest" },
    ],
  },
  {
    week: 3,
    title: "Finish Cisco & Springboard IoT + Dashboard Live",
    tasks: [
      { id: "w3-mon-wed-cisco-boss", day: "Mon-Wed", task: "Cisco IoT Modules 5-8 + Final Exam Boss Fight", points: 150, category: "boss" },
      { id: "w3-wed-fri-springboard", day: "Wed-Fri", task: "Springboard IoT track setup", points: 50, category: "mission" },
      { id: "w3-sat-telemetry", day: "Sat", task: "ThingSpeak telemetry dashboard & Telegram alert bot live", points: 100, category: "boss" },
      { id: "w3-sun-rest", day: "Sun", task: "Rest", points: 0, category: "rest" },
    ],
  },
  {
    week: 4,
    title: "IBM Badge, SSCS Project & Project Polish",
    tasks: [
      { id: "w4-mon-ibm", day: "Mon", task: "IBM SkillsBuild IoT/AI Foundations single-day badge", points: 100, category: "boss" },
      { id: "w4-tue-wed-mqtt-logging", day: "Tue-Wed", task: "Apply MQTT logging script patterns to SSCS Arduino workspace", points: 100, category: "mission" },
      { id: "w4-thu-fri-oled-video", day: "Thu-Fri", task: "Solder local SSD1306 OLED layout and record portfolio demo video", points: 100, category: "mission" },
      { id: "w4-sat-gsa", day: "Sat", task: "Construct GSA content outline", points: 0, category: "buffer" },
      { id: "w4-sun-rest", day: "Sun", task: "Rest", points: 0, category: "rest" },
    ],
  },
  {
    week: 5,
    title: "Buffer, Content Creation & Final Push",
    tasks: [
      { id: "w5-mon-buffer", day: "Mon", task: "System Buffer Mode - clear lingering Tech Debt tasks", points: 0, category: "buffer" },
      { id: "w5-tue-thu-launch", day: "Tue-Thu", task: "Draft killer LinkedIn launch post and slide layout for TinkerHub", points: 0, category: "mission" },
      { id: "w5-wed-isolation-forest", day: "Wed", task: "Optional data science layer: fit scikit-learn Isolation Forest logic to CSV logs", points: 100, category: "boss" },
      { id: "w5-fri-portfolio", day: "Fri", task: "Update PDF portfolio master profiles", points: 0, category: "mission" },
      { id: "w5-sat-sun-rest", day: "Sat-Sun", task: "Sacred rest before college re-entry", points: 0, category: "rest" },
    ],
  },
];

const allTasks = roadmap.flatMap((week) => week.tasks);
const scoreFor = (taskId: string) => allTasks.find((task) => task.id === taskId)?.points ?? 0;
const labelFor = (taskId: string) => allTasks.find((task) => task.id === taskId)?.task ?? taskId;

const initialDebtTasks = allTasks
  .filter((task) => task.category !== "rest" && task.category !== "buffer")
  .map((task) => task.id);

export default function HomePage() {
  const [totalVoltage, setTotalVoltage] = useState<number>(0);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [techDebtTasks, setTechDebtTasks] = useState<string[]>(initialDebtTasks);
  const [displayVoltage, setDisplayVoltage] = useState<number>(0);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const storedTheme = window.localStorage.getItem("tracker-theme");
    return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("tracker-theme", theme);
  }, [theme]);

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

  const currentWeekData = useMemo(
    () => ({
      ...activeWeek,
      days: activeWeek.tasks,
    }),
    [activeWeek],
  );

  const weekTasks = currentWeekData.days;

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
      setTotalVoltage((current) => Math.max(0, current - task.points));
      return;
    }

    setCompletedTasks((current) => [...current, task.id]);
    setTechDebtTasks((current) => current.filter((taskId) => taskId !== task.id));
    setTotalVoltage((current) => current + task.points);
  };

  const clearDebtTask = (taskId: string) => {
    if (currentWeek !== 5) return;

    setTechDebtTasks((current) => current.filter((id) => id !== taskId));
    if (!completedTasks.includes("w5-mon-buffer")) {
      setCompletedTasks((current) => [...current, "w5-mon-buffer"]);
    }
  };

  return (
    <main
      className={[
        "min-h-screen px-3 py-4 sm:px-6 sm:py-6 lg:px-10",
        theme === "dark" ? "bg-transparent text-[#d7fbff]" : "bg-transparent text-[#102033]",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-6">
        <section
          className={[
            "rounded-[24px] border p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur sm:rounded-[28px] sm:p-6",
            theme === "dark"
              ? "border-white/10 bg-[#0a1020]/88"
              : "border-slate-200/80 bg-white/88",
          ].join(" ")}
        >
          <div className="mb-5 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className={[
                  "font-mono text-[11px] uppercase tracking-[0.24em]",
                  theme === "dark" ? "text-[#8bb6c8]" : "text-slate-500",
                ].join(" ")}
              >
                Interface
              </p>
              <p
                className={[
                  "mt-1 font-mono text-xs",
                  theme === "dark" ? "text-[#b8d5e6]" : "text-slate-600",
                ].join(" ")}
              >
                Mobile-ready planner with theme switching and completion feedback.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              className={[
                "inline-flex items-center justify-center rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition",
                theme === "dark"
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100",
              ].join(" ")}
            >
              {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p
                className={[
                  "font-display text-xs uppercase tracking-[0.4em]",
                  theme === "dark" ? "text-[#00f3ff]/75" : "text-sky-600",
                ].join(" ")}
              >
                5-Week IoT Learning Tracker
              </p>
              <h1
                className={[
                  "mt-3 font-display text-2xl font-black uppercase tracking-[0.08em] sm:text-4xl",
                  theme === "dark" ? "text-white" : "text-slate-900",
                ].join(" ")}
              >
                Clear, focused sprint tracking
              </h1>
              <p
                className={[
                  "mt-3 max-w-2xl font-mono text-sm leading-6 sm:mt-4 sm:leading-7",
                  theme === "dark" ? "text-[#b8d5e6]" : "text-slate-600",
                ].join(" ")}
              >
                Pick a week, complete the listed tasks, and use Week 5 buffer mode to clear missed items from tech debt.
              </p>

              <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-3">
                <div
                  className={[
                    "rounded-2xl border p-4",
                    theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50",
                  ].join(" ")}
                >
                  <p className={["font-mono text-[11px] uppercase tracking-[0.22em]", theme === "dark" ? "text-[#8bb6c8]" : "text-slate-500"].join(" ")}>
                    Voltage
                  </p>
                  <p className="mt-2 font-display text-2xl tracking-[0.08em] text-[#00f3ff] sm:text-3xl">
                    {displayVoltage.toString().padStart(4, "0")}
                  </p>
                </div>
                <div
                  className={[
                    "rounded-2xl border p-4",
                    theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50",
                  ].join(" ")}
                >
                  <p className={["font-mono text-[11px] uppercase tracking-[0.22em]", theme === "dark" ? "text-[#8bb6c8]" : "text-slate-500"].join(" ")}>
                    Overall Progress
                  </p>
                  <p className={["mt-2 font-display text-2xl tracking-[0.08em] sm:text-3xl", theme === "dark" ? "text-white" : "text-slate-900"].join(" ")}>
                    {completionRate}%
                  </p>
                </div>
                <div
                  className={[
                    "rounded-2xl border p-4",
                    theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50",
                  ].join(" ")}
                >
                  <p className={["font-mono text-[11px] uppercase tracking-[0.22em]", theme === "dark" ? "text-[#8bb6c8]" : "text-slate-500"].join(" ")}>
                    Tech Debt
                  </p>
                  <p className="mt-2 font-display text-2xl tracking-[0.08em] text-[#ff6b87] sm:text-3xl">
                    {techDebtTasks.length}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={[
                "rounded-3xl border p-4 sm:p-5",
                theme === "dark"
                  ? "border-[#00f3ff]/20 bg-[#07111d]"
                  : "border-sky-200 bg-sky-50/80",
              ].join(" ")}
            >
              <p className={["font-display text-xs uppercase tracking-[0.3em]", theme === "dark" ? "text-[#00f3ff]" : "text-sky-700"].join(" ")}>
                Current Focus
              </p>
              <h2 className={["mt-3 font-display text-2xl uppercase tracking-[0.08em]", theme === "dark" ? "text-white" : "text-slate-900"].join(" ")}>
                Week {activeWeek.week}
              </h2>
              <p className={["mt-2 font-mono text-sm leading-6", theme === "dark" ? "text-[#b8d5e6]" : "text-slate-600"].join(" ")}>
                {currentWeekData.title}
              </p>

              <div className={["mt-5 rounded-2xl border p-4", theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"].join(" ")}>
                <div className="flex items-center justify-between gap-3">
                  <span className={["font-mono text-[11px] uppercase tracking-[0.22em]", theme === "dark" ? "text-[#8bb6c8]" : "text-slate-500"].join(" ")}>
                    Week progress
                  </span>
                  <span className={["font-mono text-[11px] uppercase tracking-[0.22em]", theme === "dark" ? "text-white" : "text-slate-900"].join(" ")}>
                    {weekCompletedCount}/{actionableWeekTasks}
                  </span>
                </div>
                <div className={["mt-3 h-2 overflow-hidden rounded-full", theme === "dark" ? "bg-white/10" : "bg-slate-200"].join(" ")}>
                  <div
                    className="h-full rounded-full bg-[#00f3ff] transition-all duration-300"
                    style={{ width: `${weekProgress}%` }}
                  />
                </div>
              </div>

              <div className={["mt-4 rounded-2xl border p-4", theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"].join(" ")}>
                <p className={["font-mono text-[11px] uppercase tracking-[0.22em]", theme === "dark" ? "text-[#8bb6c8]" : "text-slate-500"].join(" ")}>
                  Next objective
                </p>
                <p className={["mt-2 font-mono text-sm leading-6", theme === "dark" ? "text-white" : "text-slate-900"].join(" ")}>
                  {nextTask ? nextTask.task : "This week is complete."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside
            className={[
              "rounded-[24px] border p-4 shadow-[0_20px_40px_rgba(0,0,0,0.16)]",
              theme === "dark" ? "border-white/10 bg-[#0a1020]/88" : "border-slate-200/80 bg-white/88",
            ].join(" ")}
          >
            <div className="mb-4">
              <h2 className={["font-display text-lg uppercase tracking-[0.08em]", theme === "dark" ? "text-white" : "text-slate-900"].join(" ")}>
                Weeks
              </h2>
              <p className={["mt-1 font-mono text-xs leading-5", theme === "dark" ? "text-[#8bb6c8]" : "text-slate-600"].join(" ")}>
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
                        ? theme === "dark"
                          ? "border-[#00f3ff]/40 bg-[#0d1930] shadow-[0_0_0_1px_rgba(0,243,255,0.08)]"
                          : "border-sky-300 bg-sky-50"
                        : theme === "dark"
                          ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white",
                    ].join(" ")}
                  >
                    <p className={["font-display text-base uppercase tracking-[0.08em]", theme === "dark" ? "text-white" : "text-slate-900"].join(" ")}>
                      Week {week.week}
                    </p>
                    <p className={["mt-2 font-mono text-xs leading-5", theme === "dark" ? "text-[#8bb6c8]" : "text-slate-600"].join(" ")}>
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

          <section
            className={[
              "rounded-[24px] border p-4 shadow-[0_20px_40px_rgba(0,0,0,0.16)] sm:p-5",
              theme === "dark" ? "border-white/10 bg-[#0a1020]/88" : "border-slate-200/80 bg-white/88",
            ].join(" ")}
          >
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={["font-mono text-[11px] uppercase tracking-[0.24em]", theme === "dark" ? "text-[#8bb6c8]" : "text-slate-500"].join(" ")}>
                  Active Week
                </p>
                <h2 className={["mt-2 font-display text-xl uppercase tracking-[0.08em] sm:text-2xl", theme === "dark" ? "text-white" : "text-slate-900"].join(" ")}>
                  {currentWeekData.title}
                </h2>
                <p className={["mt-2 font-mono text-sm leading-6", theme === "dark" ? "text-[#b8d5e6]" : "text-slate-600"].join(" ")}>
                  Mark a task complete to add voltage and remove it from tech debt.
                </p>
              </div>
              <div className={["rounded-2xl border px-4 py-3", theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"].join(" ")}>
                <p className={["font-mono text-[11px] uppercase tracking-[0.22em]", theme === "dark" ? "text-[#8bb6c8]" : "text-slate-500"].join(" ")}>
                  At a glance
                </p>
                <p className={["mt-2 font-mono text-sm", theme === "dark" ? "text-white" : "text-slate-900"].join(" ")}>
                  {weekCompletedCount} completed, {Math.max(actionableWeekTasks - weekCompletedCount, 0)} remaining
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {currentWeekData.days.map((dayItem) => {
                const isComplete = completedTasks.includes(dayItem.id);
                const isRest = dayItem.category === "rest";
                const isBoss = dayItem.category === "boss";
                const isBuffer = dayItem.category === "buffer";
                const isDebt = techDebtTasks.includes(dayItem.id) && !isComplete;

                return (
                  <button
                    key={dayItem.id}
                    type="button"
                    onClick={() => toggleTask(dayItem)}
                    disabled={isRest}
                    className={[
                      "rounded-3xl border p-4 text-left transition sm:p-5",
                      isRest
                        ? theme === "dark"
                          ? "cursor-default border-white/10 bg-white/[0.03] opacity-75"
                          : "cursor-default border-slate-200 bg-slate-50 opacity-75"
                        : isComplete
                          ? theme === "dark"
                            ? "complete-burst border-[#39ff14]/35 bg-[#08170b]"
                            : "complete-burst border-emerald-300 bg-emerald-50"
                          : theme === "dark"
                            ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={["rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em]", theme === "dark" ? "border-white/10 text-[#8bb6c8]" : "border-slate-200 text-slate-500"].join(" ")}>
                            {dayItem.day}
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
                          {isComplete && !isRest ? (
                            <span className="rounded-full border border-emerald-300/60 bg-emerald-400/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">
                              +{dayItem.points} complete
                            </span>
                          ) : null}
                        </div>

                        <h3 className={["mt-3 font-display text-lg uppercase tracking-[0.06em] sm:mt-4 sm:text-xl", theme === "dark" ? "text-white" : "text-slate-900"].join(" ")}>
                          {dayItem.task}
                        </h3>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <span className={["rounded-full border px-3 py-2 font-mono text-xs uppercase tracking-[0.18em] sm:px-4", theme === "dark" ? "border-white/10 text-white" : "border-slate-200 text-slate-900"].join(" ")}>
                          {isRest ? "Rest" : `${dayItem.points.toString().padStart(3, "0")}V`}
                        </span>
                        <span
                          className={[
                            "rounded-full px-3 py-2 font-mono text-xs uppercase tracking-[0.18em] sm:px-4",
                            isRest
                              ? theme === "dark"
                                ? "border border-white/10 text-[#8bb6c8]"
                                : "border border-slate-200 text-slate-500"
                              : isComplete
                                ? theme === "dark"
                                  ? "border border-[#39ff14]/30 bg-[#0d1f10] text-[#8ef17a]"
                                  : "border border-emerald-300 bg-emerald-100 text-emerald-700"
                                : theme === "dark"
                                  ? "border border-white/10 text-[#d7fbff]"
                                  : "border border-slate-200 text-slate-700",
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

        <section
          className={[
            "rounded-[24px] border p-4 shadow-[0_20px_40px_rgba(0,0,0,0.16)] sm:p-5",
            theme === "dark" ? "border-white/10 bg-[#0a1020]/88" : "border-slate-200/80 bg-white/88",
          ].join(" ")}
        >
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={["font-mono text-[11px] uppercase tracking-[0.24em]", theme === "dark" ? "text-[#8bb6c8]" : "text-slate-500"].join(" ")}>
                Tech Debt Drawer
              </p>
              <h2 className={["mt-2 font-display text-xl uppercase tracking-[0.08em] sm:text-2xl", theme === "dark" ? "text-white" : "text-slate-900"].join(" ")}>
                Missed items to clear later
              </h2>
              <p className={["mt-2 font-mono text-sm leading-6", theme === "dark" ? "text-[#b8d5e6]" : "text-slate-600"].join(" ")}>
                These tasks stay here until completed or cleared during Week 5 buffer mode.
              </p>
            </div>
            <div className={["rounded-2xl border px-4 py-3", theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"].join(" ")}>
              <p className={["font-mono text-[11px] uppercase tracking-[0.22em]", theme === "dark" ? "text-[#8bb6c8]" : "text-slate-500"].join(" ")}>
                Risk Snapshot
              </p>
              <p className={["mt-2 font-mono text-sm", theme === "dark" ? "text-white" : "text-slate-900"].join(" ")}>
                {techDebtTasks.length} items, {techDebtVoltage}V at risk
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {techDebtTasks.length === 0 ? (
              <div className={["rounded-3xl border p-5", theme === "dark" ? "border-[#39ff14]/20 bg-[#09140c]" : "border-emerald-200 bg-emerald-50"].join(" ")}>
                <p className="font-display text-lg uppercase tracking-[0.08em] text-[#9ff58e]">
                  Tech debt cleared
                </p>
                <p className={["mt-2 font-mono text-sm leading-6", theme === "dark" ? "text-[#bfe4be]" : "text-emerald-700"].join(" ")}>
                  Nothing is waiting in the recovery queue right now.
                </p>
              </div>
            ) : (
              techDebtTasks.map((taskId) => (
                <div
                  key={taskId}
                  className={[
                    "flex flex-col gap-4 rounded-3xl border p-4 sm:flex-row sm:items-center sm:justify-between",
                    theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50",
                  ].join(" ")}
                >
                  <div>
                    <p className={["font-display text-sm uppercase tracking-[0.08em]", theme === "dark" ? "text-white" : "text-slate-900"].join(" ")}>
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
                        ? theme === "dark"
                          ? "border-[#00f3ff]/30 text-[#00f3ff] hover:bg-[#00f3ff]/10"
                          : "border-sky-300 text-sky-700 hover:bg-sky-50"
                        : theme === "dark"
                          ? "cursor-not-allowed border-white/10 text-[#6f8591]"
                          : "cursor-not-allowed border-slate-200 text-slate-400",
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
