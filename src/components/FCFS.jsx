import React from 'react';

function FCFS({ processes }) {
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const schedule = [];
  let currentTime = 0;

  sortedProcesses.forEach((process) => {
    const startTime = Math.max(currentTime, process.arrivalTime);
    const endTime = startTime + process.burstTime;
    schedule.push({
      pid: process.pid,
      startTime,
      endTime,
      arrivalTime: process.arrivalTime,
      burstTime: process.burstTime,
    });
    currentTime = endTime;
  });

  // Calculate total timeline duration
  const totalDuration = schedule.length > 0 ? schedule[schedule.length - 1].endTime : 0;

  // Calculate waiting times and turnaround times
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  schedule.forEach((s) => {
    const waitingTime = s.startTime - s.arrivalTime;
    const turnaroundTime = s.endTime - s.arrivalTime;
    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;
  });

  const averageWaitingTime = totalWaitingTime / schedule.length;
  const averageTurnaroundTime = totalTurnaroundTime / schedule.length;

  // Calculate throughput
  const throughput = schedule.length / totalDuration;

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

  // Define colors for processes
  const colors = ['#ff5733', '#33ff57', '#3333ff', '#ff33ff', '#ffff33'];

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
            background: colors[index % colors.length],
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
      <h2>FCFS Schedule</h2>
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1%' }}>
        {generateTimeline()}
      </div>
      <div style={{ display: 'flex', marginLeft: '1%' }}>
        {generateTimeTicks()}
      </div>
      <div>
        <p>Average Waiting Time: {averageWaitingTime.toFixed(2)}</p>
        <p>Average Turnaround Time: {averageTurnaroundTime.toFixed(2)}</p>
        <p>Throughput: {throughput.toFixed(3)} processes/unit time</p>
      </div>
    </div>
  );
}

export default FCFS;
