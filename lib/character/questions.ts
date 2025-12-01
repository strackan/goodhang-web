/**
 * Good Hang Character Assessment - Core Questions
 *
 * Total Core Questions: 42
 * - Attributes: 30 (5 per attribute)
 * - Alignment: 6
 * - Race: 6
 *
 * Bonus sections are in separate files:
 * - Absurdist: lib/assessment/absurdist-questions.json (15 questions)
 * - Lightning Round (IQ): lib/assessment/lightning-round-questions.json (150 questions)
 */

// =============================================================================
// TYPES
// =============================================================================

export type Attribute = 'STR' | 'CON' | 'DEX' | 'INT' | 'WIS' | 'CHA';
export type Race = 'human' | 'elf' | 'dwarf' | 'halfling' | 'orc' | 'dragonborn';
export type QuestionCategory = 'attribute' | 'alignment' | 'race';

export interface QuestionOption {
  id: string;
  text: string;
  score?: number;
  lawful?: number;
  chaotic?: number;
  good?: number;
  evil?: number;
  race?: Race;
  tags?: string[];
}

export interface Question {
  id: string;
  category: QuestionCategory;
  attribute?: Attribute;
  title: string;
  prompt: string;
  options: QuestionOption[];
  scoringNotes?: string;
}

// =============================================================================
// STRENGTH QUESTIONS (5)
// Measures: Confrontation tolerance, assertiveness, bias toward action
// =============================================================================

export const strengthQuestions: Question[] = [
  {
    id: 'STR-1',
    category: 'attribute',
    attribute: 'STR',
    title: 'The Reply-All Situation',
    prompt: `Someone sends a passive-aggressive email CC'ing your entire team that subtly throws you under the bus for a missed deadline (that wasn't actually your fault). Do you:`,
    options: [
      { id: 'A', text: 'Reply privately to them, assuming good intent, and clarify the timeline', score: 1 },
      { id: 'B', text: `Reply-all with a cheerful but pointed correction that sets the record straight -- and maybe ever-so-slightly insinuate that you would have easily made the deadline had everyone completed their requirements like you requested a week ago`, score: 3 },
      { id: 'C', text: `Forward it to your manager with "can you believe this?" energy, shake your head, and let it go`, score: 0 },
      { id: 'D', text: `Spend the rest of the day looking up every example of underperformance in this person's career before forwarding to their manager with a "Came across this in the old Sharepoint site -- yikes!" message`, score: 2, tags: ['aggressive', 'unhealthy'] },
    ],
    scoringNotes: 'D is aggressive but not healthy STR',
  },
  {
    id: 'STR-2',
    category: 'attribute',
    attribute: 'STR',
    title: 'The Wrong Order',
    prompt: `Your food arrives and it's clearly not what you ordered. The server is already walking away. Do you:`,
    options: [
      { id: 'A', text: `Eat it anyway -- it's fine, you're not picky`, score: 0 },
      { id: 'B', text: `Flag them down immediately: "Hey, I actually ordered the..."`, score: 3 },
      { id: 'C', text: `Try to make eye contact so they can see you haven't touched your food, and hopefully will wonder what's wrong and come over, and then you can say "it's not a big deal, but this technically isn't what I ordered." Maybe they'll give you a free appetizer.`, score: 1 },
      { id: 'D', text: `Eat the entire entrée, and then when they come over to ask how it was, say "It was great. Unfortunately, not what I ordered -- so if you guys could bring the actual entrée when you get a chance, I'd appreciate it."`, score: 2, tags: ['chaotic', 'evil-lean'] },
    ],
    scoringNotes: 'D is chaotic STR with slight evil modifier',
  },
  {
    id: 'STR-3',
    category: 'attribute',
    attribute: 'STR',
    title: 'The Interrupter',
    prompt: `You're in a meeting. Someone keeps interrupting you mid-sentence to "build on" your point -- except they're really just hijacking it. Third time it happens. Do you:`,
    options: [
      { id: 'A', text: 'Wait until after the meeting to tell them it was frustrating', score: 1 },
      { id: 'B', text: `Stop and say "I'd like to finish my thought first"`, score: 3 },
      { id: 'C', text: `Let them have the floor -- maybe their version is better anyway`, score: 0 },
      { id: 'D', text: `Pause dramatically. "Sorry, Steve. Did you want to deliver this presentation? How about you fuck my wife while you're at it? Well, Steve? Is that it? You wanna fuck my wife, Steve?"`, score: 4, tags: ['unhinged', 'chaotic'] },
    ],
    scoringNotes: 'D is unhinged STR',
  },
  {
    id: 'STR-4',
    category: 'attribute',
    attribute: 'STR',
    title: 'The Bill at Dinner',
    prompt: `Group dinner. One person ordered two extra cocktails and the lobster. Now everyone's doing the "split it evenly?" dance. You had the chicken and water. Do you:`,
    options: [
      { id: 'A', text: `Pay your share of the inflated total -- not worth the awkwardness`, score: 0 },
      { id: 'B', text: `Say "I hope we're not planning on splitting this evenly," to get it out there right away`, score: 3 },
      { id: 'C', text: `Drop a wad of hundreds on the table and leave. "See you bitches later."`, score: 4, tags: ['power-move', 'chaotic'] },
      { id: 'D', text: `Quietly resent it and remember this next time you're picking restaurants`, score: 0 },
    ],
    scoringNotes: 'C is a power move',
  },
  {
    id: 'STR-5',
    category: 'attribute',
    attribute: 'STR',
    title: 'The Crash Pad',
    prompt: `Tech Week in NYC. Hotels are expensive, and you have a college friend you haven't talked to in a few years who lives right downtown. Do you:`,
    options: [
      { id: 'A', text: `Pay for the hotel room, and see if your friend wants to grab dinner. Maybe they'll offer to let you crash, but you're set either way.`, score: 0 },
      { id: 'B', text: `Send them a text letting them know you'll be in town and want to see them. Casually drop that you're having a hard time finding an affordable place, so they get the hint and offer to let you crash.`, score: 1 },
      { id: 'C', text: `Just ask them. "Hey, I'm heading to New York next week. All good either way -- but any chance I could crash at your place?"`, score: 3 },
      { id: 'D', text: `Show up unannounced at their place with all your bags. Now they'll HAVE to let you crash.`, score: 4, tags: ['unhinged', 'chaotic'] },
    ],
    scoringNotes: 'D is unhinged',
  },
];

