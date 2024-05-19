import React from 'react';

function RoundRobin({ processes, quantum }) {
  const schedule = [];
  const processQueue = [];
  const processDetails = processes.map((p, index) => ({
    ...p,
    remainingBurstTime: p.burstTime,
    id: index + 1,
    arrivalTime: p.arrivalTime,
    totalWaitTime: 0,
    lastEndTime: 0,
  }));

  let currentTime = 0;

  while (processDetails.length > 0 || processQueue.length > 0) {
    // Add all processes that have arrived by the current time to the queue
    while (processDetails.length > 0 && processDetails[0].arrivalTime <= currentTime) {
      processQueue.push(processDetails.shift());
    }

    if (processQueue.length > 0) {
      const process = processQueue.shift();
      const startTime = currentTime;
      const execTime = Math.min(process.remainingBurstTime, quantum);
      const endTime = startTime + execTime;

      schedule.push({
        process: `P${process.id}`,
        startTime,
        endTime,
        arrivalTime: process.arrivalTime,
      });

      currentTime = endTime;
      process.remainingBurstTime -= execTime;

      // Calculate waiting time for the current slice
      if (process.lastEndTime > 0) {
        process.totalWaitTime += startTime - process.lastEndTime;
      } else {
        process.totalWaitTime += startTime - process.arrivalTime;
      }

      process.lastEndTime = endTime;

      // Add any new processes that have arrived during this time slice
      while (processDetails.length > 0 && processDetails[0].arrivalTime <= currentTime) {
        processQueue.push(processDetails.shift());
      }

      if (process.remainingBurstTime > 0) {
        processQueue.push(process);
      }
    } else {
      // If no process is ready, jump to the next process's arrival time or increment time
      currentTime = processDetails.length > 0 ? processDetails[0].arrivalTime : currentTime + 1;
    }
  }

  // Calculate total timeline duration
  const totalDuration = schedule.length > 0 ? schedule[schedule.length - 1].endTime : 0;

  // Calculate waiting times and turnaround times
  const finalProcessDetails = processes.map((p, index) => {
    const processSchedule = schedule.filter(s => s.process === `P${index + 1}`);
    const lastEndTime = processSchedule.length > 0 ? processSchedule[processSchedule.length - 1].endTime : 0;
    const turnaroundTime = lastEndTime - p.arrivalTime;
    const waitingTime = processSchedule.reduce((acc, s, idx) => {
      const prevEndTime = idx === 0 ? p.arrivalTime : processSchedule[idx - 1].endTime;
      return acc + (s.startTime - prevEndTime);
    }, 0);
    return {
      ...p,
      waitingTime,
      turnaroundTime,
    };
  });

  const totalWaitingTime = finalProcessDetails.reduce((acc, p) => acc + p.waitingTime, 0);
  const totalTurnaroundTime = finalProcessDetails.reduce((acc, p) => acc + p.turnaroundTime, 0);
  const averageWaitingTime = totalWaitingTime / processes.length;
  const averageTurnaroundTime = totalTurnaroundTime / processes.length;
  const throughput = processes.length / totalDuration;

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

  // Function to assign colors based on process IDs
const assignColor = (processId) => {
  // You can define your color logic here, for example:
  // For simplicity, let's say P1 gets red, P2 gets green, and so on
  switch(processId) {
    case 1:
      return '#800000';
    case 2:
      return '#e6194B';
    case 3:
      return '#fabed4';
    case 4:
      return '#000075';
    case 5:
      return '#dcbeff';
    case 6:
      return '#9A6324';
    case 7:
      return '#ffe119';
    case 8:
      return '#42d4f4';
    case 9:
      return '#469990';
    case 10:
      return '#f58231';
    case 11:
      return '#808000';
    case 12:
      return '#aaffc3';
    case 13:
      return '#911eb4';
    case 14:
      return '#fffac8';
    case 15:
      return '#ffd8b1';
    case 16:
      return '#bfef45';
    case 17:
      return '#3cb44b';
    case 18:
      return '#4363d8';
    case 19:
      return '#f032e6';
    case 20:
      return '#ffd8b1';
    default:
      return 'black'; // Default color
  }
};

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
    // Render the current process with assigned color
    timeline.push(
      <div
        key={index}
        style={{
          width: `${((s.endTime - s.startTime) / totalDuration) * 100}%`,
          height: '20px',
          background: assignColor(parseInt(s.process.replace('P', ''), 10)), // Assign color based on process ID
          border: '1px solid black',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {s.process}
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
      <h2>Round Robin Schedule</h2>
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1%' }}>
        {generateTimeline()}
      </div>
      <div style={{ display: 'flex', marginLeft: '1%' }}>
        {generateTimeTicks()}
      </div>
      <div>
        <p>Average Waiting Time: {averageWaitingTime.toFixed(2)}</p>
        <p>Average Turnaround Time: {averageTurnaroundTime.toFixed(2)}</p>
        <p>Throughput: {throughput.toFixed(4)} processes/unit time</p>
      </div>
    </div>
  );
}

export default RoundRobin;
