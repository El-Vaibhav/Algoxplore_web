export type ScheduleBlock = {
  processId: number;
  start: number;
  end: number;
};

export type ScheduleResult = {
  gantt: ScheduleBlock[];
  waitingTime: number[];
  turnaroundTime: number[];
};

export function fcfs(arrival: number[], burst: number[]): ScheduleResult {
  const n = arrival.length;
  const indices = Array.from({ length: n }, (_, i) => i).sort((a, b) => arrival[a] - arrival[b]);
  const gantt: ScheduleBlock[] = [];
  let time = 0;
  const completion = Array(n).fill(0);

  for (const i of indices) {
    if (time < arrival[i]) time = arrival[i];
    gantt.push({ processId: i, start: time, end: time + burst[i] });
    time += burst[i];
    completion[i] = time;
  }

  return buildResult(arrival, burst, completion, gantt);
}

export function sjf(arrival: number[], burst: number[]): ScheduleResult {

  const n = arrival.length;
  const done = Array(n).fill(false);
  const completion = Array(n).fill(0);
  const gantt: ScheduleBlock[] = [];

  let time = 0;
  let completed = 0;

  while (completed < n) {

    let best = -1;

    for (let i = 0; i < n; i++) {

      if (!done[i] && arrival[i] <= time) {

        if (
          best === -1 ||
          burst[i] < burst[best] ||
          (burst[i] === burst[best] && arrival[i] < arrival[best])
        ) {
          best = i;
        }

      }

    }

    // CPU idle
    if (best === -1) {
      time++;
      continue;
    }

    gantt.push({
      processId: best,
      start: time,
      end: time + burst[best]
    });

    time += burst[best];
    completion[best] = time;

    done[best] = true;
    completed++;
  }

  return buildResult(arrival, burst, completion, gantt);
}

export function srtf(arrival: number[], burst: number[]): ScheduleResult {

  const n = arrival.length;

  const remaining = [...burst];
  const completion = Array(n).fill(0);
  const gantt: ScheduleBlock[] = [];

  let time = 0;
  let completed = 0;

  while (completed < n) {

    let best = -1;

    for (let i = 0; i < n; i++) {

      if (remaining[i] > 0 && arrival[i] <= time) {

        if (
          best === -1 ||
          remaining[i] < remaining[best] ||
          (remaining[i] === remaining[best] && arrival[i] < arrival[best])
        ) {
          best = i;
        }

      }

    }

    // CPU idle
    if (best === -1) {
      time++;
      continue;
    }

    if (
      gantt.length > 0 &&
      gantt[gantt.length - 1].processId === best
    ) {
      gantt[gantt.length - 1].end = time + 1;
    } else {
      gantt.push({
        processId: best,
        start: time,
        end: time + 1
      });
    }

    remaining[best]--;
    time++;

    if (remaining[best] === 0) {
      completion[best] = time;
      completed++;
    }

  }

  return buildResult(arrival, burst, completion, gantt);
}

export function roundRobin(
  arrival: number[],
  burst: number[],
  quantum: number
): ScheduleResult {

  const n = arrival.length;

  const remaining = [...burst];
  const completion = Array(n).fill(0);
  const gantt: ScheduleBlock[] = [];

  const queue: number[] = [];
  const inQueue = Array(n).fill(false);

  let time = 0;
  let completed = 0;

  const processes = arrival
    .map((a, i) => ({ id: i, arrival: a }))
    .sort((a, b) => a.arrival - b.arrival);

  let nextArrivalIndex = 0;

  while (completed < n) {

    // add newly arrived processes
    while (
      nextArrivalIndex < n &&
      processes[nextArrivalIndex].arrival <= time
    ) {
      const pid = processes[nextArrivalIndex].id;

      if (!inQueue[pid] && remaining[pid] > 0) {
        queue.push(pid);
        inQueue[pid] = true;
      }

      nextArrivalIndex++;
    }

    // CPU idle
    if (queue.length === 0) {
      time++;
      continue;
    }

    const pid = queue.shift()!;
    inQueue[pid] = false;

    const exec = Math.min(quantum, remaining[pid]);

    gantt.push({
      processId: pid,
      start: time,
      end: time + exec
    });

    time += exec;
    remaining[pid] -= exec;

    // add arrivals during execution
    while (
      nextArrivalIndex < n &&
      processes[nextArrivalIndex].arrival <= time
    ) {
      const newPid = processes[nextArrivalIndex].id;

      if (!inQueue[newPid] && remaining[newPid] > 0) {
        queue.push(newPid);
        inQueue[newPid] = true;
      }

      nextArrivalIndex++;
    }

    if (remaining[pid] > 0) {
      queue.push(pid);
      inQueue[pid] = true;
    } else {
      completion[pid] = time;
      completed++;
    }
  }

  return buildResult(arrival, burst, completion, gantt);
}