// =============================================================================
// CONSTITUTION QUESTIONS (5)
// Measures: Endurance, resilience, sustained capacity, recovery
// =============================================================================

export const constitutionQuestions: Question[] = [
  {
    id: 'CON-1',
    category: 'attribute',
    attribute: 'CON',
    title: 'The Happy Hour',
    prompt: `You're at a tech happy hour. It's 6:30 and you've had a couple mojitos. Most people are headed home, a couple people might "grab 1 or 2 more," and the 22-year-old SDR is headed "out to the clubs" after one more shot. Do you:`,
    options: [
      { id: 'A', text: `Head home. There's nothing good that comes from more than 2 drinks except a hangover.`, score: 0 },
      { id: 'B', text: `Have one more beer and get to know these people a little better.`, score: 2 },
      { id: 'C', text: `See if the SDR thinks you would "fit in" at the club and try to finagle your way into an invite.`, score: 3 },
      { id: 'D', text: `Call your cocaine guy. It's gonna be an all-nighter.`, score: 4, tags: ['unlimited-con', 'chaotic'] },
    ],
    scoringNotes: 'D is unlimited CON with questionable life choices',
  },
  {
    id: 'CON-2',
    category: 'attribute',
    attribute: 'CON',
    title: 'The Rejection Streak',
    prompt: `You've asked out 5 people this year. All five said no. How are you feeling about asking out person #6?`,
    options: [
      { id: 'A', text: `Honestly? Getting easier. I've stopped taking it personally.`, score: 4 },
      { id: 'B', text: `Still stings, but I'd rather shoot my shot than wonder.`, score: 3 },
      { id: 'C', text: `Taking a break from the apps. Need to rebuild some confidence first.`, score: 1 },
      { id: 'D', text: `I've decided I'm just going to "focus on myself" for "a while" (forever).`, score: 0 },
    ],
  },
  {
    id: 'CON-3',
    category: 'attribute',
    attribute: 'CON',
    title: 'The Crunch',
    prompt: `Big deadline in 2 weeks. It's going to require sustained 60-hour weeks. How do you approach it?`,
    options: [
      { id: 'A', text: `Lock in -- I've done this before, I know how to sustain it.`, score: 3 },
      { id: 'B', text: `Front-load the work so I can ease off toward the end.`, score: 4, tags: ['sustainable-con'] },
      { id: 'C', text: `Match the team's energy -- if everyone's grinding, I'll grind.`, score: 2 },
      { id: 'D', text: `Quietly start setting expectations that the deadline might slip.`, score: 0 },
    ],
    scoringNotes: 'B is sustainable CON',
  },
  {
    id: 'CON-4',
    category: 'attribute',
    attribute: 'CON',
    title: 'The Recovery',
    prompt: `You just finished an intense 3-month push. Project shipped. It's Monday. Do you:`,
    options: [
      { id: 'A', text: `Take a day or two, then I'm ready for the next thing.`, score: 4 },
      { id: 'B', text: `Need at least a week of lighter work to recharge.`, score: 2 },
      { id: 'C', text: `Already thinking about the next project -- momentum is a drug.`, score: 3 },
      { id: 'D', text: `Honestly? I'm cooked. Might need a few weeks before I'm fully back.`, score: 0 },
    ],
  },
  {
    id: 'CON-5',
    category: 'attribute',
    attribute: 'CON',
    title: 'The Setback',
    prompt: `You spent 2 weeks on a proposal. Leadership killed it in a 10-minute meeting. How long until you're fully back?`,
    options: [
      { id: 'A', text: `Give me an hour to be annoyed, then I'm fine.`, score: 4 },
      { id: 'B', text: `Sting lasts a day or two, but I'll channel it productively.`, score: 3 },
      { id: 'C', text: `I'll be thinking about this one for a while -- hard not to take it personally.`, score: 1 },
      { id: 'D', text: `I need to process. Probably going to vent to friends, journal, maybe therapy.`, score: 0 },
    ],
  },
];

