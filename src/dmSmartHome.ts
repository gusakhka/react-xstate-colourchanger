import { MachineConfig, send, Action, assign } from "xstate";
import { dmMkapp } from "./mkapp";
import {grammar} from "./grammars/smart-command-grammar"
import { loadGrammar } from './runparser'
import { parse } from './chartparser'
import * as SRGS from './srgs'

export function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

export function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}


function getCommand(input:String) {
    const gram = loadGrammar(grammar);
    const prs = parse(input.split(/\s+/), gram);
    const result = prs.resultsForRule(gram.$root)[0];
    console.log(result)
    const output = result.object + " " + result.action
    return output
}

const commands = ["turn off the light",
'turn on the light',
'turn off the air conditioning',
'turn on the air conditioning',
'turn off the AC',
'turn on the AC',
'turn on the heat',
'turn off the heat',
'open the window',
'close the door',
'open the door',
'close the window']

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'init',
    states: {
        init: {
            on: {
                CLICK: 'welcome'
            }
        },
        welcome: {
            initial: "prompt",
            on: { ENDSPEECH: "todo" },
            states: {
                prompt: { entry: say("Welcome it's nice to meet you") }
            }
        },
        todo: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => commands.includes(context.recResult),
                    actions: assign((context) => { return { task: getCommand(context.recResult) } }),
                    target: "doneit"
                },
                { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: say("What can i do for you?"),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I can not do that"),
                    on: { ENDSPEECH: "prompt" }
                },
            },
        },
        doneit: {
            initial: "prompt",
            on: { 
                ENDSPEECH: "init" },
            states: {
                prompt: {
                    entry : say("ok have a nice day"), 
                     
                },
            },
        },
    },   
})               