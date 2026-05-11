/** Explore (swipe deck) UI — forms, errors, settings, swipe chrome, match overlay. */
export const enExplore = {
  'explore.toolbar.title': 'Swipe deck',
  'explore.toolbar.matchesAria': 'Your matches, {{count}}',
  'explore.toolbar.matchesTitle': 'Your matches',
  'explore.toolbar.matchesHint': 'Tap a name to open details.',
  'explore.toolbar.settingsAria': 'Swipe deck settings',

  'explore.form.nameLabel': 'What should we call you?',
  'explore.form.randomNameAria': 'Random name',
  'explore.form.randomNameTitle': 'Random name',
  'explore.form.intentLabel': 'I’m here to…',

  'explore.intent.volunteer': 'Volunteer or help out',
  'explore.intent.adopt': 'Adopt',
  'explore.intent.foster': 'Foster',
  'explore.intent.undecided': 'Just browsing',

  'explore.shuffleDeck': 'Shuffle deck',

  'explore.error.body':
    'We can’t load the animal list right now. Please try again later or go back to the directory.',
  'explore.error.back': 'Back to directory',

  'explore.updating': 'Updating…',
  'explore.caughtUp.title': 'You’re caught up (for now).',
  'explore.caughtUp.hint':
    'Reshuffle to see all animals again, or start over to reset your matches too.',
  'explore.caughtUp.reshuffle': 'Reshuffle deck',
  'explore.caughtUp.openSettings': 'Open settings',

  'explore.lowKeySave': '{{name}} — no match this time. Keep swiping!',

  'explore.settings.title': 'Swipe deck settings',
  'explore.settings.localOnly':
    'Data stays in this browser only. Nothing is sent to a server.',
  'explore.settings.reshuffle': 'Reshuffle deck',
  'explore.settings.startOver': 'Start over',
  'explore.settings.done': 'Done',

  'explore.confirm.reshuffle.title': 'Reshuffle deck?',
  'explore.confirm.reshuffle.body':
    'All animals come back into the deck — passed ones and “no match” ones. Your saved matches stay.',
  'explore.confirm.startOver.title': 'Start over?',
  'explore.confirm.startOver.body':
    'This resets everything — your matches, passed animals, and deck. Your display name and filters stay the same.',
  'explore.confirm.cancel': 'Cancel',
  'explore.confirm.reshuffleCta': 'Reshuffle',
  'explore.confirm.startOverCta': 'Start over',

  'explore.shortlist.title': 'Your matches ({{count}})',

  'explore.swipe.streak': '{{count}} matches in a row!',
  'explore.swipe.singleLeft':
    'Only this animal left. Still unsure? You can pass or try for a match.',
  'explore.swipe.fewLeft': 'Just a few left to discover',
  'explore.swipe.yes': 'YES',
  'explore.swipe.pass': 'PASS',
  'explore.swipe.hintSr':
    'Swipe the card, or use Not for me, Later, or Yes. A rolled match adds the animal to your matches list. Later shows this card again after you see other animals in this round.',
  'explore.swipe.notForMeAria': 'Not for me',
  'explore.swipe.laterAria':
    'Decide later; this animal is shown again after the others in this round',
  'explore.swipe.yesAria': 'Yes, try for a match',
  'explore.swipe.laterHint': 'Later = see again this round. Not a no.',

  'explore.match.rare': 'Rare match!',
  'explore.match.normal': 'It’s a match!',
  'explore.match.line0': 'The vibe check passed. (It’s mostly you.)',
  'explore.match.line1':
    'A solid match — your list of wins just got more interesting.',
  'explore.match.line2':
    'We’re not an algorithm, but if we were, this would be a “chef’s kiss”.',
  'explore.match.line3': 'Plot twist: you have excellent taste. Who knew?',
  'explore.match.line4':
    'This one was meant to be. Probably. We’re not scientists.',
  'explore.match.line5':
    'Look at you, collecting cuties like they’re trading cards.',
  'explore.match.openAnimal': 'Open {{name}}',
  'explore.match.keepSwiping': 'Keep swiping',
} as const