// =============================================================================
// DEXTERITY QUESTIONS (5)
// Measures: Adaptability, flexibility, comfort with ambiguity
// =============================================================================

export const dexterityQuestions: Question[] = [
  {
    id: 'DEX-1',
    category: 'attribute',
    attribute: 'DEX',
    title: 'The Restaurant Snafu',
    prompt: `You made a reservation at that place everyone's been talking about. You show up and they have no record of it. 45-minute wait. Your group is hungry. Do you:`,
    options: [
      { id: 'A', text: `Already googling other spots. "There's a Thai place around the corner with great reviews -- let's try it."`, score: 4 },
      { id: 'B', text: `Annoyed, but roll with it. "Bar next door for 45 minutes?"`, score: 3 },
      { id: 'C', text: `Slip the guy $100. "Are you sure there's no way we can get in?"`, score: 1, tags: ['money-not-flexibility'] },
      { id: 'D', text: `The entire night is ruined. This is how it always goes for you. You don't even like Thai.`, score: 0 },
    ],
    scoringNotes: 'C is money, not flexibility',
  },
  {
    id: 'DEX-2',
    category: 'attribute',
    attribute: 'DEX',
    title: 'The Surprise Toast',
    prompt: `Wedding reception. You're having a nice time. Suddenly the best man grabs the mic and says "and now [your name] wanted to say a few words!" You did not want to say a few words. You have prepared zero words. Do you:`,
    options: [
      { id: 'A', text: `Stand up, grab the mic, and tell the audience to get comfortable. Did they ever hear about the time you and Prince killed a homeless man together?`, score: 4, tags: ['maximum-dex'] },
      { id: 'B', text: `Keep it short. "To [couple] -- you two are perfect together. Cheers." Sit down. Survive.`, score: 3 },
      { id: 'C', text: `Wave it off -- "Oh no, I'm good, you go ahead!" Pray they move on.`, score: 1 },
      { id: 'D', text: `Fake a seizure and fall out of your chair screaming.`, score: 0, tags: ['creative-avoidance'] },
    ],
    scoringNotes: 'D is creative avoidance, not DEX',
  },
  {
    id: 'DEX-3',
    category: 'attribute',
    attribute: 'DEX',
    title: 'The Dead Phone (French Quarter)',
    prompt: `It's a beautiful April in the French Quarter. You're strolling around admiring the funky shops. You look down and notice your phone is dead. Do you:`,
    options: [
      { id: 'A', text: `Immediately formulate a plan to get back to your hotel and head back. It's not safe to be out without a way to get help.`, score: 0 },
      { id: 'B', text: `Head into the nearest store or bar and see if you can borrow somebody's phone to grab an Uber. Maybe you'll have a beer or two first.`, score: 2 },
      { id: 'C', text: `Zero phone = zero accountability. You're just going to head east and see what happens.`, score: 4 },
      { id: 'D', text: `Unphased. You duck into a pawn shop, grab some copper wire and a 9-volt battery, and MacGyver yourself a charging solution.`, score: 3, tags: ['resourceful-dex'] },
    ],
    scoringNotes: 'D is resourceful improvisation',
  },
  {
    id: 'DEX-4',
    category: 'attribute',
    attribute: 'DEX',
    title: 'The Bachelorette Chaos',
    prompt: `You're planning an 8-person bachelorette party. Everyone has different ideas. Ashley wants Nashville. Morgan wants a beach house. Taylor "doesn't care" but vetoes everything. Jess wants "something different." Do you:`,
    options: [
      { id: 'A', text: `Create a shared doc with everyone's constraints and systematically find the overlap. There IS a solution here.`, score: 1, tags: ['methodical'] },
      { id: 'B', text: `Pick a place, book it, and tell everyone where to be. They'll thank you later for making the decision.`, score: 2, tags: ['decisive'] },
      { id: 'C', text: `Let the chaos unfold. Whatever happens, it'll be a story. Maybe we end up in Nashville, maybe Tijuana. Who knows.`, score: 4 },
      { id: 'D', text: `Book them on a "fire ant tour" inside a local volcano, and spend the day enjoying room service.`, score: 3, tags: ['chaotic-neutral'] },
    ],
  },
  {
    id: 'DEX-5',
    category: 'attribute',
    attribute: 'DEX',
    title: 'The Spontaneous Trip',
    prompt: `Your friend calls Thursday night. "Road trip this weekend. You in?" Do you:`,
    options: [
      { id: 'A', text: `Can't do it. I need at least a week's notice to clear my schedule and pack properly.`, score: 0 },
      { id: 'B', text: `I'm in, but I'm going to need an itinerary by tomorrow morning.`, score: 1 },
      { id: 'C', text: `Totally down. Let's at least grab an Airbnb so we have a home base.`, score: 3 },
      { id: 'D', text: `Don't even tell me where we're going. I want everything to be completely driven by instinct.`, score: 4 },
    ],
  },
];

// =============================================================================
// INTELLIGENCE QUESTIONS (5)
// Measures: Curiosity, pattern recognition, systems thinking, learning
// Three-tier model: Low INT → Second-Order INT (needs to prove it) → Highest INT (curious, no ego)
// =============================================================================

