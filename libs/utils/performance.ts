export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    if (!start) return 0;

    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (!end) return 0;

    return end - start;
  }

  clear(): void {
    this.marks.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

