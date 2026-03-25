export type SortStep = {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
};

export function bubbleSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  const sorted: number[] = [];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push({ array: [...a], comparing: [j, j + 1], swapping: [], sorted: [...sorted] });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ array: [...a], comparing: [], swapping: [j, j + 1], sorted: [...sorted] });
      }
    }
    sorted.push(a.length - i - 1);
  }
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: a.map((_, i) => i) });
  return steps;
}

export function insertionSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  const sorted: number[] = [];
  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0 && a[j - 1] > a[j]) {
      steps.push({ array: [...a], comparing: [j - 1, j], swapping: [], sorted: [...sorted] });
      [a[j - 1], a[j]] = [a[j], a[j - 1]];
      steps.push({ array: [...a], comparing: [], swapping: [j - 1, j], sorted: [...sorted] });
      j--;
    }
  }
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: a.map((_, i) => i) });
  return steps;
}

export function selectionSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  const sorted: number[] = [];
  for (let i = 0; i < a.length; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      steps.push({ array: [...a], comparing: [min, j], swapping: [], sorted: [...sorted] });
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      steps.push({ array: [...a], comparing: [], swapping: [i, min], sorted: [...sorted] });
    }
    sorted.push(i);
  }
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: a.map((_, i) => i) });
  return steps;
}

export function mergeSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];

  function merge(start: number, mid: number, end: number) {
    const left = a.slice(start, mid + 1);
    const right = a.slice(mid + 1, end + 1);
    let i = 0, j = 0, k = start;
    while (i < left.length && j < right.length) {
      steps.push({ array: [...a], comparing: [start + i, mid + 1 + j], swapping: [], sorted: [] });
      if (left[i] <= right[j]) {
        a[k++] = left[i++];
      } else {
        a[k++] = right[j++];
      }
      steps.push({ array: [...a], comparing: [], swapping: [k - 1], sorted: [] });
    }
    while (i < left.length) { a[k++] = left[i++]; steps.push({ array: [...a], comparing: [], swapping: [k - 1], sorted: [] }); }
    while (j < right.length) { a[k++] = right[j++]; steps.push({ array: [...a], comparing: [], swapping: [k - 1], sorted: [] }); }
  }

  function sort(start: number, end: number) {
    if (start >= end) return;
    const mid = Math.floor((start + end) / 2);
    sort(start, mid);
    sort(mid + 1, end);
    merge(start, mid, end);
  }

  sort(0, a.length - 1);
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: a.map((_, i) => i) });
  return steps;
}

export function quickSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];

  function partition(low: number, high: number): number {
    const pivot = a[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({ array: [...a], comparing: [j, high], swapping: [], sorted: [] });
      if (a[j] < pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        steps.push({ array: [...a], comparing: [], swapping: [i, j], sorted: [] });
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    steps.push({ array: [...a], comparing: [], swapping: [i + 1, high], sorted: [] });
    return i + 1;
  }

  function sort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    }
  }

  sort(0, a.length - 1);
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: a.map((_, i) => i) });
  return steps;
}

export const sortingAlgoInfo: Record<string, { explanation: string; timeComplexity: { best: string; average: string; worst: string }; code: string }> = {
  "Bubble Sort": {
    explanation: "Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.",
    timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    code: "for i = 0 to n-1\n  for j = 0 to n-i-2\n    if arr[j] > arr[j+1]\n      swap(arr[j], arr[j+1])",
  },
  "Insertion Sort": {
    explanation: "Insertion Sort builds the final sorted array one item at a time. It picks each element and inserts it into its correct position among the previously sorted elements.",
    timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    code: "for i = 1 to n-1\n  key = arr[i]\n  j = i - 1\n  while j >= 0 and arr[j] > key\n    arr[j+1] = arr[j]\n    j = j - 1\n  arr[j+1] = key",
  },
  "Selection Sort": {
    explanation: "Selection Sort divides the array into a sorted and unsorted region. It repeatedly selects the smallest element from the unsorted region and moves it to the sorted region.",
    timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
    code: "for i = 0 to n-1\n  min_idx = i\n  for j = i+1 to n\n    if arr[j] < arr[min_idx]\n      min_idx = j\n  swap(arr[i], arr[min_idx])",
  },
  "Merge Sort": {
    explanation: "Merge Sort is a divide-and-conquer algorithm that divides the array into halves, recursively sorts them, and then merges the sorted halves back together.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    code: "mergeSort(arr, l, r)\n  if l < r\n    m = (l+r)/2\n    mergeSort(arr, l, m)\n    mergeSort(arr, m+1, r)\n    merge(arr, l, m, r)",
  },
  "Quick Sort": {
    explanation: "Quick Sort selects a pivot element, partitions the array around the pivot so that smaller elements are on the left and larger on the right, then recursively sorts both sides.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
    code: "quickSort(arr, low, high)\n  if low < high\n    pi = partition(arr, low, high)\n    quickSort(arr, low, pi-1)\n    quickSort(arr, pi+1, high)",
  },
};