export const intelligenceQuestions: Question[] = [
  {
    id: 'INT-1',
    category: 'attribute',
    attribute: 'INT',
    title: 'The Wikipedia Spiral',
    prompt: `You google something simple. 45 minutes later you're fourteen tabs deep reading about something completely unrelated to your original search. This happens:`,
    options: [
      { id: 'A', text: `Constantly. I regret nothing. This is how I've learned most of what I know.`, score: 4 },
      { id: 'B', text: `Sometimes, but I've learned to close the tabs. Curiosity is a trap.`, score: 2 },
      { id: 'C', text: `Rarely. I find what I need and move on. Random knowledge doesn't really serve me.`, score: 1 },
      { id: 'D', text: `I don't understand the question. Why would you click on something you weren't looking for?`, score: 0 },
    ],
  },
  {
    id: 'INT-2',
    category: 'attribute',
    attribute: 'INT',
    title: 'The Confident Mistake',
    prompt: `Someone at dinner confidently explains something you know is wrong -- not opinion-wrong, factually wrong. They're not asking for your input. Do you:`,
    options: [
      { id: 'A', text: `Let it go. They'll figure it out eventually, and being right isn't worth the awkwardness.`, score: 2, tags: ['wise-not-int'] },
      { id: 'B', text: `Correct them -- politely, but you can't just let misinformation stand. You'd want someone to do the same for you.`, score: 3, tags: ['second-order-int'] },
      { id: 'C', text: `Ask a genuine question. "Huh, I'd always heard it was [correct thing] -- do you know why that is?" Let them discover it.`, score: 4, tags: ['highest-int'] },
      { id: 'D', text: `I probably wouldn't notice. I'm not paying that much attention to what people say at dinner.`, score: 0 },
    ],
    scoringNotes: 'C is highest INT (curious, no ego). B is second-order INT (needs to correct).',
  },
  {
    id: 'INT-3',
    category: 'attribute',
    attribute: 'INT',
    title: 'The Expert in the Room',
    prompt: `You're in a conversation where someone clearly knows more than you about the topic. Do you:`,
    options: [
      { id: 'A', text: `Ask questions. This is a free education. I love when someone knows more than me.`, score: 4, tags: ['secure', 'curious'] },
      { id: 'B', text: `Listen, nod, contribute where I can, but mostly absorb.`, score: 3 },
      { id: 'C', text: `Try to steer toward a topic where I have more expertise. I don't love feeling like the dumbest person in the room.`, score: 1, tags: ['second-order-int'] },
      { id: 'D', text: `Zone out. If I can't contribute, I'm not that interested.`, score: 0 },
    ],
    scoringNotes: 'A is secure, curious (highest INT). C is second-order INT (needs to be expert).',
  },
  {
    id: 'INT-4',
    category: 'attribute',
    attribute: 'INT',
    title: 'The Complex Movie',
    prompt: `You watch a movie with a non-linear timeline -- the kind where you're not sure what happened until you think about it afterward. At the end, do you:`,
    options: [
      { id: 'A', text: `Immediately start reconstructing it. "Okay, so if the second timeline is actually..." -- and you genuinely want to hear other people's interpretations, because you might have missed something.`, score: 4, tags: ['curious', 'collaborative'] },
      { id: 'B', text: `Start explaining it to whoever you're with. You're pretty sure you figured it out.`, score: 3, tags: ['second-order-int'] },
      { id: 'C', text: `Enjoyed it, got the gist, don't feel the need to dissect it.`, score: 1 },
      { id: 'D', text: `Frustrated. Movies shouldn't require homework. Just tell a story.`, score: 0 },
    ],
    scoringNotes: 'A is curious + collaborative. B is second-order INT (figured it out, needs to explain).',
  },
  {
    id: 'INT-5',
    category: 'attribute',
    attribute: 'INT',
    title: 'The Broken System',
    prompt: `There's a tool or process at work that everyone complains about. It's clearly inefficient, but nobody's fixed it. Do you:`,
    options: [
      { id: 'A', text: `Poke at it. Not to show off -- just because broken systems are interesting puzzles. If I figure something out, I'll share it.`, score: 4, tags: ['curious', 'helpful', 'no-ego'] },
      { id: 'B', text: `Build a solution and present it. Someone should, and it might as well be me.`, score: 3, tags: ['second-order-int'] },
      { id: 'C', text: `Document the problems and send them to whoever owns it. Not my job to fix, but I can identify issues.`, score: 1 },
      { id: 'D', text: `Complain with everyone else. Some things just don't change.`, score: 0 },
    ],
    scoringNotes: 'A is highest INT (curious, helpful, no ego). B is second-order INT (wants credit).',
  },
];

// =============================================================================
// WISDOM QUESTIONS (5)
// Measures: Self-awareness, emotional intelligence, reading situations
// Three-tier model: Low WIS → Reactive WIS (notices after) → High WIS (real-time awareness)
// =============================================================================