export function priorityScheduling(
  arrival: number[],
  burst: number[],
  priority: number[]
): ScheduleResult {

  const n = arrival.length;

  const done = Array(n).fill(false);
  const completion = Array(n).fill(0);
  const gantt: ScheduleBlock[] = [];

  let time = 0;
  let completed = 0;

  while (completed < n) {

    let best = -1;

    for (let i = 0; i < n; i++) {

      if (!done[i] && arrival[i] <= time) {

        if (
          best === -1 ||
          priority[i] < priority[best] ||
          (priority[i] === priority[best] && arrival[i] < arrival[best])
        ) {
          best = i;
        }

      }

    }

    // CPU idle
    if (best === -1) {
      time++;
      continue;
    }

    gantt.push({
      processId: best,
      start: time,
      end: time + burst[best]
    });

    time += burst[best];
    completion[best] = time;

    done[best] = true;
    completed++;
  }

  return buildResult(arrival, burst, completion, gantt);
}

export function priorityPreemptive(
  arrival: number[],
  burst: number[],
  priority: number[]
): ScheduleResult {

  const n = arrival.length;

  const remaining = [...burst];
  const completion = Array(n).fill(0);
  const gantt: ScheduleBlock[] = [];

  let time = 0;
  let completed = 0;

  while (completed < n) {

    let best = -1;

    for (let i = 0; i < n; i++) {

      if (remaining[i] > 0 && arrival[i] <= time) {

        if (
          best === -1 ||
          priority[i] < priority[best] ||
          (priority[i] === priority[best] && arrival[i] < arrival[best])
        ) {
          best = i;
        }

      }

    }

    // CPU idle
    if (best === -1) {
      time++;
      continue;
    }

    // extend gantt block if same process
    if (
      gantt.length > 0 &&
      gantt[gantt.length - 1].processId === best
    ) {
      gantt[gantt.length - 1].end = time + 1;
    } else {
      gantt.push({
        processId: best,
        start: time,
        end: time + 1
      });
    }

    remaining[best]--;
    time++;

    if (remaining[best] === 0) {
      completion[best] = time;
      completed++;
    }

  }

  return buildResult(arrival, burst, completion, gantt);
}

function buildResult(arrival: number[], burst: number[], completion: number[], gantt: ScheduleBlock[]): ScheduleResult {
  const n = arrival.length;
  const turnaroundTime = Array(n).fill(0);
  const waitingTime = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    turnaroundTime[i] = completion[i] - arrival[i];
    waitingTime[i] = turnaroundTime[i] - burst[i];
  }
  return { gantt, waitingTime, turnaroundTime };
}

export const schedulingAlgoInfo: Record<
  string,
  {
    explanation: string;
    pseudocode: string;
    timeComplexity: { best: string; average: string; worst: string };
    needsPriority: boolean;
    needsQuantum: boolean;
  }
