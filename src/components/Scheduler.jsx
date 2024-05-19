import React, { useState } from 'react';
import FCFS from './FCFS';
import RoundRobin from './RoundRobin';
import SRTF from './SRTF';
import Priority from './Priority';

function Scheduler() {
  const [processes, setProcesses] = useState([]);
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [quantum, setQuantum] = useState(2);
  const [showResult, setShowResult] = useState(false);

  const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const addProcess = () => {
    const arrivalTime = processes.length; // Incremental arrival time
    const burstTime = getRandomInt(1, 10);
    const memory = getRandomInt(1, 100);
    const priority = getRandomInt(1, 10);

    setProcesses([...processes, {
      pid: `P${processes.length + 1}`,
      arrivalTime,
      burstTime,
      memory,
      priority,
      status: ''
    }]);
  };

  const handleAlgorithmChange = (e) => {
    setAlgorithm(e.target.value);
    setProcesses([]);
    setShowResult(false);
  };

  const executeScheduler = () => {
    setShowResult(true);
  };

  return (
    <div>
      <h1>Scheduler Simulator</h1>
      <div>
        <select onChange={handleAlgorithmChange} value={algorithm}>
          <option value="FCFS">FCFS</option>
          <option value="RoundRobin">Round Robin</option>
          <option value="SRTF">SRTF</option>
          <option value="Priority">Priority</option>
        </select>
        {algorithm === 'RoundRobin' && (
          <input
            type="number"
            value={quantum}
            onChange={(e) => setQuantum(parseInt(e.target.value))}
            placeholder="Quantum"
          />
        )}
        <button onClick={addProcess}>Add Process</button>
        <button onClick={executeScheduler}>Execute</button>
      </div>
      <div>
        <h2>Process Control Block</h2>
        <div style={{ maxHeight: '200px', overflowY: 'scroll' }}>
          <table>
            <thead>
              <tr>
                <th>PID</th>
                <th>Arrival Time</th>
                <th>Burst Time</th>
                <th>Memory</th>
                {algorithm === 'Priority' && <th>Priority</th>}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process, index) => (
                <tr key={index}>
                  <td>{process.pid}</td>
                  <td>{process.arrivalTime}</td>
                  <td>{process.burstTime}</td>
                  <td>{process.memory}</td>
                  {algorithm === 'Priority' && <td>{process.priority}</td>}
                  <td>{process.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        {showResult && algorithm === 'FCFS' && <FCFS processes={processes} />}
        {showResult && algorithm === 'RoundRobin' && <RoundRobin processes={processes} quantum={quantum} />}
        {showResult && algorithm === 'SRTF' && <SRTF processes={processes} />}
        {showResult && algorithm === 'Priority' && <Priority processes={processes} />}
      </div>
    </div>
  );
}

export default Scheduler;