export const wisdomQuestions: Question[] = [
  {
    id: 'WIS-1',
    category: 'attribute',
    attribute: 'WIS',
    title: 'The Antagonist',
    prompt: `There's someone at work who seems to be gunning for your position. They're not doing anything explicitly wrong, but you can feel the competition. Do you:`,
    options: [
      { id: 'A', text: `Outwork them. If they want my spot, they'll have to earn it.`, score: 1, tags: ['str-con-response'] },
      { id: 'B', text: `Keep them close. Befriend them publicly while subtly undermining them where it counts.`, score: 0, tags: ['evil-marker', 'low-wis'] },
      { id: 'C', text: `Not let it impact me. Rising tide lifts all boats. I hope the best for them.`, score: 4, tags: ['secure', 'abundant'] },
      { id: 'D', text: `Let it motivate me, but not take it personally. Competition can be healthy.`, score: 3 },
    ],
    scoringNotes: 'C is highest WIS (secure, abundant mindset). B is evil alignment marker.',
  },
  {
    id: 'WIS-2',
    category: 'attribute',
    attribute: 'WIS',
    title: 'The Pattern You Keep Repeating',
    prompt: `If a therapist asked you, "What's a pattern you keep falling into?" -- could you answer immediately?`,
    options: [
      { id: 'A', text: `Yes. I know my patterns. I've done the work. I can usually catch myself now before I'm three episodes deep in the same old story.`, score: 4, tags: ['self-aware-realtime'] },
      { id: 'B', text: `I'd need a minute, but yeah -- I can see it when I look back. Harder to spot in the moment.`, score: 2, tags: ['reactive-wis'] },
      { id: 'C', text: `Honestly, not really. I don't spend a lot of time analyzing my past decisions.`, score: 0 },
      { id: 'D', text: `I don't think I have patterns. Every situation is different.`, score: 0, tags: ['dangerously-low-wis'] },
    ],
    scoringNotes: 'A is high WIS (self-aware in real-time). B is reactive WIS. D is dangerously low WIS -- everyone has patterns.',
  },
  {
    id: 'WIS-3',
    category: 'attribute',
    attribute: 'WIS',
    title: 'The Friend Who Needs to Vent',
    prompt: `A friend calls, clearly upset about something. They start telling you about it. Do you:`,
    options: [
      { id: 'A', text: `Listen first. Ask a few questions. Figure out what they actually need -- sometimes it's advice, sometimes it's permission, sometimes they just need to say it out loud.`, score: 4 },
      { id: 'B', text: `Listen, then offer my perspective. I probably see something they don't from the outside.`, score: 2, tags: ['moderate-int'] },
      { id: 'C', text: `Tell them what I'd do. That's usually why people come to me.`, score: 0, tags: ['assumes-want-opinion'] },
      { id: 'D', text: `Just listen and sympathize. I don't give advice unless they explicitly ask.`, score: 1, tags: ['avoidant'] },
    ],
    scoringNotes: 'A discerns what is actually needed.',
  },
  {
    id: 'WIS-4',
    category: 'attribute',
    attribute: 'WIS',
    title: 'The Heated Moment',
    prompt: `You're in a disagreement. You have a point that would "win" the argument -- but you sense that making it right now would escalate things or damage the relationship. Do you:`,
    options: [
      { id: 'A', text: `Hold it. Being right isn't worth the cost. I can circle back when the temperature drops.`, score: 4, tags: ['timing', 'relationship-awareness'] },
      { id: 'B', text: `Make it, but soften it. Some things need to be said even if the timing isn't perfect.`, score: 2 },
      { id: 'C', text: `Make it. If they can't handle being wrong, that's on them.`, score: 0 },
      { id: 'D', text: `I don't really calculate this stuff mid-conversation. I just say what I think.`, score: 0 },
    ],
    scoringNotes: 'A shows timing + relationship awareness.',
  },
  {
    id: 'WIS-5',
    category: 'attribute',
    attribute: 'WIS',
    title: 'The Room Read',
    prompt: `You walk into a dinner party. The host greets you a little too brightly. Two people aren't making eye contact with each other. Someone's wine glass is suspiciously full. Do you:`,
    options: [
      { id: 'A', text: `Immediately clock it. Adjust accordingly. Maybe don't bring up the topic I was going to bring up.`, score: 4 },
      { id: 'B', text: `Notice something's off, but I'd need more data before I know what happened.`, score: 2 },
      { id: 'C', text: `I'm here to have a good time. If something's weird, someone will tell me.`, score: 1 },
      { id: 'D', text: `I genuinely don't notice stuff like this. I take rooms at face value.`, score: 0 },
    ],
  },
];

// =============================================================================
// CHARISMA QUESTIONS (5)
// Measures: Social gravity, genuine connection, influence
// Three-tier model: Low CHA → Performative CHA → Highest CHA (natural gravity)
// =============================================================================

