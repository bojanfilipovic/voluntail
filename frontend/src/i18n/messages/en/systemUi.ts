/** Feedback dialog, CMS prompts, error surfaces, animal CMS toolbar. */
export const enSystemUi = {
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
} as const
