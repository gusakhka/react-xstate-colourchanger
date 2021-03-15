import { MachineConfig, send, Action, assign } from "xstate";
import { dmMkapp } from "./mkapp";



export function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

export function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}

const grammar: { [index: string]: { person?: string, day?: string, time?: string } } = {
    //PERSON
    "John": { person: "John Appleseed" },
    "Olivia": { person: "Olivia Smith" },
    "Daniel": { person: "Daniel Jones" },
    "James": { person: "James Williams" },
    "Mia": { person: "Mia Wilson" },
    "Jack": { person: "Jack Evans" },
    "Emily": { person: "Emily Thomas" },
    
    //DAYS
    "on Monday": { day: "Monday" },
    "Monday": { day: "Monday" },
    "on Tuesday": { day: "Tuesda" },
    "Tuesday": { day: "Tuesda" },
    "on Wednesday": { day: "Wednesday" },
    "Wednesday": { day: "Wednesday" },
    "on Thursday": { day: "Thursday" },
    "Thursday": { day: "Thursday" },
    "on Friday": { day: "Friday" },
    "Friday": { day: "Friday" },
    "on Saturday": { day: "Saturday" },
    "Saturday": { day: "Saturday" },
    "on Sunday": { day: "Sunday" },
    "Sunday": { day: "Sunday" },

    //TIMES
    "at 1": { time: "01:00" },
    "1": { time: "01:00" },
    "at 2": { time: "02:00" },
    "2": { time: "02:00" },
    "at 3": { time: "03:00" },
    "t3": { time: "03:00" },
    "at 4": { time: "04:00" },
    "4": { time: "04:00" },
    "at 5": { time: "05:00" },
    "5": { time: "05:00" },
    "at 6": { time: "06:00" },
    "6": { time: "06:00" },
    "at 7": { time: "07:00" },
    "7": { time: "07:00" },
    "at 8": { time: "08:00" },
    "8": { time: "08:00" },
    "at 9": { time: "09:00" },
    "9": { time: "09:00" },
    "at 10": { time: "10:00" },
    "10": { time: "10:00" },
    "at 11": { time: "11:00" },
    "11": { time: "11:00" },
    "at 12": { time: "12:00" },
    "12": { time: "12:00" }
}

const BooleanGrammar: { [index: string]: { clarity?: boolean } } = {
    //TRUE
    "yes": { clarity: true },
    "of course": { clarity: true },
    "alright": { clarity: true },
    "very well": { clarity: true },
    "sure": { clarity: true },
    "agreed": { clarity: true },
    "absolutely": { clarity: true },
    "surely": { clarity: true },
    //FALSE
    "no": { clarity: false },
    "nope": { clarity: false },
    "nah": { clarity: false },
    "negative": { clarity: false },
    "no indeed": { clarity: false },
    "no thanks": { clarity: false },
    "not at all": { clarity: false }

}