export const charismaQuestions: Question[] = [
  {
    id: 'CHA-1',
    category: 'attribute',
    attribute: 'CHA',
    title: 'The Networking Event',
    prompt: `You're at an industry event where you don't know anyone. An hour later, how's it going?`,
    options: [
      { id: 'A', text: `Somehow I've convinced six strangers that we're all going to karaoke after this. I don't know how it happened. It just... happened.`, score: 4, tags: ['social-gravity'] },
      { id: 'B', text: `I've had two or three real conversations. I'll probably grab coffee with one of them -- not because I should, because I want to.`, score: 3, tags: ['genuine-connection'] },
      { id: 'C', text: `I've made the rounds. Got some good contacts. Handed out some cards. Mission accomplished.`, score: 2, tags: ['performative'] },
      { id: 'D', text: `I found the one interesting person and stayed there. Or I'm by the food table hoping no one approaches.`, score: 0 },
    ],
    scoringNotes: 'A is social gravity. B is genuine connection. C is performative CHA.',
  },
  {
    id: 'CHA-2',
    category: 'attribute',
    attribute: 'CHA',
    title: 'The Airline Call',
    prompt: `You need to call the airline to get them to waive a change fee. How does it go?`,
    options: [
      { id: 'A', text: `They waive the fee. Somehow you end the call with the agent telling you about their kid's soccer game. You told them to have a good one and meant it.`, score: 4, tags: ['warmth-creates-compliance'] },
      { id: 'B', text: `You know the script. Polite but firm. Escalate to supervisor if needed. You get the fee waived, but it's a negotiation.`, score: 2, tags: ['effective-transactional'] },
      { id: 'C', text: `You explain your situation. They say no. You push back once, but ultimately you pay the fee.`, score: 1 },
      { id: 'D', text: `You demand a manager. Threaten to never fly them again. Mention your Twitter following. You might get the fee waived, but everyone's blood pressure is elevated.`, score: 0, tags: ['force-not-charm'] },
    ],
    scoringNotes: 'A is warmth creates compliance. D is force, not charm.',
  },
  {
    id: 'CHA-3',
    category: 'attribute',
    attribute: 'CHA',
    title: 'The Party Arrival',
    prompt: `You walk into a house party where you know maybe two people. Two hours later:`,
    options: [
      { id: 'A', text: `You're somehow at the center of the best conversation at the party. Two people you introduced to each other just exchanged numbers. Someone's asking if you're coming to their thing next week.`, score: 4, tags: ['center-of-gravity'] },
      { id: 'B', text: `You had a couple of genuinely great conversations. You'll probably never see these people again, but for twenty minutes, you really connected.`, score: 3, tags: ['genuine-moments'] },
      { id: 'C', text: `You made the rounds, met some people, got a few LinkedIn connections. Solid networking.`, score: 2, tags: ['performative'] },
      { id: 'D', text: `You found the dog and stayed with the dog. The dog gets you.`, score: 0 },
    ],
    scoringNotes: 'A is center of gravity. D is found the dog.',
  },
  {
    id: 'CHA-4',
    category: 'attribute',
    attribute: 'CHA',
    title: 'The After-Conversation Vibe',
    prompt: `You just had a 15-minute conversation with someone at an event. When they walk away, they're most likely thinking:`,
    options: [
      { id: 'A', text: `"I need to introduce them to my friend / business partner / sister. They'd love each other." They're already planning how to keep you in their orbit.`, score: 4, tags: ['pull-into-life'] },
      { id: 'B', text: `"That was a really good conversation." They're not sure why, but they feel a little lighter than before.`, score: 3, tags: ['feel-lighter'] },
      { id: 'C', text: `"That person knows what they're doing." They're impressed. Might be useful to stay connected.`, score: 2, tags: ['impressed-not-warm'] },
      { id: 'D', text: `"That was... fine?" They've already forgotten what you talked about.`, score: 0 },
    ],
  },
  {
    id: 'CHA-5',
    category: 'attribute',
    attribute: 'CHA',
    title: 'The Hard Truth',
    prompt: `You tell a friend something they don't want to hear -- their partner's a problem, their business idea has holes, whatever. A month later:`,
    options: [
      { id: 'A', text: `They tell the story of how you told them. "My friend sat me down and just... I needed to hear it. You have to meet them -- they give the best advice." You've become part of their narrative.`, score: 4, tags: ['story-they-tell'] },
      { id: 'B', text: `They thanked you. Somehow you said the hard thing and they felt cared for, not attacked.`, score: 3, tags: ['hard-truths-feel-like-love'] },
      { id: 'C', text: `They heard you out. Respected it. Probably won't bring it up again.`, score: 1 },
      { id: 'D', text: `Things have been a little weird between you since. Maybe you were too blunt.`, score: 0 },
    ],
  },
];

// =============================================================================
// ALIGNMENT QUESTIONS (6)
// Tests Lawful↔Chaotic and Good↔Evil axes
// =============================================================================

