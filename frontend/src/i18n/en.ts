import type { MessageKey } from '@/i18n/nl'

/** English UI copy — must define every `MessageKey`. */
export const enMessages: Record<MessageKey, string> = {
  'nav.mapDirectory': 'Map & directory',
  'nav.adopteren': 'Adoption',
  'nav.volunteer': 'Volunteering',
  'nav.howItWorks': 'How it works',
  'nav.explore': 'Explore',

  'locale.switcherAria': 'Choose language',
  'locale.dialogTitle': 'Language',
  'locale.nl': 'Nederlands',
  'locale.en': 'English',

  'seo.home.title':
    'Voluntail — Animal shelters in the Netherlands (map & directory)',
  'seo.home.description':
    'Orientation hub: shelters on a map or in a list. Volunteering and adoption always happen via the shelter’s official site (e.g. DOA)—Voluntail links through. Pilot with DOA and ROZ.',

  'seo.adopteren.title': 'Adopt via a shelter — Voluntail',
  'seo.adopteren.description':
    'Voluntail helps you find animal shelters in the Netherlands. Adoption always goes through the shelter itself: browse animals on the map and open the official adoption link.',

  'seo.volunteer.title': 'Volunteer at an animal shelter — Voluntail',
  'seo.volunteer.description':
    'Find shelters in the Netherlands on the map. You sign up as a volunteer with the shelter itself—Voluntail links to official volunteer and contact pages where available.',

  'seo.howItWorks.title': 'How Voluntail works — map, directory and Explore',
  'seo.howItWorks.description':
    'Voluntail is a Dutch orientation hub: shelters and animals on the map, with links to official sources. Read how the directory and Explore fit together.',

  'seo.exploreRedirect.title': 'Explore — swipe available animals — Voluntail',
  'seo.exploreRedirect.description':
    'Swipe anonymously through published animals on Voluntail. Shortlist in your browser; adoption and next steps go through the shelter.',

  'notFound.metaTitle': 'Page not found — Voluntail',
  'notFound.metaDescription': 'This page does not exist on Voluntail.',
  'notFound.h1': 'Page not found',
  'notFound.body': 'This URL is not part of Voluntail.',
  'notFound.cta': 'Back to Voluntail',

  'discovery.intro.modalBeforeLink': 'Please use ',
  'discovery.intro.modalLink': 'Share feedback',
  'discovery.intro.modalAfterLink':
    ' so I can learn what works and what you’d like me to add. Love, Bojan 🫶',
  'discovery.intro.inline':
    'Please use Share feedback so I can learn what works and what you’d like me to add. Love, Bojan 🫶',
  'discovery.exploreIntro':
    'Swipe through animals listed as available and see if you land a match! <3',
  'discovery.shareFeedback': 'Share feedback',
  'discovery.themeAria': 'Theme: {{theme}}',
  'discovery.welcomeAria': 'Welcome message',
  'discovery.morePagesAria': 'More pages',
  'discovery.morePagesTitle': 'More pages',
  'discovery.footerNavAria': 'Information pages',
  'discovery.explore': 'Explore',
  'discovery.backToMap': 'Back to map',

  'welcome.title': 'Welcome to Voluntail',
  'welcome.description': 'Discover animal shelters and ways to help.',
  'welcome.li1':
    'Browse shelters on the map — find volunteer sign-ups and donation links',
  'welcome.li2':
    'Try Explore — swipe through available animals and build a shortlist',
  'welcome.li3':
    'Share feedback anytime — this is a pilot and your input shapes what comes next',
  'welcome.go': 'Go',

  'stats.shelters': 'shelters',
  'stats.animals': 'animals',
  'stats.hearts': 'hearts given',

  'directory.mapAria': 'Map of shelters',
  'directory.sectionAria': 'Directory',
  'directory.tablistAria': 'Directory view',
  'directory.listAria': 'Shelter and animal directory list',
  'directory.tab.shelters': 'Shelters',
  'directory.tab.animals': 'Animals',
  'directory.surpriseMe': 'Surprise me',

  'map.publicToolbarAria': 'Public map actions',
  'map.suggestShelter': 'Suggest a shelter',
  'map.enterDetails': 'Enter details',
  'map.cancel': 'Cancel',
  'map.tapToPlace': 'Tap the map to place a pin.',
  'map.pinSetSuggest': 'Pin set — Enter details or tap to move.',
  'map.cmsToolbarAria': 'Shelter CMS',
  'map.addPin': 'Add pin',
  'map.draftPinCms': 'Draft pin set — Enter details or tap to move.',

  'loading.map': 'Loading map…',
  'loading.explore': 'Loading Explore…',
  'loading.exploreDeck': 'Loading deck…',

  'feedback.title': 'Pilot feedback',
  'feedback.description': 'Share what works, what doesn’t, and what you’d like next.',
  'feedback.about': 'About:',
  'feedback.messageLabel': 'Your message',
  'feedback.messagePlaceholder': 'Your thoughts…',
  'feedback.tooLong': 'Message exceeds {{max}} characters.',
  'feedback.charCount': '{{n}} / {{max}} characters',
  'feedback.contactLabel': 'How to reach you (optional)',
  'feedback.contactHint':
    'Leave blank if you prefer — your message above still counts either way.',
  'feedback.contactPlaceholder': 'Name, email, or handle',
  'feedback.contactCharCount': '{{n}} / {{max}} characters',
  'feedback.errorGeneric': 'Something went wrong.',
  'feedback.success': 'Thanks — we got your feedback!',
  'feedback.close': 'Close',
  'feedback.sending': 'Sending…',
  'feedback.send': 'Send feedback',

  'cms.confirmRemoveAnimal': 'Remove this animal from the directory?',

  'errorBoundary.body':
    'Something went wrong while loading the map or directory. You can try again or reload the page.',
  'errorBoundary.tryAgain': 'Try again',
  'errorBoundary.reload': 'Reload page',

  'animalCms.toolbarAria': 'Animal CMS',
  'animalCms.addAnimal': 'Add animal',

  'shelterList.sectionAria': 'Shelter list',
  'shelterList.loading': 'Loading shelters…',
  'shelterList.empty': 'No shelters found.',
  'shelterList.websiteAria': 'Website (opens in new tab)',
  'shelterList.website': 'Website',
  'shelterList.animals': 'Animals',

  'animalList.sectionAria': 'Animal list',
  'animalList.loading': 'Loading animals…',
  'animalList.empty.default': 'No animals found.',
  'animalList.empty.favorites': 'No favorites yet.',
  'animalList.empty.matches': 'No matches yet.',
  'animalList.favorites': 'My favorites ({{count}})',
  'animalList.matches': 'My matches ({{count}})',
  'animalList.new': 'New',
  'animalList.matchBadge': 'Match',
  'animalList.unpublished': 'Unpublished',
  'animalList.loadMore': 'Load more',
  'animalList.loadingMore': 'Loading…',
  'animalList.moreFilters': 'More filters',
  'animalList.allCities': 'All cities',
  'animalList.allShelters': 'All shelters',
  'animalList.filterCityAria': 'Filter by city',
  'animalList.filterShelterAria': 'Filter by shelter',
  'animalList.status.available': 'Available',
  'animalList.status.reserved': 'Reserved',
  'animalList.status.adopted': 'Adopted',

  'outbound.volunteer': 'Volunteer',
  'outbound.donate': 'Donate',

  'animalDetail.readMore': 'Read more',
  'animalDetail.readLess': 'Show less',
  'animalDetail.showFullAria': 'Show full description and links',
  'animalDetail.mobileTeaserFallback': 'Shelter & external listing',
  'animalDetail.unpublishedBanner':
    'Unpublished — only visible with CMS key in the API.',
  'animalDetail.moreInfo': 'More info',
  'animalDetail.shelterDetails': 'Shelter details',
  'animalDetail.hideShelterDetails': 'Hide shelter details',
  'animalDetail.share': 'Share',
  'animalDetail.linkCopied': 'Link copied!',
  'animalDetail.shareAnimalAria': 'Share animal link',
  'animalDetail.closeAria': 'Close',
  'animalDetail.footerActionsAria': 'Animal actions',
  'animalDetail.cmsAria': 'Curation',
  'animalDetail.edit': 'Edit',
  'animalDetail.unpublish': 'Unpublish',
  'animalDetail.publish': 'Publish',
  'animalDetail.updating': 'Updating…',
  'animalDetail.delete': 'Delete',
  'animalDetail.removing': 'Removing…',
  'animalDetail.shareMessage': 'Help {{name}} find a home!',

  'shelterDetail.editDetails': 'Edit details',
  'shelterDetail.removePin': 'Remove pin',
  'shelterDetail.actionsAria': 'Directory actions',
  'shelterDetail.cmsAria': 'Curation',
  'shelterDetail.closeAria': 'Close',

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

  'marketing.layout.backAria': 'Back to map and directory',
  'marketing.layout.menuAria': 'Information pages menu',
  'marketing.layout.navTitle': 'Navigation',
  'marketing.layout.footerNavAria': 'Footer navigation',
  'marketing.layout.footerAria': 'Footer',
  'marketing.themeAria': 'Theme: {{theme}}',

  'page.adopteren.h1': 'Adoption',
  'page.adopteren.intro':
    'Want to adopt? On Voluntail you can see which shelters and (published) animals are visible in the pilot. The real adoption process — signing up, meeting, terms — always happens at the shelter, via their official website or their own process.',
  'page.adopteren.help.h2': 'How Voluntail helps',
  'page.adopteren.help.li1': 'Orientation on the map and in the list: where is each shelter?',
  'page.adopteren.help.li2':
    'Browse animals and click through to the shelter’s official page.',
  'page.adopteren.help.li3':
    'In Explore you can anonymously swipe published animals; a match only means it fits your filters — no Voluntail account.',
  'page.adopteren.next.h2': 'Next step',
  'page.adopteren.next.before': 'Go to the ',
  'page.adopteren.next.mapLink': 'map and directory',
  'page.adopteren.next.between': ' or try ',
  'page.adopteren.next.exploreLink': 'Explore',
  'page.adopteren.next.after': '.',

  'page.volunteer.h1': 'Volunteering',
  'page.volunteer.intro':
    'Shelters often depend on volunteers. Voluntail is a starting point: you see where organisations are and can click through to their site for volunteer info, sign-up, or contact.',
  'page.volunteer.not.h2': 'What Voluntail doesn’t do',
  'page.volunteer.not.body':
    'We don’t place you as a volunteer or schedule shifts. That stays with the shelter — so their process stays leading and trustworthy.',
  'page.volunteer.start.h2': 'Get started',
  'page.volunteer.start.before': 'Open the ',
  'page.volunteer.start.mapLink': 'map',
  'page.volunteer.start.after':
    ', pick a shelter, and use the official links (e.g. sign-up or the shelter’s website).',

  'page.howItWorks.h1': 'How it works',
  'page.howItWorks.intro':
    'Voluntail bundles public information about animal shelters and — where available — published animals from the pilot. The goal is to reach the right official route faster.',
  'page.howItWorks.directory.h2': 'Directory (map & list)',
  'page.howItWorks.directory.body':
    'On the home page you combine map and lists. Open a shelter or animal for details, then use the outbound links to the shelter (adoption, volunteer, donation, etc.) where filled in.',
  'page.howItWorks.explore.h2': 'Explore',
  'page.howItWorks.explore.body':
    'Explore is a separate screen: you choose preferences and swipe published animals. There are no accounts; a shortlist lives in your browser (sessionStorage). “Match” is filter fit, not a server-side recommendation algorithm.',
  'page.howItWorks.feedback.h2': 'Feedback',
  'page.howItWorks.feedback.body':
    'Something wrong or missing a shelter? Use “Share feedback” or the suggestion flow in the app so it can be triaged.',
  'page.howItWorks.footer.mapLink': 'Back to the map',
  'page.howItWorks.footer.exploreLink': 'Go to Explore',
}