export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'begin',
    id: "appointment",
    states: {
        begin: {
            initial: "init",
            states: {
                hist: { type: 'history' },
                init: {
                    on: {
                        CLICK: 'welcome'
                    }
                },
                welcome: {
                    initial: "prompt",
                    on: { ENDSPEECH: "who" },
                    states: {
                        prompt: { entry: say("Let's create an appointment") }
                    }
                },
                who: {
                    initial: "prompt",
                    on: {
                        RECOGNISED: [
                            {target: "#root.dm.help",cond: (context) => context.recResult === 'help'},
                            {cond: (context) => "person" in (grammar[context.recResult] || {}),
                            actions: assign((context) => { return { person: grammar[context.recResult].person } }),
                            target: "day"},
                            { target: ".nomatch"}],
                        MAXSPEECH: [
                            {
                                actions: assign((context) => { return { counts: context.counts ? context.counts+1 : 1 } }),
                                cond: (context) => !context.counts || context.counts < 3,
                                target: ".timeoutnomatch"
                            },  
                            {   actions: assign((context) => { return { counts: 0 } }),
                            cond: (context) => context.counts >= 3,target: "maxtimeout"
                            }
                        ]
                    },   
                        
                    states: {
                        prompt: {
                            entry: say("Who are you meeting with?"),
                            on: { ENDSPEECH: "ask" }
                        },
                        ask: {
                            entry: [send('LISTEN'), send('MAXSPEECH', { delay: 5000, id: "timeout" })]
                        },
                        nomatch: {
                            entry: say("Sorry Would you please tell me, who you are meeting with?"),
                            on: { ENDSPEECH: "ask" }
                        },

                        timeoutnomatch: {
                            entry: say("Sorry I could not get any answer from you. I'll repeat! Would you please tell me, who you are meeting with?"),
                            on: {
                                ENDSPEECH: "ask",
                            },
                        },

                    }
                },
                day: {
                    initial: "prompt",
                    on: {
                        RECOGNISED: [
                            { target: "#root.dm.help",cond: (context) => context.recResult === 'help'},
                            {cond: (context) => "day" in (grammar[context.recResult] || {}),
                            actions: assign((context) => { return { day: grammar[context.recResult].day } }),
                            target: "wholeday"},
                            { target: ".nomatch" }],

                        MAXSPEECH: [
                            {
                                actions: assign((context) => { return { counts: context.counts ? context.counts+1 : 1 } }),
                                cond: (context) => !context.counts || context.counts < 3,
                                target: ".timeoutnomatch"
                            },  
                            {   actions: assign((context) => { return { counts: 0 } }),
                                cond: (context) => context.counts >= 3, target: "maxtimeout"
                            }
                        ]
                    },
                    states: {
                        prompt: {
                            entry: send((context) => ({
                                type: "SPEAK",
                                value: `OK. ${context.person}. On which day is your meeting?`
                            })),
                            on: { ENDSPEECH: "ask" }
                        },
                        ask: {
                            entry: [send('LISTEN'), send('MAXSPEECH', { delay: 5000, id: "timeout" })]
                        },
                        nomatch: {
                            entry: say("Sorry Would you please indicate a suitable day ? "),
                            on: { ENDSPEECH: "ask" }
                        },
                        timeoutnomatch: {
                            entry: say("Sorry I could not get any answer from you. I'll repeat!"),
                            on: {
                                ENDSPEECH: "ask",
                            },
                        },
                    }
                },


                wholeday: {
                    initial: "prompt",
                    on: {
                        RECOGNISED: [
                            { target: "#root.dm.help",cond: (context) => context.recResult === 'help'},
                        {
                            cond: (context) => BooleanGrammar[context.recResult].clarity === true,
                            actions: assign((context) => { return { clarity: BooleanGrammar[context.recResult].clarity } }),
                            target: "wholeday_is_confirmed"

                        },
                        {
                            cond: (context) => BooleanGrammar[context.recResult].clarity === false,
                            actions: assign((context) => { return { clarity: BooleanGrammar[context.recResult].clarity } }),
                            target: "Determination_time"

                        },
                        { target: ".nomatch" }],
                        MAXSPEECH: [
                            {
                                actions: assign((context) => { return { counts: context.counts ? context.counts+1 : 1 } }),
                                cond: (context) => !context.counts || context.counts < 3,
                                target: ".timeoutnomatch"
                            },  
                            {
                                actions: assign((context) => { return { counts: 0 } }), cond: (context) => context.counts >= 3, target: "maxtimeout"
                            }
                        ]
                    },
                    states: {
                        prompt: {
                            entry: send((context) => ({
                                type: "SPEAK",
                                value: `OK. ${context.day}. Will it take the whole day?`
                            })),
                            on: { ENDSPEECH: "ask" }
                        },
                        ask: {
                            entry: [send('LISTEN'), send('MAXSPEECH', { delay: 5000, id: "timeout" })]
                        },
                        nomatch: {
                            entry: say("Sorry I didn't catch what you said, would you please say that Will it take the whole day? "),
                            on: { ENDSPEECH: "ask" }
                        },
                        timeoutnomatch: {
                            entry: say("Sorry I could not get any answer from you. I'll repeat!"),
                            on: {
                                ENDSPEECH: "ask",
                            },
                        },
                    }
                },


                wholeday_is_confirmed: {
                    initial: "prompt",
                    on: {
                        RECOGNISED: [{ target: "#root.dm.help",cond: (context) => context.recResult === 'help'},
                        {
                            cond: (context) => BooleanGrammar[context.recResult].clarity === true,
                            actions: assign((context) => { return { clarity: BooleanGrammar[context.recResult].clarity } }),
                            target: "create_appointment"

                        },
                        {
                            cond: (context) => BooleanGrammar[context.recResult].clarity === false,
                            actions: assign((context) => { return { clarity: BooleanGrammar[context.recResult].clarity } }),
                            target: "who"

                        },
                        { target: ".nomatch" }],
                        MAXSPEECH: [
                            {
                                actions: assign((context) => { return { counts: context.counts ? context.counts+1 : 1 } }),
                                cond: (context) => !context.counts || context.counts < 3,
                                target: ".timeoutnomatch"
                            },  
                            {
                                actions: assign((context) => { return { counts: 0 } }), cond: (context) => context.counts >= 3, target: "maxtimeout"
                            }
                        ]
                    },
                    states: {
                        prompt: {
                            entry: send((context) => ({
                                type: "SPEAK",
                                value: `OK. Do you want me to create an appointment with ${context.person} on ${context.day} for the whole day?`
                            })),
                            on: { ENDSPEECH: "ask" }
                        },
                        ask: {
                            entry: [send('LISTEN'), send('MAXSPEECH', { delay: 5000, id: "timeout" })]
                        },
                        nomatch: {
                            entry: send((context) => ({
                                type: "SPEAK",
                                value: `Sorry,could you please tell me thet, Do you want me to create an appointment with ${context.person} on ${context.day} for the whole day?`
                            })),
                            on: { ENDSPEECH: "ask" }
                        },
                        timeoutnomatch: {
                            entry: say("Sorry I could not get any answer from you. I'll repeat!"),
                            on: {
                                ENDSPEECH: "ask",
                            },
                        },
                    }
                },

                Determination_time: {
                    initial: "prompt",
                    on: {
                        RECOGNISED: [ 
                            { target: "#root.dm.help",cond: (context) => context.recResult === 'help'},
                        {
                            cond: (context) => "time" in (grammar[context.recResult] || {}),
                            actions: assign((context) => { return { time: grammar[context.recResult].time } }),
                            target: "confirm_time"

                        },
                        { target: ".nomatch" }],
                        MAXSPEECH: [
                            {
                                actions: assign((context) => { return { counts: context.counts ? context.counts+1 : 1 } }),
                                cond: (context) => !context.counts || context.counts < 3,
                                target: ".timeoutnomatch"
                            },  
                            {
                                actions: assign((context) => { return { counts: 0 } }), cond: (context) => context.counts >= 3, target: "maxtimeout"
                            }
                        ]
                        
                    },
                    states: {
                        prompt: {
                            entry: say("Ok. The meeting is not the whole day.What time is your meeting?"),
                            on: { ENDSPEECH: "ask" }
                        },
                        ask: {
                            entry: [send('LISTEN'), send('MAXSPEECH', { delay: 5000, id: "timeout" })]
                        },
                        nomatch: {
                            entry: say("Sorry Would you please indicate a suitable time ?"),
                            on: { ENDSPEECH: "ask" }
                        },
                        timeoutnomatch: {
                            entry: say("Sorry I could not get any answer from you. I'll repeat!"),
                            on: {
                                ENDSPEECH: "ask",
                            },
                        },
                    }
                },

                confirm_time: {
                    initial: "prompt",
                    on: {
                        RECOGNISED: [{ target: "#root.dm.help",cond: (context) => context.recResult === 'help'},
                        {
                            cond: (context) => BooleanGrammar[context.recResult].clarity === true,
                            actions: assign((context) => { return { clarity: BooleanGrammar[context.recResult].clarity } }),
                            target: "create_appointment"

                        },
                        {
                            cond: (context) => BooleanGrammar[context.recResult].clarity === false,
                            actions: assign((context) => { return { clarity: BooleanGrammar[context.recResult].clarity } }),
                            target: "who"

                        },
                        { target: ".nomatch" }],
                        MAXSPEECH: [
                            {
                                actions: assign((context) => { return { counts: context.counts ? context.counts+1 : 1 } }),
                                cond: (context) => !context.counts || context.counts < 3,
                                target: ".timeoutnomatch"
                            },  
                            {
                                actions: assign((context) => { return { counts: 0 } }), cond: (context) => context.counts >= 3, target: "maxtimeout"
                            }
                        ]
                    },
                    states: {
                        prompt: {
                            entry: send((context) => ({
                                type: "SPEAK",
                                value: `OK. Do you want me to create an appointment with ${context.person} on ${context.day} at ${context.time} ?`
                            })),
                            on: { ENDSPEECH: "ask" }
                        },
                        ask: {
                            entry: [send('LISTEN'), send('MAXSPEECH', { delay: 5000, id: "timeout" })]
                        },
                        nomatch: {
                            entry: send((context) => ({
                                type: "SPEAK",
                                value: `Sorry,would you please tell me, Do you want me to create an appointment with ${context.person} on ${context.day} at ${context.time} ?`
                            })),
                            on: { ENDSPEECH: "ask" }
                        },
                        timeoutnomatch: {
                            entry: say("Sorry I could not get any answer from you. I'll repeat!"),
                            on: {
                                ENDSPEECH: "ask",
                            },
                        },
                    }
                },

                create_appointment: {
                    initial: "prompt",
                    on: { 
                        ENDSPEECH: "init" },
                    states: {
                        prompt: { entry: say("Your appointment has been created") }
                    }
                },
                maxtimeout: {
                    entry: say("Sorry I could not get any answer,maybe we can talk later.have a nice day"),
                    on: {
                        ENDSPEECH: "init",
                    }
                }
            }

        },

        help: {
            entry: say("I will help you and go back"),
            on: { ENDSPEECH: "begin.hist" }
        }
    
    },
})

        








  
            