export const alignmentQuestions: Question[] = [
  // LAWFUL ↔ CHAOTIC (3)
  {
    id: 'ALIGN-1',
    category: 'alignment',
    title: 'The Self-Checkout',
    prompt: `You're at self-checkout. You scan your items. You notice the machine didn't register the avocados. Do you:`,
    options: [
      { id: 'A', text: `Flag down the attendant. Stealing is stealing, even if it's accidental.`, lawful: 3, chaotic: 0 },
      { id: 'B', text: `Try to re-scan them. If it doesn't work, eh, you tried.`, lawful: 2, chaotic: 1 },
      { id: 'C', text: `Keep moving. The machine made the mistake, not you. That's between Kroger and God.`, lawful: 0, chaotic: 3 },
      { id: 'D', text: `Avocados? I didn't see any avocados. This here is a plum. So, um, is this ribeye. And cognac.`, lawful: 0, chaotic: 4, tags: ['chaotic-evil-folk-hero'] },
    ],
  },
  {
    id: 'ALIGN-2',
    category: 'alignment',
    title: 'The Merge Lane',
    prompt: `You're in traffic. Your lane is ending. There's a long line of cars waiting to merge, and a clear open lane that ends in 200 feet. Do you:`,
    options: [
      { id: 'A', text: `Get in line early. That's how merging works. Everyone waits their turn.`, lawful: 3, chaotic: 0 },
      { id: 'B', text: `Stay in line, but quietly resent the people zooming past you.`, lawful: 2, chaotic: 0, tags: ['lawful-seething'] },
      { id: 'C', text: `Use the open lane and merge at the end. That's literally what zipper merging is. You're not cutting -- you're being efficient.`, lawful: 0, chaotic: 3, tags: ['chaotic-rationalized'] },
      { id: 'D', text: `Get in line, but take up space in the zipper merge lane as well. Rules are important, and no one gets a free pass.`, lawful: 1, chaotic: 0, tags: ['lawful-petty', 'enforcer'] },
    ],
  },
  {
    id: 'ALIGN-3',
    category: 'alignment',
    title: 'The HOV Lane',
    prompt: `You're driving alone. There's a carpool lane. Do you:`,
    options: [
      { id: 'A', text: `Never use it. Rules exist for a reason. Even when traffic is miserable.`, lawful: 3, chaotic: 0 },
      { id: 'B', text: `Use it if you're genuinely late for something important. Desperate times.`, lawful: 1, chaotic: 1 },
      { id: 'C', text: `Use it regularly. The odds of getting caught are low, the fine is survivable, and the time savings are worth it.`, lawful: 0, chaotic: 3 },
      { id: 'D', text: `Use it always. And there's a mannequin in your passenger seat wearing sunglasses and your college sweatshirt. Her name is Linda. You've been commuting together for three years.`, lawful: 0, chaotic: 4, tags: ['committed-to-the-bit'] },
    ],
  },
  // GOOD ↔ EVIL (3)
  {
    id: 'ALIGN-4',
    category: 'alignment',
    title: 'The Accident',
    prompt: `You drive past a massive accident -- dozens of firetrucks, ambulances, fire, the works. Be honest. What's your first thought?`,
    options: [
      { id: 'A', text: `Oh my god -- I hope everyone is okay.`, good: 3, evil: 0 },
      { id: 'B', text: `Oh my god -- there's no way everyone survived that.`, good: 2, evil: 0, tags: ['realistic'] },
      { id: 'C', text: `Holy shit -- that is one hell of an accident.`, good: 1, evil: 1, tags: ['detached'] },
      { id: 'D', text: `Awesome. I hope the deaths were painful.`, good: 0, evil: 4, tags: ['seek-help'] },
    ],
  },
  {
    id: 'ALIGN-5',
    category: 'alignment',
    title: `The Rival's Bad Luck`,
    prompt: `You and your rival have a crush on the same person. The night of the big event, she gets food poisoning and can't go. Do you:`,
    options: [
      { id: 'A', text: `Feel terrible. You're rivals, but at the end of the day, you never wanted anything bad to happen to her.`, good: 3, evil: 0 },
      { id: 'B', text: `Feel bad she can't go, but it's not like it's your fault. She'd probably want you to have fun with Brad.`, good: 2, evil: 1, tags: ['rationalized'] },
      { id: 'C', text: `Secretly kind of glad she's not going, although you'd never say it out loud.`, good: 0, evil: 2, tags: ['honest-evil'] },
      { id: 'D', text: `Elated. Who do you think poisoned the bitch?`, good: 0, evil: 4, tags: ['chaotic-evil'] },
    ],
  },
  {
    id: 'ALIGN-6',
    category: 'alignment',
    title: 'The Found Wallet',
    prompt: `You find a wallet on the ground. $300 cash inside, plus cards and ID. Do you:`,
    options: [
      { id: 'A', text: `Track down the owner. You'd want someone to do the same for you.`, good: 3, evil: 0, lawful: 1, chaotic: 0 },
      { id: 'B', text: `Turn it in to the nearest business or police station. Let the system handle it.`, good: 2, evil: 0, lawful: 2, chaotic: 0 },
      { id: 'C', text: `Take the cash, leave the wallet somewhere visible. They'll get their cards back. The cash is a finder's fee.`, good: 0, evil: 3, lawful: 0, chaotic: 1 },
      { id: 'D', text: `Take the cash, the wallet, and use the ID to sign them up for Scientology mailing lists. Chaos is a ladder.`, good: 0, evil: 4, lawful: 0, chaotic: 4, tags: ['chaotic-evil'] },
    ],
  },
];

// =============================================================================
// RACE QUESTIONS (6)
// Direct A-F mapping to each race
// =============================================================================

