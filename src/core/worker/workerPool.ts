export const PRELOAD_POOL_ID = 'preloaded_worker_pool'

class WorkerPool {

    private static _instance: WorkerPool

    static workerCount: number
    static extensions: Array<string>

    active: Partial<Record<number | string, boolean>>
    workers: Array<Worker>

    constructor() {

        this.active = {}
        this.workers = []
    }

    static get instance(): WorkerPool {

        if (!WorkerPool._instance) {
            WorkerPool._instance = new WorkerPool()
        }

        return WorkerPool._instance
    }

    acquire(id: number | string): Array<Worker> {

        if (this.workers.length === 0) {

            while (this.workers.length < WorkerPool.workerCount) {
                
                this.workers.push(createWorker())
            }
        }

        this.active[id] = true
        return this.workers.slice()
    }

    release(id: number | string) {

        delete this.active[id]
        if (this.workers && this.numActive() === 0) {
            this.workers.forEach(w => {
                w.terminate
            })
            this.workers = []
        }
    }

    isPreloaded(): boolean {

        return !!this.active[PRELOAD_POOL_ID]
    }

    numActive(): number {

        return Object.keys(this.active).length
    }
}

function createWorker() {

    const worker = new Worker(new URL('./base.worker.ts', import.meta.url), {type: 'module'})!
    return worker
}

const hardwareConcurrency = typeof window !== 'undefined' ? (window.navigator.hardwareConcurrency || 2) : 2
WorkerPool.workerCount = Math.min(hardwareConcurrency, 2)

export default WorkerPool
