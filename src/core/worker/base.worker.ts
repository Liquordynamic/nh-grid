import * as func from './func.worker'
import Actor from '../message/actor'

type FuncModule = { [ key: string ]: Function }
declare const self: WorkerGlobalScope & Record<string, any>

self.actor = new Actor(self, globalThis)
for (const key in func) {

    const element = (func as FuncModule)[key]
    if (element) self[key] = element
}