export const raceQuestions: Question[] = [
  {
    id: 'RACE-1',
    category: 'race',
    title: 'The Party Energy',
    prompt: `At a social gathering, you're usually:`,
    options: [
      { id: 'A', text: `Working the room. I can talk to anyone about anything.`, race: 'human' },
      { id: 'B', text: `In a corner with one person having a deep conversation.`, race: 'elf' },
      { id: 'C', text: `Organizing something. Making sure people have drinks, that there's music.`, race: 'dwarf' },
      { id: 'D', text: `The loudest person there. Telling stories, making people laugh.`, race: 'halfling' },
      { id: 'E', text: `Challenging someone's opinion. The interesting stuff happens in conflict.`, race: 'orc' },
      { id: 'F', text: `Holding court. People gather around me naturally.`, race: 'dragonborn' },
    ],
  },
  {
    id: 'RACE-2',
    category: 'race',
    title: 'The Conflict Style',
    prompt: `When conflict arises, your default is:`,
    options: [
      { id: 'A', text: `Find the compromise. There's always a middle ground.`, race: 'human' },
      { id: 'B', text: `Step back, observe, make my move when I have full information.`, race: 'elf' },
      { id: 'C', text: `Stand my ground. I know what I know.`, race: 'dwarf' },
      { id: 'D', text: `De-escalate with humor. Life's too short for this.`, race: 'halfling' },
      { id: 'E', text: `Lean in. Conflict clarifies things.`, race: 'orc' },
      { id: 'F', text: `Assert authority. This is my domain.`, race: 'dragonborn' },
    ],
  },
  {
    id: 'RACE-3',
    category: 'race',
    title: 'The Project Approach',
    prompt: `Starting a big project, you naturally:`,
    options: [
      { id: 'A', text: `Build a coalition. Get buy-in. Make sure everyone's on board.`, race: 'human' },
      { id: 'B', text: `Think it through completely before starting. Plan the whole thing.`, race: 'elf' },
      { id: 'C', text: `Start with the foundations. One brick at a time, properly.`, race: 'dwarf' },
      { id: 'D', text: `Jump in and figure it out. Energy over perfection.`, race: 'halfling' },
      { id: 'E', text: `Attack the hardest part first. If that works, the rest is easy.`, race: 'orc' },
      { id: 'F', text: `Delegate the parts beneath me. Focus on the vision.`, race: 'dragonborn' },
    ],
  },
  {
    id: 'RACE-4',
    category: 'race',
    title: 'The Reputation',
    prompt: `People describe you as:`,
    options: [
      { id: 'A', text: `Easy to get along with. Adaptable. Relatable.`, race: 'human' },
      { id: 'B', text: `Thoughtful. Reserved. Wise.`, race: 'elf' },
      { id: 'C', text: `Reliable. Solid. Dependable.`, race: 'dwarf' },
      { id: 'D', text: `Fun. Optimistic. Lucky.`, race: 'halfling' },
      { id: 'E', text: `Intense. Direct. A lot.`, race: 'orc' },
      { id: 'F', text: `Commanding. Impressive. A leader.`, race: 'dragonborn' },
    ],
  },
  {
    id: 'RACE-5',
    category: 'race',
    title: 'The Loyalty Test',
    prompt: `Someone you trusted betrays you. Your response:`,
    options: [
      { id: 'A', text: `Disappointed but I understand. People are complicated.`, race: 'human' },
      { id: 'B', text: `File it away. I'll remember this. But I won't react emotionally.`, race: 'elf' },
      { id: 'C', text: `Done. Trust broken is trust gone. I don't give second chances.`, race: 'dwarf' },
      { id: 'D', text: `Give them a chance to explain. Maybe there's more to the story.`, race: 'halfling' },
      { id: 'E', text: `Confront them immediately. We're having this out.`, race: 'orc' },
      { id: 'F', text: `They've made an enemy. They'll regret this.`, race: 'dragonborn' },
    ],
  },
  {
    id: 'RACE-6',
    category: 'race',
    title: 'The Friday Night',
    prompt: `Ideal Friday night:`,
    options: [
      { id: 'A', text: `Something social. Doesn't matter what -- the company is the point.`, race: 'human' },
      { id: 'B', text: `Quiet evening. A book, a project, maybe one good conversation.`, race: 'elf' },
      { id: 'C', text: `Familiar routine. My people, my place, my drink.`, race: 'dwarf' },
      { id: 'D', text: `Adventure. Something spontaneous. Let's see what happens.`, race: 'halfling' },
      { id: 'E', text: `Something competitive. Poker, sports, debates.`, race: 'orc' },
      { id: 'F', text: `An event where I can shine. Hosting, performing, being seen.`, race: 'dragonborn' },
    ],
  },
];

// =============================================================================
// AGGREGATED EXPORTS
// =============================================================================

export const allAttributeQuestions: Question[] = [
  ...strengthQuestions,
  ...constitutionQuestions,
  ...dexterityQuestions,
  ...intelligenceQuestions,
  ...wisdomQuestions,
  ...charismaQuestions,
];

export const allCoreQuestions: Question[] = [
  ...allAttributeQuestions,
  ...alignmentQuestions,
  ...raceQuestions,
];

// =============================================================================
// QUESTION COUNTS
// =============================================================================

export const questionCounts = {
  strength: strengthQuestions.length,
  constitution: constitutionQuestions.length,
  dexterity: dexterityQuestions.length,
  intelligence: intelligenceQuestions.length,
  wisdom: wisdomQuestions.length,
  charisma: charismaQuestions.length,
  attributes: allAttributeQuestions.length,
  alignment: alignmentQuestions.length,
  race: raceQuestions.length,
  core: allCoreQuestions.length,
};

// Verify counts
if (questionCounts.core !== 42) {
  console.warn(`Expected 42 core questions, got ${questionCounts.core}`);
}
