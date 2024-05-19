import React, { useEffect, useState } from 'react';

function SRTF({ processes }) {
  const [schedule, setSchedule] = useState([]);
  const [avgWaitingTime, setAvgWaitingTime] = useState(0);
  const [avgTurnaroundTime, setAvgTurnaroundTime] = useState(0);
  const [throughput, setThroughput] = useState(0);

  useEffect(() => {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const localSchedule = [];
    let currentTime = 0;
    let processQueue = sortedProcesses.map((p, index) => ({ ...p, remainingBurstTime: p.burstTime }));
    const completedProcesses = new Set();
    const startTimes = {};
    const endTimes = {};

    const executeProcess = (process, startTime, execTime) => {
      const endTime = startTime + execTime;
      if (!startTimes[process.pid]) startTimes[process.pid] = startTime;
      localSchedule.push({
        pid: process.pid,
        startTime,
        endTime,
        arrivalTime: process.arrivalTime,
        burstTime: process.burstTime,
      });
      process.remainingBurstTime -= execTime;
      if (process.remainingBurstTime === 0) endTimes[process.pid] = endTime;
      return endTime;
    };

    while (processQueue.some(p => p.remainingBurstTime > 0)) {
      const availableProcesses = processQueue.filter(p => p.arrivalTime <= currentTime && !completedProcesses.has(p.pid));
      if (availableProcesses.length > 0) {
        const process = availableProcesses.reduce((a, b) => a.remainingBurstTime < b.remainingBurstTime ? a : b);
        const execTime = 1; // Simulate execution for 1 time unit
        currentTime = executeProcess(process, currentTime, execTime);

        if (process.remainingBurstTime <= 0) {
          completedProcesses.add(process.pid);
        }
      } else {
        currentTime++;
      }
    }

    // Merge consecutive time units for the same process
    const mergedSchedule = [];
    localSchedule.forEach((current, index) => {
      if (index === 0) {
        mergedSchedule.push(current);
      } else {
        const previous = mergedSchedule[mergedSchedule.length - 1];
        if (previous.pid === current.pid && previous.endTime === current.startTime) {
          previous.endTime = current.endTime;
        } else {
          mergedSchedule.push(current);
        }
      }
    });

    setSchedule(mergedSchedule);

    const waitingTimes = {};
    const turnaroundTimes = {};
    processQueue.forEach(p => {
      const turnaroundTime = endTimes[p.pid] - p.arrivalTime;
      const waitingTime = turnaroundTime - p.burstTime;
      waitingTimes[p.pid] = waitingTime;
      turnaroundTimes[p.pid] = turnaroundTime;
    });

    const totalWaitingTime = Object.values(waitingTimes).reduce((a, b) => a + b, 0);
    const totalTurnaroundTime = Object.values(turnaroundTimes).reduce((a, b) => a + b, 0);
    setAvgWaitingTime(totalWaitingTime / processes.length);
    setAvgTurnaroundTime(totalTurnaroundTime / processes.length);
    setThroughput(processes.length / currentTime);
  }, [processes]);

  // Calculate total timeline duration
  const totalDuration = schedule.length > 0 ? schedule[schedule.length - 1].endTime : 0;

  // Generate time ticks
  const generateTimeTicks = () => {
    const ticks = [];
    for (let i = 0; i <= totalDuration; i++) {
      ticks.push(
        <div key={i} style={{ width: `${100 / (totalDuration + 1)}%`, textAlign: 'center' }}>
          {i}
        </div>
      );
    }
    return ticks;
  };

  // Define color mapping for processes
  const processColors = {};
  const colors = ['#ff5733', '#33ff57', '#3333ff', '#ff33ff', '#ffff33', '#ff9f33', '#33ff9f', '#9f33ff', '#ff339f', '#339fff'];

  processes.forEach((process, index) => {
    processColors[process.pid] = colors[index % colors.length];
  });

  // Generate timeline elements
  const generateTimeline = () => {
    const timeline = [];
    let previousEndTime = 0;
    schedule.forEach((s, index) => {
      // Render idle time before the current process
      if (s.startTime > previousEndTime) {
        const idleDuration = s.startTime - previousEndTime;
        timeline.push(
          <div
            key={`idle-${index}`}
            style={{
              width: `${(idleDuration / totalDuration) * 100}%`,
              height: '20px',
              background: 'white',
              border: '1px solid black',
            }}
          />
        );
      }
      // Render the current process
      timeline.push(
        <div
          key={index}
          style={{
            width: `${((s.endTime - s.startTime) / totalDuration) * 100}%`,
            height: '20px',
            background: processColors[s.pid],
            border: '1px solid black',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {s.pid}
        </div>
      );
      previousEndTime = s.endTime;
    });
    // Render idle time after the last process
    if (totalDuration > previousEndTime) {
      const idleDuration = totalDuration - previousEndTime;
      timeline.push(
        <div
          key={`idle-last`}
          style={{
            width: `${(idleDuration / totalDuration) * 100}%`,
            height: '20px',
            background: 'white',
            border: '1px solid black',
          }}
        />
      );
    }
    return timeline;
  };

  return (
    <div>
      <h2>SRTF Schedule</h2>
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1%' }}>
        {generateTimeline()}
      </div>
      <div style={{ display: 'flex', marginLeft: '1%' }}>
        {generateTimeTicks()}
      </div>
      <div>
        <p>Average Waiting Time: {avgWaitingTime.toFixed(2)}</p>
        <p>Average Turnaround Time: {avgTurnaroundTime.toFixed(2)}</p>
        <p>Throughput: {throughput.toFixed(3)} processes/unit time</p>
      </div>
    </div>
  );
}

export default SRTF;