> = {

  FCFS: {
    explanation:
      "First Come First Served (FCFS) is the simplest CPU scheduling algorithm. Processes are executed in the order they arrive in the ready queue. It is a non-preemptive scheduling algorithm, meaning once a process starts execution it runs until completion. FCFS can suffer from the convoy effect where a long process delays all shorter processes.",

    pseudocode:
`FCFS(arrival, burst):

1. Sort processes by arrival time
2. time = 0

3. for each process i:
      if time < arrival[i]
            time = arrival[i]      // CPU idle

      start = time
      time = time + burst[i]
      completion[i] = time

4. turnaround[i] = completion[i] - arrival[i]
5. waiting[i] = turnaround[i] - burst[i]

6. return schedule`,

    timeComplexity: {
      best: "O(n)",
      average: "O(n)",
      worst: "O(n)"
    },

    needsPriority: false,
    needsQuantum: false
  },

  SJF: {
    explanation:
      "Shortest Job First (SJF) selects the process with the smallest burst time among the processes that have arrived. It is a non-preemptive scheduling algorithm. SJF minimizes the average waiting time but requires knowledge of burst time in advance.",

    pseudocode:
`SJF(arrival, burst):

1. completed = 0
2. time = 0

3. while completed < n:

      find process i such that
      arrival[i] <= time
      and burst[i] is minimum
      among unfinished processes

      if no process found:
            time++
            continue

      start = time
      time = time + burst[i]
      completion[i] = time

      mark process i finished
      completed++

4. turnaround[i] = completion[i] - arrival[i]
5. waiting[i] = turnaround[i] - burst[i]`,

    timeComplexity: {
      best: "O(n²)",
      average: "O(n²)",
      worst: "O(n²)"
    },

    needsPriority: false,
    needsQuantum: false
  },

  SRTF: {
    explanation:
      "Shortest Remaining Time First (SRTF) is the preemptive version of SJF. The scheduler always runs the process with the smallest remaining burst time. If a new process arrives with a smaller burst time than the currently running process, the CPU preempts the current process.",

    pseudocode:
`SRTF(arrival, burst):

1. remaining[i] = burst[i]
2. time = 0
3. completed = 0

4. while completed < n:

      find process i such that
      arrival[i] <= time
      and remaining[i] is minimum

      if no process found:
            time++
            continue

      execute process i for 1 unit
      remaining[i]--

      if remaining[i] == 0:
            completion[i] = time + 1
            completed++

      time++

5. turnaround[i] = completion[i] - arrival[i]
6. waiting[i] = turnaround[i] - burst[i]`,

    timeComplexity: {
      best: "O(n²)",
      average: "O(n²)",
      worst: "O(n²)"
    },

    needsPriority: false,
    needsQuantum: false
  },

  "Round Robin": {
    explanation:
      "Round Robin (RR) scheduling assigns a fixed time quantum to each process. Processes are executed in a circular queue. Each process gets CPU for at most one time quantum. If the process is not finished, it is placed at the end of the queue. Round Robin is widely used in time-sharing systems because it ensures fairness.",

    pseudocode:
`RoundRobin(arrival, burst, quantum):

1. remaining[i] = burst[i]
2. create empty queue Q
3. time = 0

4. while not all processes completed:

      add processes whose arrival <= time to Q

      if Q empty:
            time++
            continue

      process = dequeue(Q)

      execute process for
            min(quantum, remaining)

      time += execution

      remaining -= execution

      add newly arrived processes to Q

      if remaining > 0
            enqueue(process)

      else
            completion[process] = time

5. turnaround[i] = completion[i] - arrival[i]
6. waiting[i] = turnaround[i] - burst[i]`,

    timeComplexity: {
      best: "O(n)",
      average: "O(n)",
      worst: "O(n)"
    },

    needsPriority: false,
    needsQuantum: true
  },

  Priority: {
    explanation:
      "Priority Scheduling assigns each process a priority value. The process with the highest priority (lowest numeric value) is executed first. In the non-preemptive version, once a process starts execution it runs until completion. Priority scheduling may lead to starvation of low priority processes.",

    pseudocode:
`PriorityScheduling(arrival, burst, priority):

1. completed = 0
2. time = 0

3. while completed < n:

      find process i such that
      arrival[i] <= time
      and priority[i] is highest
      among unfinished processes

      if no process found:
            time++
            continue

      start = time
      time = time + burst[i]
      completion[i] = time

      mark process finished
      completed++

4. turnaround[i] = completion[i] - arrival[i]
5. waiting[i] = turnaround[i] - burst[i]`,

    timeComplexity: {
      best: "O(n²)",
      average: "O(n²)",
      worst: "O(n²)"
    },

    needsPriority: true,
    needsQuantum: false
  },

  "Priority (Preemptive)": {
  explanation:
    "Preemptive Priority Scheduling selects the process with the highest priority at every unit of time. If a new process arrives with higher priority than the currently running process, it preempts the CPU.",

  pseudocode:
`PriorityPreemptive(arrival, burst, priority):

1. remaining[i] = burst[i]
2. time = 0
3. completed = 0

4. while completed < n:

      find process i such that
      arrival[i] <= time
      and priority[i] is highest

      if no process found:
            time++
            continue

      execute process i for 1 unit
      remaining[i]--

      if remaining[i] == 0:
            completion[i] = time + 1
            completed++

      time++

5. turnaround = completion - arrival
6. waiting = turnaround - burst`,

  timeComplexity: {
    best: "O(n²)",
    average: "O(n²)",
    worst: "O(n²)"
  },

  needsPriority: true,
  needsQuantum: false
},

};