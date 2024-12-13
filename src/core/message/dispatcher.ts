import Actor from './actor'
import WorkerPool from '../worker/workerPool'
import { uniqueId, asyncAll } from '../utils'
import type { Class, Callback } from '../types'

class Dispatcher {

    ready = false
    id = uniqueId()
    currentActor = 0
    activeActorCount = 0
    actors: Array<Actor> = []
    workerPool = WorkerPool.instance

    static Actor: Class<Actor>

    constructor(parent: any) {

        this.workerPool.acquire(this.id).forEach((worker, index) => {
            const actor = new Actor(worker, parent)
            actor.name = `Worker ${index}`
            this.actors.push(actor)
        })
        this.broadcast('checkIfReady', null, () => { this.ready = true })
    }

    broadcast(type: string, data: unknown, cb?: Callback<unknown>) {

        cb = cb || function (){}
        asyncAll(this.actors, (actor, done) => {
            actor.send(type, data, done)
        }, cb)
    }

    getActor(): Actor {

        this.currentActor = (this.currentActor + 1) % this.actors.length
        return this.actors[this.currentActor]
    }

    remove() {
        this.actors.forEach(actor => actor.remove())
        this.actors = []
        this.workerPool.release(this.id)
    }
}

export default Dispatcher
